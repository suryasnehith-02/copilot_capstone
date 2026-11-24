---
name: architecture-design
description: Recommend technology options and design system components, data model, API contracts, and diagrams in docs/architecture.md. Use for the Architecture stage.
---
Procedure:
1. Read `docs/requirements.md`. It must be approved.
2. Propose at least two technology stack options. For each, state the fit with the requirements, the trade-offs, and the reason for your recommendation. Ask the user to choose.
3. After the user chooses, design the components and their responsibilities.
4. Define the database schema and API contracts (method, path, request, response, errors).
5. Describe component interactions and data flow. Add Mermaid diagrams where they help.
6. Map each requirement ID to the component that satisfies it.
7. Write `docs/architecture.md` with sections: Stack Decision, Components, Data Model, API Contracts, Interactions, Diagrams, Requirement Traceability.
8. Ask the user to approve the document.
