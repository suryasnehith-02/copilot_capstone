import { useState, type FormEvent } from 'react'
import { ApiError, createBook } from '../api/client'
import type { Author, Book, CreateBookInput } from '../api/types'
import { MAX_AVAILABLE_COPIES } from '../constants'

interface AddBookFormProps {
  authors: Author[]
  onCreated: (book: Book) => void
}

interface FormErrors {
  title?: string
  isbn?: string
  availableCopies?: string
  author?: string
}

const NEW_AUTHOR = 'new'

function validate(
  title: string,
  isbn: string,
  copies: string,
  authorChoice: string,
  newAuthorName: string,
): FormErrors {
  const errors: FormErrors = {}
  if (!title.trim()) {
    errors.title = 'Title is required.'
  } else if (title.trim().length > 300) {
    errors.title = 'Title must be at most 300 characters.'
  }
  if (isbn.trim().length > 20) {
    errors.isbn = 'ISBN must be at most 20 characters.'
  }
  const copiesValue = Number(copies)
  if (copies.trim() === '' || !Number.isInteger(copiesValue) || copiesValue < 0 || copiesValue > MAX_AVAILABLE_COPIES) {
    errors.availableCopies = 'Available copies must be a whole number from 0 to 1000000.'
  }
  if (!authorChoice) {
    errors.author = 'Select an author.'
  } else if (authorChoice === NEW_AUTHOR && !newAuthorName.trim()) {
    errors.author = 'Enter the new author name.'
  }
  return errors
}

export function AddBookForm({ authors, onCreated }: AddBookFormProps) {
  const [title, setTitle] = useState('')
  const [isbn, setIsbn] = useState('')
  const [copies, setCopies] = useState('0')
  const [authorChoice, setAuthorChoice] = useState('')
  const [newAuthorName, setNewAuthorName] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)
    const validation = validate(title, isbn, copies, authorChoice, newAuthorName)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      return
    }

    const input: CreateBookInput = {
      title: title.trim(),
      availableCopies: Number(copies),
      ...(isbn.trim() ? { isbn: isbn.trim() } : {}),
      ...(authorChoice === NEW_AUTHOR
        ? { newAuthor: { name: newAuthorName.trim() } }
        : { authorId: Number(authorChoice) }),
    }

    setSubmitting(true)
    try {
      const book = await createBook(input)
      setTitle('')
      setIsbn('')
      setCopies('0')
      setAuthorChoice('')
      setNewAuthorName('')
      setErrors({})
      onCreated(book)
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Could not add the book. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form aria-label="Add a book" onSubmit={handleSubmit} noValidate>
      <h2>Add a book</h2>
      <div>
        <label htmlFor="book-title">Title</label>
        <input
          id="book-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'book-title-error' : undefined}
        />
        {errors.title && <p id="book-title-error" role="alert">{errors.title}</p>}
      </div>
      <div>
        <label htmlFor="book-isbn">ISBN (optional)</label>
        <input
          id="book-isbn"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          aria-invalid={!!errors.isbn}
          aria-describedby={errors.isbn ? 'book-isbn-error' : undefined}
        />
        {errors.isbn && <p id="book-isbn-error" role="alert">{errors.isbn}</p>}
      </div>
      <div>
        <label htmlFor="book-copies">Available copies</label>
        <input
          id="book-copies"
          type="number"
          min={0}
          max={MAX_AVAILABLE_COPIES}
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          aria-invalid={!!errors.availableCopies}
          aria-describedby={errors.availableCopies ? 'book-copies-error' : undefined}
        />
        {errors.availableCopies && <p id="book-copies-error" role="alert">{errors.availableCopies}</p>}
      </div>
      <div>
        <label htmlFor="book-author">Author</label>
        <select
          id="book-author"
          value={authorChoice}
          onChange={(e) => setAuthorChoice(e.target.value)}
          aria-invalid={!!errors.author}
          aria-describedby={errors.author ? 'book-author-error' : undefined}
        >
          <option value="">Select an author</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
          <option value={NEW_AUTHOR}>Add a new author</option>
        </select>
      </div>
      {authorChoice === NEW_AUTHOR && (
        <div>
          <label htmlFor="new-author-name">New author name</label>
          <input id="new-author-name" value={newAuthorName} onChange={(e) => setNewAuthorName(e.target.value)} />
        </div>
      )}
      {errors.author && <p id="book-author-error" role="alert">{errors.author}</p>}
      {submitError && <p role="alert">{submitError}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add book'}
      </button>
    </form>
  )
}
