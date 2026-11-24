---
name: verification
description: Run the project's tests and build, validate behavior and edge cases, check documentation, and write docs/verification-report.md with only executed results. Use for the Verification stage.
---
Procedure:
1. Find the test, lint, and build commands documented in the repository (for example in its README or package manifest). Do not guess them.
2. Run unit tests, integration tests, and the build. Record for each: the exact command, exit code, and pass/fail counts from the output.
3. Check the important edge cases listed in `docs/requirements.md`. Record each as executed, or as not executed with the reason.
4. Check that `docs/` deliverables are complete and consistent with the code.
5. Write `docs/verification-report.md` with sections: Commands Executed, Results, Failures, Not Executed, Documentation Check.
6. If anything failed, list each failure for the Orchestrator. Fixes go to the Implementation specialist only after user approval.
7. Never state that a test passed unless its output shows it passed.
