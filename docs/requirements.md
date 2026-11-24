# Requirements: Book Management System

Status: Approved by user (Stage 1). Proposed defaults for Q-01 to Q-05 were approved as written.

## Overview

The system manages a book catalogue. Only three features are in scope: adding books, adding authors, and tracking book availability. Each feature has a frontend and a backend part. The stack is not chosen yet; the Architecture stage recommends it (D-002).

### User Stories

**US-01 (Backend): Manage books, authors, and availability through an API**
As a catalogue client, I want an API to create authors, create books linked to an author, and record a book's availability, so that the catalogue data is stored and can be read back.

**US-02 (Frontend): Add books and set availability in a web UI**
As a librarian, I want a web form to add a book, select or add its author, and set its availability, so that I can maintain the catalogue from a browser without calling the API directly.

## Functional Requirements

Traceable to US-01 (backend) and US-02 (frontend).

| ID | Requirement | Story |
| --- | --- | --- |
| FR-001 | The system shall create an author with a required name and optional biography. | US-01 |
| FR-002 | The system shall create a book with a required title, a required author reference to an existing author, and an optional ISBN. | US-01 |
| FR-003 | The system shall reject a book whose author reference does not exist. | US-01 |
| FR-004 | The system shall set and update a book's availability as a count of available copies (integer, 0 or more). | US-01 |
| FR-005 | The system shall return a book with its author and availability when a book is requested by ID. | US-01 |
| FR-006 | The system shall list books and authors. | US-01 |
| FR-007 | The web UI shall provide a form to add a book with title, author (choose an existing author or add a new one), ISBN, and available copies. | US-02 |
| FR-008 | The web UI shall show validation messages for missing or invalid fields before submission and after an error response. | US-02 |
| FR-009 | The web UI shall show the book list with title, author, and available copies after a book is added. | US-02 |
| FR-010 | The web UI shall let the user change a book's available copies from the book list. | US-02 |

## Non-Functional Requirements

| ID | Requirement |
| --- | --- |
| NFR-001 | Input is validated and sanitized at the API boundary (FR-001, FR-002, FR-004). |
| NFR-002 | Errors return a clear status and message without exposing internal details or stack traces. |
| NFR-003 | Data survives an application restart (persistent storage). |
| NFR-004 | The web UI form controls are keyboard-accessible and have labels. |
| NFR-005 | Every feature in scope has automated tests for the backend and the frontend (Verification stage). |

## Constraints

- Only the three in-scope features (books, authors, availability) are built, designed, and tested. Anything else is out of scope.
- Technology-independent until the Architecture stage is approved (D-002).
- Commits and pushes happen only with explicit authorization.

## Assumptions

- A-01: Availability is a count of available copies, not a per-copy record or a check-out history.
- A-02: There is one user role (librarian or catalogue client). No login, roles, or permissions are in scope.
- A-03: An author is created first (or chosen) before a book, and one book has exactly one author.
- A-04: ISBN is optional and is not checked for format or uniqueness.
- A-05: Book and author edits and deletes are out of scope. Only create, read, list, and availability update.
- A-06: The frontend and backend are developed as separate parts of the same project.

## Open Questions

Resolved by proposed default (the user did not answer; the Requirements gate is still open until the user approves):

- Q-01: Availability is a count of available copies (A-01). Proposed.
- Q-02: No login or roles; single user role (A-02). Proposed.
- Q-03: One author per book (A-03). Proposed.
- Q-04: ISBN optional, no uniqueness or format check (A-04). Proposed.
- Q-05: No edit or delete for books and authors (A-05). Proposed.

Status: Awaiting user approval. The user has not approved this document yet.
