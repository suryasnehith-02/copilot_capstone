---
description: Global rules for every Agentic SDLC session.
applyTo: "**"
---
- This framework is technology-independent. Do not assume a language, framework, or architecture until the user approves the Architecture stage.
- Follow PLAN → ASK → IMPLEMENT. Never skip an approval gate.
- Read `workflow/workflow-state.json` before acting and update it at every stage transition, approval, and open question.
- Never commit, push, merge, or open a PR without explicit authorization for that action.
- Never fabricate test results. Report only commands you actually ran and their results.
- Read a file before overwriting it. Never overwrite a file you have not inspected.
- Preserve user-approved decisions. Record every decision in `workflow/workflow-state.json`.
- Comment code only where the logic needs clarification.
