import { useCallback, useEffect, useState } from 'react'
import { listAuthors, listBooks } from './api/client'
import type { Author, Book } from './api/types'
import { AddBookForm } from './components/AddBookForm'
import { BookList } from './components/BookList'

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const [loadedBooks, loadedAuthors] = await Promise.all([listBooks(), listAuthors()])
      setBooks(loadedBooks)
      setAuthors(loadedAuthors)
      setLoadError(null)
    } catch {
      setLoadError('Could not load books. Check that the server is running and try again.')
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  function handleCreated() {
    void reload()
  }

  function handleUpdated(updated: Book) {
    setBooks((current) => current.map((book) => (book.id === updated.id ? updated : book)))
  }

  return (
    <main>
      <h1>Book Management</h1>
      {loadError && <p role="alert">{loadError}</p>}
      <BookList books={books} onUpdated={handleUpdated} onReload={reload} />
      <AddBookForm authors={authors} onCreated={handleCreated} />
    </main>
  )
}

export default App
