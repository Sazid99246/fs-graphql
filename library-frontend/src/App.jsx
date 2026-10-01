import { useState } from 'react'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendation from './components/Recommendation'

const App = () => {
  const [page, setPage] = useState('authors')
  const [user, setUser] = useState(null)

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
