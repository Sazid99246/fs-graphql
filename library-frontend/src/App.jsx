import { useState } from 'react'

import { gql } from '@apollo/client'
import {
  useApolloClient,
  useSubscription,
} from '@apollo/client/react'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendation from './components/Recommendation'

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      published
      genres
      id
      author {
        name
      }
    }
  }
`

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

const App = () => {
  const [page, setPage] = useState('authors')
  const [user, setUser] = useState(null)

  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const book = data.data?.bookAdded

      if (!book) {
        return
      }

      client.cache.updateQuery(
        {
          query: ALL_BOOKS,
          variables: { genre: null },
        },
        (data) => {
          if (!data) {
            return data
          }

          return {
            allBooks: data.allBooks.concat(book),
          }
        }
      )
    },
  })

  const logout = () => {
    localStorage.removeItem('library-user-token')
    setUser(null)
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>

        {user ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommendation')}>recommendations</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Authors
        show={page === 'authors'}
        user={user}
      />

      <Books show={page === 'books'} />

      <NewBook
        show={page === 'add' && user !== null}
      />

      <LoginForm
        show={page === 'login'}
        setUser={setUser}
        setPage={setPage}
      />

      <Recommendation
        show={page === 'recommendation' && user !== null}
      />
    </div>
  )
}

export default App
