---
name: design-review
description: Review docs/architecture.md for risks, gaps, and weaknesses and write docs/design-review.md. Use for the Design Review stage.
---
Procedure:
1. Read `docs/architecture.md` and `docs/requirements.md`.
2. Check each area and record findings:
   - Requirement coverage: every FR and NFR maps to a component.
   - Architecture weaknesses: coupling, single points of failure, unclear ownership.
   - Security risks: authentication, authorization, input validation, secrets handling.
   - Scalability: data growth, query patterns, statelessness.
   - Missing components: error handling, logging, migrations, configuration.
3. Rate each finding high, medium, or low, and recommend a change.
4. Write `docs/design-review.md` with sections: Summary, Findings, Recommended Changes, Agreed Decisions (filled after the user responds).
5. Present the findings. Update `docs/architecture.md` only for changes the user approves, and record each agreed decision.
