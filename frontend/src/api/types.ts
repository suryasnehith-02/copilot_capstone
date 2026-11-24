export interface AuthorSummary {
  id: number
  name: string
}

export interface Book {
  id: number
  title: string
  isbn: string | null
  availableCopies: number
  author: AuthorSummary
  version: number
  createdAt: string
  updatedAt: string
}

export interface Author {
  id: number
  name: string
  biography: string | null
  createdAt: string
  updatedAt: string
}

export interface NewAuthorInput {
  name: string
  biography?: string
}

export interface CreateBookInput {
  title: string
  isbn?: string
  availableCopies: number
  authorId?: number
  newAuthor?: NewAuthorInput
}

export interface AvailabilityInput {
  availableCopies: number
  version: number
}
