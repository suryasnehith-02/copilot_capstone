import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError, updateAvailability } from '../api/client'
import type { Book } from '../api/types'
import { BookList } from './BookList'

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>()
  return { ...actual, updateAvailability: vi.fn() }
})

const book: Book = {
  id: 3,
  title: 'Dune',
  isbn: null,
  availableCopies: 1,
  author: { id: 1, name: 'Frank Herbert' },
  version: 4,
  createdAt: '',
  updatedAt: '',
}

describe('BookList copies control', () => {
  it('saves the new copies value with the current version', async () => {
    const user = userEvent.setup()
    const onUpdated = vi.fn()
    vi.mocked(updateAvailability).mockResolvedValue({ ...book, availableCopies: 5, version: 5 })
    render(<BookList books={[book]} onUpdated={onUpdated} onReload={vi.fn()} />)

    const input = screen.getByLabelText('Available copies for Dune')
    await user.clear(input)
    await user.type(input, '5')
    await user.click(screen.getByRole('button', { name: 'Save copies' }))

    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ availableCopies: 5, version: 5 })))
    expect(updateAvailability).toHaveBeenCalledWith(3, { availableCopies: 5, version: 4 })
  })

  it('rejects an out-of-range value without calling the API', async () => {
    const user = userEvent.setup()
    render(<BookList books={[book]} onUpdated={vi.fn()} onReload={vi.fn()} />)

    const input = screen.getByLabelText('Available copies for Dune')
    fireEvent.change(input, { target: { value: '-1' } })
    await user.click(screen.getByRole('button', { name: 'Save copies' }))

    expect(screen.getByRole('alert')).toHaveTextContent('whole number from 0 to 1000000')
    expect(updateAvailability).not.toHaveBeenCalled()
  })

  it('reloads the list and shows a notice on a stale version (409)', async () => {
    const user = userEvent.setup()
    const onReload = vi.fn()
    vi.mocked(updateAvailability).mockRejectedValue(new ApiError(409, 'CONFLICT', 'changed'))
    render(<BookList books={[book]} onUpdated={vi.fn()} onReload={onReload} />)

    await user.click(screen.getByRole('button', { name: 'Save copies' }))

    await waitFor(() => expect(onReload).toHaveBeenCalled())
    expect(screen.getByRole('status')).toHaveTextContent('changed by someone else')
  })
})
