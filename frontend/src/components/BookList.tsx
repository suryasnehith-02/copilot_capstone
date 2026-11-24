import { useState } from 'react'
import { ApiError, updateAvailability } from '../api/client'
import type { Book } from '../api/types'
import { MAX_AVAILABLE_COPIES } from '../constants'

interface BookListProps {
  books: Book[]
  onUpdated: (book: Book) => void
  onReload: () => void
}

const STALE_NOTICE = 'This book was changed by someone else. The list has been reloaded; try again.'

interface RowProps {
  book: Book
  onUpdated: (book: Book) => void
  onStale: () => void
}

function BookRow({ book, onUpdated, onStale }: RowProps) {
  const [copies, setCopies] = useState(String(book.availableCopies))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setError(null)
    const value = Number(copies)
    if (copies.trim() === '' || !Number.isInteger(value) || value < 0 || value > MAX_AVAILABLE_COPIES) {
      setError('Available copies must be a whole number from 0 to 1000000.')
      return
    }
    setSaving(true)
    try {
      const updated = await updateAvailability(book.id, { availableCopies: value, version: book.version })
      onUpdated(updated)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        onStale()
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not save. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <tr>
      <td>{book.title}</td>
      <td>{book.author.name}</td>
      <td>
        <label htmlFor={`copies-${book.id}`}>Available copies for {book.title}</label>
        <input
          id={`copies-${book.id}`}
          type="number"
          min={0}
          max={MAX_AVAILABLE_COPIES}
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `copies-error-${book.id}` : undefined}
        />
        <button type="button" onClick={save} disabled={saving}>
          Save copies
        </button>
        {error && <p id={`copies-error-${book.id}`} role="alert">{error}</p>}
      </td>
    </tr>
  )
}

export function BookList({ books, onUpdated, onReload }: BookListProps) {
  const [notice, setNotice] = useState<string | null>(null)

  function handleStale() {
    setNotice(STALE_NOTICE)
    onReload()
  }

  if (books.length === 0) {
    return <p>No books yet. Add the first one below.</p>
  }

  return (
    <section aria-label="Books">
      <h2>Books</h2>
      {notice && <p role="status">{notice}</p>}
      <table>
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Author</th>
            <th scope="col">Availability</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <BookRow key={`${book.id}-${book.version}`} book={book} onUpdated={onUpdated} onStale={handleStale} />
          ))}
        </tbody>
      </table>
    </section>
  )
}
