---
name: resume-sdlc
description: Resume an interrupted Agentic SDLC run from workflow/workflow-state.json without repeating completed stages.
disable-model-invocation: true
---
Use this skill to continue a run after an interruption.

1. Read `workflow/workflow-state.json`.
2. Summarize the current stage, completed stages, awaiting-approval stages, blocked stages, open questions, and implementation and verification status.
3. Check that each completed stage's deliverable exists in `docs/`. If one is missing, mark the stage `pending` and tell the user.
4. Ask the user what to do next. Continue from the first stage that is not `completed`, following the stage gates in the Orchestrator agent.
