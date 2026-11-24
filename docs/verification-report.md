# Verification Report

Scope: the Book Management System (tasks T-001 to T-024 in [impl-plan.md](./impl-plan.md)). Only commands that were actually run appear here.

## Summary

| Area | Command | Result |
| --- | --- | --- |
| Backend unit and API tests | `mvn test` (in `backend/`) | 16 run, 0 failures, 0 errors. BUILD SUCCESS |
| Backend persistence | `BookPersistenceTests` (within the run above) | 1 run, passed |
| Frontend unit tests | `npm run test` (in `frontend/`) | 7 of 7 passed |
| Frontend lint | `npm run lint` | 0 errors, 1 warning (see Known Issues) |
| Frontend production build | `npm run build` | Built successfully |
| End-to-end tests | `npm run e2e` against the running backend on port 8080 | 3 of 3 passed |
| Application start | `mvn spring-boot:run` (in `backend/`) | Started. `GET /api/books` and `GET /` returned HTTP 200 |

## Backend Test Breakdown

- `AuthorApiTests`: 3 tests
- `BookApiTests`: 11 tests, including unknown author (404), negative copies on create (400), rollback when the book save fails, malformed JSON (400), and unsupported media type (415)
- `BookPersistenceTests`: 1 test. It writes a book, updates its copies, closes the Spring context, starts a new context on the same file-backed H2 database, and reads the data back (covers the persistence requirement in T-016)
- `BookManagementApplicationTests`: 1 context-load test

The Mockito self-attach warning in the test output is informational and does not affect the result.

## Frontend Test Breakdown

- Unit tests (Vitest and Testing Library): 7 tests across 3 files
- E2E tests (Playwright, Chromium), in `frontend/e2e/books.spec.ts`:
  1. Adds a book with a new author and shows it in the list
  2. Updates available copies for an existing book
  3. Submits the add-book form using only the keyboard

## Known Issues and Assumptions

- **Lint warning:** `frontend/src/App.tsx:24` reports `react(set-state-in-effect)`. It is not an error. It was left unchanged.
- **E2E isolation:** the E2E tests run against the development database and use `Date.now()` suffixes for unique names. They are not isolated from other data.
- **Keyboard test:** the keyboard-only test relies on a fixed number of Tab presses, which may be fragile if the form layout changes.
- **Database path:** the development H2 file path (`./data/bookmanagement`) is relative to the working directory.
- **Unconfirmed decisions:**
  - The Spring Boot version is 3.5.16 in a hand-written `pom.xml`, because Spring Initializr returned HTTP 400 for every 3.x version.
  - The static UI build output (`backend/src/main/resources/static/`) is git-ignored.
  - HTTP 405 maps to `VALIDATION_ERROR` (confirmed in the code review, F-09; the user chose to keep it).

## Not Executed

- No security scan or dependency vulnerability audit was run.
- No load or performance tests were run.
- The E2E suite was not run in CI.
