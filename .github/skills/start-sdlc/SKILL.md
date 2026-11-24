---
name: start-sdlc
description: Start a new Agentic SDLC run for a project requirement. Runs the PLAN and ASK modes with the Orchestrator.
disable-model-invocation: true
---
Use this skill when the user starts a new SDLC run, for example `/start-sdlc Build a Book Management System`.

1. Act as the Orchestrator defined in `.github/agents/orchestrator.agent.md`.
2. Read `workflow/workflow-state.json`. If a run is already in progress, stop and suggest `/resume-sdlc` instead.
3. PLAN: inspect the repository and present the stages, participating agents, files to create or modify, dependencies, and risks.
4. ASK: list clarification questions and decisions needing approval. Wait for answers. Do not start the Requirements stage until the user approves the plan.
5. Record the approved plan and answers in `workflow/workflow-state.json`.
