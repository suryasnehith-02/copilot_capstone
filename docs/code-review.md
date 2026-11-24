# Code Review: Book Management System

Status: Review complete. Fixes were applied for F-01 to F-06 and F-09 (see Agreed Decisions). F-07, F-08, and F-10 are accepted limitations.

Scope: all backend main sources, frontend sources (`api/`, `components/`, `App.tsx`), and the E2E spec, checked against [requirements.md](./requirements.md) (FR-001 to FR-010, NFR-001 to NFR-005) and the approved [architecture.md](./architecture.md).

## Summary

The implementation covers all in-scope requirements. Input validation is done at the API boundary (NFR-001). Error responses hide internal details, and unexpected errors are logged on the server only (NFR-002). Persistence is file-backed with Flyway (NFR-003). Stale-update detection uses `@Version` plus an explicit version check (409).

The review found no high-severity defects. There is one requirement deviation (ISBN format check, which conflicts with A-04), two test gaps (FR-003 is not tested), and several low-severity items (dead code, accessibility, DRY, ordering).

## Requirement Coverage

| Requirement | Where implemented | Covered by tests |
| --- | --- | --- |
| FR-001 author create | `AuthorController.java`, `AuthorService.createAuthor` | `AuthorApiTests` |
| FR-002 book create | `BookController.create`, `BookService.createBook` | `BookApiTests.createsBookWithNewAuthorAndReadsItBack` |
| FR-003 reject unknown author | `BookService.java:33-34` (throws `NotFoundException`, returns 404) | **Not tested** (see F-02) |
| FR-004 set availability | `BookController.updateAvailability`, `BookService.updateAvailability` | `BookApiTests.updatesAvailabilityWithCurrentVersion` |
| FR-005 book by ID | `BookController.get` | `BookApiTests.returnsNotFoundForUnknownBook` (404 case only) |
| FR-006 list books and authors | `BookController.list`, `AuthorController.list` | Indirect (E2E and frontend tests) |
| FR-007 add-book form | `AddBookForm.tsx` | `AddBookForm.test.tsx`, E2E |
| FR-008 validation messages | `AddBookForm.tsx` `validate()` | `AddBookForm.test.tsx` |
| FR-009 list shows title, author, copies | `BookList.tsx`, `App.tsx` | E2E |
| FR-010 change copies from list | `BookList.tsx` `BookRow.save` | `BookList.test.tsx`, E2E |
| NFR-001 boundary validation | DTO annotations in `CreateBookRequest`, `AvailabilityRequest`, `CreateAuthorRequest` | Partly (see F-02) |
| NFR-002 safe errors | `ApiExceptionHandler.java:80-83` | `BookApiTests` (malformed JSON, 415) |
| NFR-003 persistence | `application.yml`, `V1__create_author_book.sql` | `BookPersistenceTests` |
| NFR-004 keyboard and labels | `AddBookForm.tsx`, `BookList.tsx` | E2E keyboard test (see F-05) |
| NFR-005 automated tests | `backend/src/test`, `frontend/src/**/*.test.*`, `frontend/e2e` | Yes |

## Findings

Severity: High = blocks a requirement; Medium = requirement deviation or missing test for a requirement; Low = quality, maintainability, or polish.

### F-01: ISBN format check conflicts with A-04 (Medium, resolved)

- Files: `backend/src/main/java/com/example/bookmanagement/book/CreateBookRequest.java:17`; `frontend/src/components/AddBookForm.tsx` (`validate`, ISBN regex).
- Problem: A-04 says ISBN is optional and "is not checked for format or uniqueness." Both tiers reject any ISBN that contains characters other than digits, hyphens, and X.
- Impact: Valid ISBN-like inputs (for example, values with spaces) are rejected. This is a behavior the user did not approve.
- Suggested fix: Either remove the pattern from both tiers (keep the length limit to satisfy NFR-001), or ask the user to approve a change to A-04 that allows format checks. This needs a user decision.

### F-02: FR-003 and related validation are not tested (Medium)

- Files: `backend/src/test/java/com/example/bookmanagement/book/BookApiTests.java`; `BookService.java:33-34`.
- Problem: No test creates a book with an unknown `authorId`. The 404 path (FR-003) has no coverage. Negative `availableCopies` on create, and an out-of-range value on availability update, are also untested on the backend. Frontend tests cover these cases, but the backend has no test for them.
- Impact: A regression in FR-003 or NFR-001 would not be caught by the backend suite.
- Suggested fix: Add two focused backend cases to `BookApiTests`: (1) POST with an unknown `authorId` returns 404 `NOT_FOUND`; (2) POST with negative `availableCopies` returns 400 `VALIDATION_ERROR`. Add one availability case for an out-of-range value.

### F-03: `AuthorService.getAuthor` is unused (Low)

- File: `backend/src/main/java/com/example/bookmanagement/author/AuthorService.java:34`.
- Problem: Only the definition references `getAuthor`. No controller or service calls it.
- Impact: Dead code that adds maintenance cost and an untested path.
- Suggested fix: Remove the method. If a "get author by ID" endpoint is needed later, add it with a test. That endpoint is outside the approved scope (A-05 only covers create, read, list, and availability update).

### F-04: Duplicated limits and ISBN rule across tiers (Low)

- Files: `AvailabilityRequest.java:10`, `CreateBookRequest.java:21`; `AddBookForm.tsx` and `BookList.tsx` (`MAX_COPIES = 1000000`); ISBN regex in `CreateBookRequest.java:17` and `AddBookForm.tsx`.
- Problem: The copies limit and ISBN pattern appear in several places. Changing one without the others would cause inconsistent validation.
- Impact: Maintenance risk only. Current values match.
- Suggested fix: Keep the duplication across tiers, since the frontend needs its own validation for FR-008. Make sure any change (including the F-01 decision) updates all places. Optionally, consolidate the backend constant into one `static final` used by both records.

### F-05: Form errors are not linked to their inputs (Low)

- Files: `frontend/src/components/AddBookForm.tsx` (inputs at lines 98, 103, 115, 121); `frontend/src/components/BookList.tsx:60`.
- Problem: `aria-invalid` is set, but the error `<p role="alert">` elements are not connected to their inputs with `aria-describedby`. Screen readers may announce the error without naming the field.
- Impact: Partial gap against NFR-004. Labels are present and keyboard access works.
- Suggested fix: Give each error paragraph an `id` and add `aria-describedby` on the matching input.

### F-06: Client sort order differs from server sort order (Low)

- Files: `frontend/src/App.tsx:28` (`localeCompare`); `backend/src/main/java/com/example/bookmanagement/book/BookRepository.java:15` (`order by b.title`).
- Problem: After adding a book, the client sorts with `localeCompare`. The server sorts with the database collation. The two orders can differ for some titles (case and accents). The list is corrected on the next reload.
- Impact: Minor visual reordering after a reload.
- Suggested fix: Accept as-is for the MVP, or sort the client list in the same way as the server.

### F-07: Unbounded list endpoints (Low)

- Files: `BookService.java:42` (`findAllWithAuthor`); `AuthorService.java:30` (`findAll`).
- Problem: Both endpoints return every row without paging.
- Impact: Acceptable for the MVP scale. Large data sets would slow responses. No NFR in the requirements sets a size limit.
- Suggested fix: Record as a known limitation. Add pagination when a data-size requirement is approved.

### F-08: Generic 409 mapping for data-integrity errors (Low, no change)

- File: `backend/src/main/java/com/example/bookmanagement/error/ApiExceptionHandler.java:73-76`.
- Problem: `DataIntegrityViolationException` maps to 409 with a generic message. Any constraint violation (not only duplicate author names) gets the same response.
- Impact: The message is safe (NFR-002), and the normal duplicate-author path is handled earlier with a specific message. Unexpected integrity errors may be reported as conflicts.
- Suggested fix: No change required now. Keep the generic message. Revisit if more constraints are added.

### F-09: HTTP 405 mapped to VALIDATION_ERROR (Low, unconfirmed)

- File: `ApiExceptionHandler.java` (`handleMethodNotAllowed`).
- Problem: A method-not-allowed response uses the `VALIDATION_ERROR` code. This is decision D-007 (unconfirmed).
- Suggested fix: Use a dedicated code such as `METHOD_NOT_ALLOWED`, or keep the mapping if the user confirms D-007.

### F-10: Existing lint warning (Low, carried over)

- File: `frontend/src/App.tsx:23-24` (`void reload()` inside `useEffect`).
- Problem: The lint rule `react-hooks/set-state-in-effect` reports a warning. Behavior is correct.
- Suggested fix: Leave as-is, or restructure the initial load in a later change.

## Security Review (non-exhaustive, no scanner run)

- Input is validated at the API boundary with Bean Validation and trimmed in compact constructors (NFR-001).
- Server errors return a generic message. Stack traces are logged server-side only (`ApiExceptionHandler.java:80-83`).
- SQL access uses JPA and parameterized JPQL (`BookRepository.java`). No string-built queries were found.
- No authentication or authorization (accepted risk DR-05). The API binds to localhost by default (`application.yml`).
- Not run: dependency vulnerability scan, SAST scan. These are open items.

## Dependency Safety

- Backend: Spring Boot 3.5.16 (`backend/pom.xml`), H2, Flyway. The POM was hand-written (decision D-007, unconfirmed).
- Frontend: versions in `frontend/package.json` were not audited.
- No vulnerability audit (`npm audit`, OWASP dependency check) was run. This is an open item.

## Test Coverage Assessment

- Backend: 16 tests across API, persistence, and context load. Happy paths, malformed input, unknown author, and negative copies are covered.
- Frontend: 7 unit tests cover validation, inline author creation, stale-version notice, and client error mapping.
- E2E: 3 tests cover add-with-new-author, copies update, and keyboard submission. They run against the development database and are not isolated (see [verification-report.md](./verification-report.md)).

## Recommended Changes

| ID | Change | Severity | Status |
| --- | --- | --- | --- |
| F-01 | Remove the ISBN format check (A-04 says ISBN is not checked for format) | Medium | Applied |
| F-02 | Add backend tests for unknown author (404) and negative copies (400) | Medium | Applied |
| F-03 | Remove unused `AuthorService.getAuthor` | Low | Applied |
| F-04 | Consolidate backend limits into one constant | Low | Applied |
| F-05 | Link error messages with `aria-describedby` | Low | Applied |
| F-06 | Align client sort with server sort, or accept | Low | Applied (client sort removed; the list reloads in server order) |
| F-09 | Confirm or change the 405 code mapping (D-007) | Low | Confirmed by user (kept `VALIDATION_ERROR`) |

Findings F-07, F-08, and F-10 are recorded as accepted limitations and need no change now.

## Agreed Decisions

- F-01: applied. `CreateBookRequest` no longer has the ISBN `@Pattern`; the frontend checks only the 20-character limit. This matches A-04.
- F-02: applied (`BookApiTests`: unknown `authorId` returns 404; negative copies return 400).
- F-03: applied (`AuthorService.getAuthor` removed).
- F-04: applied (backend `BookLimits.MAX_AVAILABLE_COPIES`; frontend `src/constants.ts`).
- F-05: applied (`aria-describedby` on AddBookForm and BookList inputs).
- F-06: applied. The client no longer sorts after create; `reload()` returns the server order. The decision was made on the user's behalf and can be reversed.
- F-09: confirmed. HTTP 405 keeps the `VALIDATION_ERROR` mapping (D-007). The decision was made on the user's behalf and can be reversed.
