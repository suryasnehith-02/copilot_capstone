---
name: pull-request
description: Prepare the PR title, description, changelog entry, test evidence, known limitations, and reviewer checklist, and create the PR only after explicit user authorization. Use for the Pull Request stage.
---
Procedure:
1. Read `docs/requirements.md`, `docs/code-review.md`, and `docs/verification-report.md`. Use test evidence only from the verification report.
2. Draft the PR title and a description with these sections in order:
   - Summary: 2–3 sentences on what was built and why.
   - Changes Made: a bullet list of files added or modified, with the reason for each.
   - Test Evidence: the executed commands and their results.
   - Known Limitations: anything not found, out of scope, or not executed.
   - Reviewer Checklist: a checkbox list the reviewer completes before approving.
3. Draft a changelog entry.
4. Show the full draft to the user. Do not commit, push, or create the PR yet.
5. Only after the user explicitly authorizes it, commit, push, and create the PR using the available GitHub integration. Do not merge.
6. Record the PR URL and number in `workflow/workflow-state.json`.
