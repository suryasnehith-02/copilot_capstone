import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createBook } from '../api/client'
import type { Author, Book } from '../api/types'
import { AddBookForm } from './AddBookForm'

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>()
  return { ...actual, createBook: vi.fn() }
})

const authors: Author[] = [
  { id: 7, name: 'Jane Austen', biography: null, createdAt: '', updatedAt: '' },
]

const createdBook: Book = {
  id: 1,
  title: 'Emma',
  isbn: null,
  availableCopies: 2,
  author: { id: 7, name: 'Jane Austen' },
  version: 0,
  createdAt: '',
  updatedAt: '',
}

describe('AddBookForm', () => {
  beforeEach(() => {
    vi.mocked(createBook).mockReset()
  })

  it('shows validation messages and does not submit when required fields are missing', async () => {
    const user = userEvent.setup()
    render(<AddBookForm authors={authors} onCreated={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Add book' }))

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(screen.getByText('Select an author.')).toBeInTheDocument()
    expect(createBook).not.toHaveBeenCalled()
  })

  it('submits a new author inline and reports the created book', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()
    vi.mocked(createBook).mockResolvedValue(createdBook)
    render(<AddBookForm authors={authors} onCreated={onCreated} />)

    await user.type(screen.getByLabelText('Title'), 'Emma')
    await user.selectOptions(screen.getByLabelText('Author'), 'new')
    await user.type(screen.getByLabelText('New author name'), 'Jane Austen')
    await user.click(screen.getByRole('button', { name: 'Add book' }))

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(createdBook))
    expect(createBook).toHaveBeenCalledWith({
      title: 'Emma',
      availableCopies: 0,
      newAuthor: { name: 'Jane Austen' },
    })
  })
})
