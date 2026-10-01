import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const ME = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`

const BOOKS_BY_GENRE = gql`
  query BooksByGenre($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`

const Recommendation = ({ show }) => {
  const meResult = useQuery(ME)

  const genre = meResult.data?.me?.favoriteGenre

  const booksResult = useQuery(BOOKS_BY_GENRE, {
    variables: {
      genre,
    },
    skip: !genre,
  })

  if (!show) {
    return null
  }

  if (meResult.loading || booksResult.loading) {
    return <div>loading...</div>
  }

  if (meResult.error) {
    return <div>{meResult.error.message}</div>
  }

  if (booksResult.error) {
    return <div>{booksResult.error.message}</div>
  }

  const books = booksResult.data.allBooks

  return (
    <div>
      <h2>recommendations</h2>

      <p>
        books in your favorite genre <strong>{genre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>

          {books.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendation
