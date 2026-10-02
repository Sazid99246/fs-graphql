const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')

const { makeExecutableSchema } = require('@graphql-tools/schema')

const jwt = require('jsonwebtoken')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')

const startServer = async (port) => {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  const server = new ApolloServer({
    schema,
  })

  const { url } = await startStandaloneServer(server, {
    listen: { port },

    context: async ({ req }) => {
      const auth = req.headers.authorization

      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const token = auth.substring(7)

        try {
          const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
          )

          return {
            currentUser: decodedToken,
          }
        } catch (error) {
          return {}
        }
      }

      return {}
    },
  })

  const wsServer = new WebSocketServer({
    port: port + 1,
    path: '/graphql',
  })

  useServer(
    {
      schema,

      context: async (ctx) => {
        const auth = ctx.connectionParams?.authorization

        if (auth && auth.toLowerCase().startsWith('bearer ')) {
          const token = auth.substring(7)

          try {
            const decodedToken = jwt.verify(
              token,
              process.env.JWT_SECRET
            )

            return {
              currentUser: decodedToken,
            }
          } catch (error) {
            return {}
          }
        }

        return {}
      },
    },
    wsServer
  )

  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ws://localhost:${port + 1}/graphql`)
}

module.exports = startServer
