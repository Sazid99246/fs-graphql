import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useState } from 'react'

const Books = (props) => {
  const [genre, setGenre] = useState(null)

  const ALL_BOOKS = gql`
    query AllBooks($genre: String) {
      allBooks(genre: $genre) {
        author {
          name
        }
        id
        published
        title
        genres
      }
    }
  `

  const result = useQuery(ALL_BOOKS, {
    variables: {
      genre,
    },
  })

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  if (result.error) {
    return <div>{result.error.message}</div>
  }

  const books = result.data.allBooks

  const genres = [...new Set(books.flatMap((book) => book.genres))]


  return (
    <div>
      <h2>books</h2>
      {genre && <h3>books in genre {genre}</h3>}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>

          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={() => setGenre(null)}>
          all genres
        </button>

        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Books
