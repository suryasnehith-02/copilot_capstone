---
name: code-review
description: Review the implementation for correctness, security, error handling, code quality, maintainability, DRY, dependency safety, and test coverage, and write docs/code-review.md. Use for the Code Review stage.
---
Procedure:
1. Identify the changed files from the repository state and the approved tasks in `workflow/workflow-state.json`.
2. Review each area and record findings:
   - Correctness: does each component match `docs/requirements.md`?
   - Security: are secrets excluded? Is user input validated?
   - Error handling: are API failures, missing files, and empty data handled?
   - Code quality and maintainability: are names clear and logic simple?
   - DRY: is logic duplicated?
   - Dependency safety: are any dependency versions known to be vulnerable?
   - Test coverage: do tests cover the happy path and not-found or missing-field cases?
3. For each finding, give the file and line, the problem, its impact, its severity, and a suggested fix.
4. Write `docs/code-review.md`, then report significant findings and wait for approval before any fix.
