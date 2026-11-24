# Design Review: Book Management System

Status: Findings resolved. User approved the proposed decisions (D-006). Stage 3 complete.
Reviewed: [architecture.md](./architecture.md) against [requirements.md](./requirements.md).

## Summary

Requirement coverage is complete. Every FR-001 to FR-010 and NFR-001 to NFR-005 maps to a component, an endpoint, or a test layer in the traceability table.

The design is sound for a single-user, local, three-feature scope. The main gaps are:
- Data integrity rules that are not stated: author name uniqueness, a copies ceiling, and a database-level check.
- Concurrency on availability updates.
- Undefined runtime setup: how the React app is served, CORS, and configuration.
- The inline "add author" flow can leave orphan authors.

No high-severity findings. Two medium findings need a user decision.

## Findings

Severity: High (blocks correctness or security), Medium (should fix before implementation), Low (improve or note).

| ID | Area | Severity | Finding | Requirements |
| --- | --- | --- | --- | --- |
| DR-01 | Data integrity | Medium | Author name uniqueness is not defined. The inline add-author flow (Interaction 1) can create duplicate authors such as "J. K. Rowling" twice. | FR-001, FR-007 |
| DR-02 | Interactions | Medium | The UI creates the author (`POST /authors`) and then the book (`POST /books`). If the book call fails, an orphan author remains. There is no transaction across the two calls. | FR-002, FR-007, FR-008 |
| DR-03 | Concurrency | Medium | `PATCH /books/{id}/availability` sets an absolute value. Two librarians editing the same book can overwrite each other (lost update). No version column is defined. | FR-004, FR-010 |
| DR-04 | Runtime setup | Medium | Not defined: whether Spring Boot serves the built React app or a separate dev server runs it, and therefore whether CORS is needed. This affects every API call from the browser. | FR-007, FR-009 |
| DR-05 | Security | Medium | No authentication is in scope (A-02). Any client on the network can create or change data. Acceptable for a local single-user app, but the API should bind to localhost by default, and this should be an explicit accepted risk. | NFR-001 |
| DR-06 | Data integrity | Low | `availableCopies` has no upper bound and no database `CHECK (availableCopies >= 0)`. Validation exists only in the API layer. | FR-004, NFR-001 |
| DR-07 | Input handling | Low | NFR-001 says "sanitized", but the design only lists validation. Define the rule: trim whitespace, reject blank names, and store text as plain text. React escapes output, so do not render HTML. | NFR-001 |
| DR-08 | Error handling | Low | The error table does not cover malformed JSON (400) or unsupported method/media type (405, 415). These need mapping in `@RestControllerAdvice`. | NFR-002 |
| DR-09 | Operations | Low | H2 file mode allows only one process to open the database. Also, the H2 web console must be disabled outside development. Neither is stated. | NFR-003 |
| DR-10 | Operations | Low | No logging or configuration component is defined: port, database file path, and log levels. Logs must not contain sensitive data (security rules). | NFR-002 |
| DR-11 | API contract | Low | The shape of the nested `author` object in `Book` responses is not specified (for example `{id, name}`). | FR-005, FR-009 |
| DR-12 | Scalability | Low | `GET /books` and `GET /authors` are unbounded. Fine for this scope; pagination can be added later. | FR-006 |
| DR-13 | Data model | Low | `Author` has `createdAt` but no `updatedAt`. Inconsistent with `Book`. | none |
| DR-14 | Migration | Low | Flyway SQL must be portable (H2 and PostgreSQL) if the stated future switch to PostgreSQL is to hold without API change. | NFR-003 |

## Recommended Changes

1. **DR-01 (decide):** Enforce a unique author name, case-insensitive after trimming (`UNIQUE` index on `lower(trim(name))`), and return 409 `CONFLICT` on duplicates. Alternative: allow duplicates. Recommended: unique.
2. **DR-02 (decide):** Keep two calls, but the UI must show the author as created and let the user pick it again if the book save fails (no silent orphan). Alternative: a single `POST /books` that accepts an inline new author in one transaction. Recommended: the single-call option, because it removes the orphan case entirely.
3. **DR-03 (decide):** Add a `version` column and use optimistic locking (`@Version`). The PATCH returns 409 on a stale version. Alternative: accept last-write-wins for this single-user scope. Recommended: optimistic locking, since it is small.
4. **DR-04 (decide):** Spring Boot serves the built React app from `/` and the API from `/api`. This avoids CORS entirely. Alternative: separate dev server with a Vite proxy in development. Recommended: serve from Spring Boot.
5. **DR-05 (accept):** Bind to `localhost` by default. Record "no authentication" as an accepted risk, consistent with A-02.
6. **DR-06 (apply):** Add `CHECK (availableCopies >= 0)` in Flyway. Set an upper bound of 1,000,000 in validation.
7. **DR-07 (apply):** Trim and reject blank values at the boundary. Store plain text.
8. **DR-08 (apply):** Map malformed JSON to 400 `VALIDATION_ERROR`, and unsupported methods or media types to their standard codes.
9. **DR-09 (apply):** Disable the H2 console outside development. Document the single-process limit.
10. **DR-10 (apply):** Add a configuration section (port, DB path, log level), and log errors without request bodies.
11. **DR-11 (apply):** Define the nested author as `{ "id", "name" }`.
12. **DR-12 (defer):** Leave unbounded lists for now. Note it as a known limit.
13. **DR-13 (apply):** Add `updatedAt` to `Author`.
14. **DR-14 (apply):** Write Flyway migrations using only portable SQL types.

## Agreed Decisions

Approved by the user (D-006). The proposed defaults for DR-01 to DR-05 and the recommended changes for DR-06 to DR-14 are applied in [architecture.md](./architecture.md).

| ID | Decision | Status |
| --- | --- | --- |
| DR-01 | Unique author name, case-insensitive, 409 on duplicate | Approved |
| DR-02 | Single `POST /books` that can create the author in one transaction | Approved |
| DR-03 | Optimistic locking with a `version` column, 409 on stale update | Approved |
| DR-04 | Spring Boot serves the built React app; no CORS | Approved |
| DR-05 | Bind to localhost; "no authentication" recorded as accepted risk | Approved |
| DR-06 to DR-14 | Applied as recommended | Approved |
