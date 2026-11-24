---
name: review-stage
description: Review the deliverable of one SDLC stage against its checklist and report findings before the user approves it.
disable-model-invocation: true
---
Use this skill to check a stage's deliverable before approval, for example `/review-stage architecture`.

1. Identify the stage from the argument. If none is given, ask which stage.
2. Read the stage's deliverable in `docs/` and its inputs listed in `workflow/workflow-state.json`.
3. Check the deliverable against the checklist in that stage's skill under `.github/skills/`.
4. Report findings grouped by severity, each with the section it refers to.
5. Do not change the stage status or approval. Only the user approves a stage.
