---
description: Security rules for all framework and target-project work.
applyTo: "**"
---
- Never write secrets, tokens, passwords, or connection strings into source files, docs, or workflow state.
- Validate and sanitize all user input at system boundaries.
- Do not log sensitive data.
- Flag dependencies with known vulnerabilities and do not add them silently.
- Do not send code or secrets to third-party services outside the workflow.
