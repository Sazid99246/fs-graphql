const { GraphQLError } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => await Book.countDocuments(),

    authorCount: async () => await Author.countDocuments(),

    allBooks: async (root, args) => {
      const query = {}
      if (args.author) {
          const author = await Author.findOne({ name: args.author })
          if (!author) {
          return []
          }
          query.author = author._id
      }
      if (args.genre) {
          query.genres = args.genre
      }
      return await Book.find(query).populate('author')
    },

    allAuthors: async () => {
      return Author.aggregate([
        {
          $lookup: {
            from: 'books',
            let: { authorId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$author', '$$authorId'],
                  },
                },
              },
              {
                $count: 'count',
              },
            ],
            as: 'bookCount',
          },
        },
        {
          $addFields: {
            bookCount: {
              $ifNull: [
                { $arrayElemAt: ['$bookCount.count', 0] },
                0,
              ],
            },
          },
        },
      ])
    },
    me: async (root, args, context) => {
      if (!context.currentUser) {
        return null
      }

      return await User.findById(context.currentUser.id)
    },
  },

  Author: {
    id: (author) => author._id.toString(),

    bookCount: (author) => author.bookCount,
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator(['BOOK_ADDED']),
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        })
      }
      try {
        let author = await Author.findOne({ name: args.author })
        if (!author) {
            author = new Author({
            name: args.author,
            })
            await author.save()
        }
        const book = new Book({
            title: args.title,
            published: args.published,
            author: author._id,
            genres: args.genres,
        })
        await book.save()
        const populatedBook = await book.populate('author')

        pubsub.publish('BOOK_ADDED', {
          bookAdded: populatedBook,
        })

        return populatedBook
      } catch (error) {
          throw new GraphQLError(error.message, {
            extensions: {
              code: 'BAD_USER_INPUT',
          },
        })
      }
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        })
      }
      const author = await Author.findOne({ name: args.name })

      if (!author) {
        return null
      }

      author.born = args.setBornTo

      await author.save()

      return author
    },
    createUser: async (root, args) => {
      const passwordHash = await bcrypt.hash('secret', 10)
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
        passwordHash,
      })
      return await user.save()
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user) {
          throw new GraphQLError('user not found', {
          extensions: {
              code: 'BAD_USER_INPUT',
          },
          })
      }
      const passwordCorrect = await bcrypt.compare(
          args.password,
          user.passwordHash
      )
      if (!passwordCorrect) {
          throw new GraphQLError('wrong password', {
          extensions: {
              code: 'BAD_USER_INPUT',
          },
          })
      }
      const userForToken = {
          username: user.username,
          id: user._id,
      }
      return {
          value: jwt.sign(userForToken, process.env.JWT_SECRET),
      }
    },

    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== 'test') {
        throw new GraphQLError('_resetDatabase is only available in test mode')
      }
      await Author.deleteMany({})
      await Book.deleteMany({})
      await User.deleteMany({})
      return true
    },
  },
}

module.exports = resolvers
