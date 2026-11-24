# Implementation Plan: Book Management System

Status: Draft. Awaiting user approval (Stage 4).
Inputs: [requirements.md](./requirements.md), [architecture.md](./architecture.md), [design-review.md](./design-review.md) (decisions D-006).

## Overview

The plan builds the three in-scope features (authors, books, availability) as a Spring Boot 3.x backend (Java 21, Maven, JPA, Flyway, H2 file DB) and a React + TypeScript + Vite frontend. The backend ships first. The frontend is built against the approved API. Each task is one coherent change with testable acceptance criteria. Task IDs are T-001 to T-024.

Applied design decisions:
- DR-01: unique author names (case-insensitive), 409 on duplicate.
- DR-02: `POST /books` creates an inline author in one transaction.
- DR-03: `Book.version` with optimistic locking; stale PATCH returns 409.
- DR-04: Spring Boot serves the React build; no CORS.
- DR-05: bind to localhost; no authentication (accepted risk).
- DR-06 to DR-14: checks, input rules, error codes, configuration, nested author shape, `updatedAt`, portable SQL.

Paths below are relative to the repository root. Backend base package: `com.example.bookmanagement` (confirm in T-001).

## Task List (dependency order)

| ID | Task | Files | Depends on | Priority | Requirements | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- |
| T-001 | Scaffold the Spring Boot project | `backend/pom.xml`, `backend/src/main/java/com/example/bookmanagement/BookManagementApplication.java` | none | P1 | NFR-003 | `mvn -q -f backend/pom.xml test` runs and the context loads. Java 21, Spring Web, Validation, Data JPA, Flyway, H2 declared. |
| T-002 | Scaffold the React + TypeScript + Vite project | `frontend/package.json`, `frontend/vite.config.ts`, `frontend/src/main.tsx`, `frontend/tsconfig.json` | none | P1 | NFR-004 | `npm run build` in `frontend` succeeds. `npm test` runs Vitest. |
| T-003 | Configure application settings | `backend/src/main/resources/application.yml`, `application-dev.yml` | T-001 | P1 | NFR-002, NFR-003, DR-05, DR-09, DR-10 | Server binds to `localhost` by default. H2 file path is configurable. H2 console is enabled only in the `dev` profile. Log level is configurable. No secrets in files. |
| T-004 | Create the database schema (Flyway V1) | `backend/src/main/resources/db/migration/V1__create_author_book.sql` | T-003 | P1 | NFR-003, FR-001, FR-002, DR-01, DR-03, DR-06, DR-14 | Migration creates `author` (unique index on `lower(trim(name))`) and `book` (FK to author, `CHECK (available_copies >= 0)`, `version` column). Only portable SQL types. Migration applies on a fresh H2 file. |
| T-005 | Implement the author feature (backend) | `backend/src/main/java/.../author/Author.java`, `AuthorRepository.java`, `AuthorService.java`, `CreateAuthorRequest.java`, `AuthorResponse.java` | T-004 | P1 | FR-001, FR-006, NFR-001, DR-01, DR-07 | Name is trimmed, required, 1 to 200 characters. Biography is optional, up to 2000 characters. Duplicate name (case-insensitive) raises a conflict error. `updatedAt` is set. Service unit tests pass. |
| T-006 | Implement the book feature (backend) | `backend/src/main/java/.../book/Book.java`, `BookRepository.java`, `BookService.java`, `CreateBookRequest.java`, `BookResponse.java` | T-005 | P1 | FR-002, FR-003, FR-005, FR-006, NFR-001, DR-02, DR-07, DR-11 | Title trimmed, required, 1 to 300 characters. Exactly one of `authorId` or `newAuthor` is accepted, otherwise 400. Unknown `authorId` raises not-found. `newAuthor` and the book are created in one transaction. Failed book save leaves no author. Response `author` is `{ id, name }`. |
| T-007 | Implement availability logic (backend) | `backend/src/main/java/.../book/AvailabilityService.java`, `AvailabilityRequest.java` | T-006 | P1 | FR-004, NFR-001, DR-03, DR-06 | `availableCopies` is an integer from 0 to 1000000. Update requires `version`; a stale version raises a conflict error. A successful update increments `version`. |
| T-008 | Expose the author endpoints | `backend/src/main/java/.../author/AuthorController.java` | T-005 | P1 | FR-001, FR-006 | `POST /api/authors` returns 201, `GET /api/authors` returns 200. Duplicate returns 409. Invalid field returns 400. |
| T-009 | Expose the book endpoints | `backend/src/main/java/.../book/BookController.java` | T-006 | P1 | FR-002, FR-003, FR-005, FR-006 | `POST /api/books` returns 201 (with `newAuthor` or `authorId`). `GET /api/books` and `GET /api/books/{id}` return the book with nested `author`. Unknown ID returns 404. |
| T-010 | Expose the availability endpoint | `backend/src/main/java/.../book/BookController.java` (same controller as T-009) | T-007, T-009 | P1 | FR-004, FR-010 | `PATCH /api/books/{id}/availability` with `{ availableCopies, version }` returns 200 with a new `version`. Stale version returns 409. Invalid value returns 400. Unknown book returns 404. |
| T-011 | Map errors to safe responses | `backend/src/main/java/.../error/ApiExceptionHandler.java`, `ErrorResponse.java` | T-007 | P1 | NFR-002, DR-08 | Every error uses `{ error: { code, message } }` with codes `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`. Malformed JSON returns 400. Unsupported media type returns 415. Unhandled errors return a generic 500 with no stack trace. |
| T-012 | Serve the React build from Spring Boot | `frontend/vite.config.ts`, `backend/pom.xml` | T-001, T-002 | P2 | DR-04, NFR-005 | `vite build` output is copied into the Spring Boot static resources during the Maven build. A request to `/` returns the UI and `/api/...` returns the API. No CORS configuration is needed. |
| T-013 | Add backend unit and MockMvc tests for authors | `backend/src/test/java/.../author/AuthorServiceTest.java`, `AuthorControllerTest.java` | T-008 | P1 | NFR-005, FR-001, FR-006, DR-01 | Covers valid create, invalid name, duplicate name (409), list. Tests fail if the uniqueness rule is removed. |
| T-014 | Add backend tests for books | `backend/src/test/java/.../book/BookServiceTest.java`, `BookControllerTest.java` | T-009 | P1 | NFR-005, FR-002, FR-003, FR-005, DR-02 | Covers create with `authorId`, create with `newAuthor`, both or neither provided (400), unknown author (404), rollback on failed book save (no author left), get by ID, 404. |
| T-015 | Add backend tests for availability and errors | `backend/src/test/java/.../book/AvailabilityControllerTest.java`, `backend/src/test/java/.../error/ApiExceptionHandlerTest.java` | T-010, T-011 | P1 | NFR-005, FR-004, FR-010, NFR-002, DR-03, DR-08 | Covers valid update, bounds 0 and 1000000 accepted, -1 and 1000001 rejected, stale version (409), version increments, malformed JSON (400), no stack trace in 500 response. |
| T-016 | Add a persistence test | `backend/src/test/java/.../PersistenceIT.java` | T-004, T-010 | P2 | NFR-003 | Writes an author and book to a temporary H2 file, restarts the context against the same file, and reads both back. |
| T-017 | Create the API client with error mapping | `frontend/src/api/client.ts`, `frontend/src/api/types.ts` | T-002 | P1 | FR-008, FR-009, NFR-001 | Functions for list and create authors and books, list books, and update availability. Maps the error body to a message. Typed responses. |
| T-018 | Build the book list with copies control | `frontend/src/components/BookList.tsx` | T-017 | P1 | FR-009, FR-010, NFR-004 | Shows title, author name, and available copies. Copies control is a labeled number input with a save button. Stale version (409) reloads the row and shows a notice. |
| T-019 | Build the add-book form | `frontend/src/components/AddBookForm.tsx` | T-017 | P1 | FR-007, FR-008, NFR-004, DR-02 | Title, ISBN, copies, and author (select existing or enter new name). Validation messages appear before submit and after an error response. All controls have labels and are keyboard accessible. Submits one `POST /api/books`. |
| T-020 | Assemble the app shell | `frontend/src/App.tsx`, `frontend/src/main.tsx` | T-018, T-019 | P1 | FR-007, FR-009 | The list and form are on one page. After a successful add, the list shows the new book. |
| T-021 | Add frontend unit tests | `frontend/src/components/*.test.tsx`, `frontend/src/api/client.test.ts` | T-018, T-019 | P1 | NFR-005, FR-008, FR-010 | Vitest covers validation messages, error mapping (409 message), and the copies control. |
| T-022 | Add end-to-end tests | `frontend/e2e/books.spec.ts`, `frontend/playwright.config.ts` | T-020, T-012 | P2 | NFR-005, FR-007, FR-009, FR-010, NFR-004 | Playwright covers: add a book with a new author, see it in the list, change copies, and submit the form using only the keyboard. |
| T-023 | Document how to run and test | `README.md` | T-012, T-020 | P2 | NFR-005 | README lists the run and test commands for backend and frontend, the H2 file location, and the localhost binding. No secrets. |
| T-024 | Run the full verification pass | `docs/verification-report.md` (written in Verification stage) | T-013 to T-023 | P1 | NFR-005 | Executed commands and results recorded. No results are claimed without a run. |

## Blocked Tasks

Blocked means the task waits on an unfinished prerequisite. At planning time, every task is pending. The tasks below cannot start until the named task finishes.

| Task | Blocked by |
| --- | --- |
| T-003 | T-001 |
| T-004 | T-003 |
| T-005 | T-004 |
| T-006 | T-005 |
| T-007 | T-006 |
| T-008 | T-005 |
| T-009 | T-006 |
| T-010 | T-007, T-009 |
| T-011 | T-007 |
| T-012 | T-001, T-002 |
| T-013 | T-008 |
| T-014 | T-009 |
| T-015 | T-010, T-011 |
| T-016 | T-004, T-010 |
| T-017 | T-002 |
| T-018 | T-017 |
| T-019 | T-017 |
| T-020 | T-018, T-019 |
| T-021 | T-018, T-019 |
| T-022 | T-020, T-012 |
| T-023 | T-012, T-020 |
| T-024 | T-013 to T-023 |

Parallel work: the backend chain (T-001 to T-011) and the frontend start (T-002, T-017) can run in parallel. T-012 joins them.

## Test Strategy

- Backend unit tests (JUnit 5, Mockito): service rules (uniqueness, inline author rollback, version check, bounds).
- Backend API tests (Spring Boot Test with MockMvc): status codes, error body shape, validation, and the 409 and 404 paths.
- Persistence test (T-016): data survives a context restart with the H2 file.
- Frontend unit tests (Vitest with Testing Library): validation messages, error mapping, copies control.
- End-to-end tests (Playwright): the three in-scope user flows, plus keyboard-only form submission (NFR-004).
- Every test must fail if its rule is removed. Tests are added only for behavior in scope.
- Commands are recorded only after they are run, in the Verification report.

## Requirement Coverage

| Requirement | Tasks |
| --- | --- |
| FR-001 | T-005, T-008, T-013 |
| FR-002 | T-004, T-006, T-009, T-014 |
| FR-003 | T-006, T-009, T-014 |
| FR-004 | T-007, T-010, T-015 |
| FR-005 | T-006, T-009, T-014 |
| FR-006 | T-005, T-006, T-008, T-009 |
| FR-007 | T-019, T-020, T-022 |
| FR-008 | T-017, T-019, T-021 |
| FR-009 | T-017, T-018, T-020, T-022 |
| FR-010 | T-007, T-010, T-018, T-021, T-022 |
| NFR-001 | T-005, T-006, T-007, T-017 |
| NFR-002 | T-003, T-011, T-015 |
| NFR-003 | T-001, T-003, T-004, T-016 |
| NFR-004 | T-002, T-018, T-019, T-022 |
| NFR-005 | T-013 to T-016, T-021, T-022, T-024 |
