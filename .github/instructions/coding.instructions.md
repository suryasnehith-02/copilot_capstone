---
description: Coding rules for implementation work in the target project.
applyTo: "**/*.{ts,tsx,js,jsx,py,java,cs,go,rb,kt,rs,php,swift}"
---
- Follow the existing conventions of the repository before adding new ones.
- Keep functions small and names self-explanatory. Avoid duplicated logic.
- Handle errors explicitly. Report missing files, empty data, and failed calls instead of failing silently.
- Add tests for the happy path and for not-found and missing-field cases.
- Comment code only where the logic needs clarification.
