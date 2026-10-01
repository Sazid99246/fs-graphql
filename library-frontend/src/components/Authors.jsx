import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react'
import { useState } from 'react'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

const EDIT_AUTHOR = gql`
  mutation EditAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
      bookCount
    }
  }
`

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const result = useQuery(ALL_AUTHORS)

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
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

  const authors = result.data.allAuthors

  const submit = async (event) => {
    event.preventDefault()

    await editAuthor({
      variables: {
        name,
        setBornTo: Number(born),
      },
    })

    setName('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>

          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {props.user && (
        <>
          <h2>set birth year</h2>
          <form onSubmit={submit}>
            <div>
              <label>
                name
                <input
                  value={name}
                  onChange={({ target }) => setName(target.value)}
                />
              </label>
            </div>

            <div>
              <label>
                name
                <select
                  value={name}
                  onChange={({ target }) => setName(target.value)}
                >
                  <option value="">select author...</option>

                  {authors.map((author) => (
                    <option key={author.name} value={author.name}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button type="submit">set birth year</button>
          </form>
        </>
      )}
    </div>
  )
}

export default Authors
