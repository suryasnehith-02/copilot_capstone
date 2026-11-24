import type { Author, AvailabilityInput, Book, CreateBookInput, NewAuthorInput } from './types'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    throw await toApiError(response)
  }
  return (await response.json()) as T
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { error?: { code?: string; message?: string } }
    return new ApiError(
      response.status,
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? FALLBACK_MESSAGE,
    )
  } catch {
    return new ApiError(response.status, 'UNKNOWN', FALLBACK_MESSAGE)
  }
}

export function listBooks(): Promise<Book[]> {
  return request<Book[]>('/api/books')
}

export function createBook(input: CreateBookInput): Promise<Book> {
  return request<Book>('/api/books', { method: 'POST', body: JSON.stringify(input) })
}

export function updateAvailability(bookId: number, input: AvailabilityInput): Promise<Book> {
  return request<Book>(`/api/books/${bookId}/availability`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function listAuthors(): Promise<Author[]> {
  return request<Author[]>('/api/authors')
}

export function createAuthor(input: NewAuthorInput): Promise<Author> {
  return request<Author>('/api/authors', { method: 'POST', body: JSON.stringify(input) })
}
