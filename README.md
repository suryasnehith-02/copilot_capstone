# Agentic SDLC Framework

A reusable, technology-independent SDLC framework for GitHub Copilot. The Orchestrator agent is the single entry point. It runs specialist agents through eight stages with user approval at each gate.

## Structure

- `.github/agents/`: Orchestrator and eight specialist agents.
- `.github/instructions/`: global, documentation, coding, and security rules.
- `.github/skills/`: specialist procedures plus `start-sdlc`, `resume-sdlc`, and `review-stage` entry points.
- `docs/`: SDLC deliverables, created during the run.
- `workflow/workflow-state.json`: persistent run state.

## Usage

1. Run `/start-sdlc <requirement>` to plan and gather approval.
2. Answer the questions and approve each stage's deliverable.
3. Run `/resume-sdlc` to continue an interrupted run.
4. Run `/review-stage <stage>` to check a deliverable before approving it.

Commits, pushes, and PR creation happen only with explicit authorization. Merging is never automatic.

## MCP setup (Jira, Confluence, GitHub)

The workspace file `.mcp.json` defines two read-only HTTP MCP servers:

- `atlassian`: Jira and Confluence, via `https://mcp.atlassian.com/v2/mcp`.
- `github`: repository, branch, and PR data, via `https://api.githubcopilot.com/mcp/`.

No tokens are stored in the repo. To connect:

1. Open the project in VS Code with the Copilot harness selected.
2. Run **Chat: Open Customizations** > **MCP Servers** and confirm both servers are listed. Start them if needed.
3. Complete the OAuth sign-in prompts in the browser for Atlassian and GitHub.
4. Verify with a read-only prompt, for example "List my Jira projects" or "List the branches in this repo". Confirm that the tool call appears in the chat output.

Do not put tokens or API keys in `.mcp.json`. For the `.vscode/mcp.json` format, see the deprecated Local harness notes; this project does not use it.

## Book Management System

Backend: Spring Boot 3.5 (Java 21) in `backend/`. Frontend: React + TypeScript + Vite in `frontend/`.

Features: add books, add authors, and track book availability (copies).

### Run

1. Build the UI into the backend static folder: `cd frontend` then `npm run build`.
2. Start the backend: `cd backend` then `mvn spring-boot:run`. The app listens on `http://localhost:8080` (bound to localhost only) and serves the UI at `/`.
3. For UI development with hot reload, run `npm run dev` in `frontend/`. Its dev server proxies `/api` to port 8080, so run the backend too.

The dev profile stores data in an H2 file at `./data/bookmanagement` relative to the working directory. Delete the `data/` folder to reset the database.

### Test

- Backend: `cd backend` then `mvn test`.
- Frontend unit tests: `cd frontend` then `npm run test`.
- Frontend E2E (Playwright): start the backend, then `cd frontend` and `npm run e2e`. Install the browser once with `npx playwright install chromium`.
- Lint: `cd frontend` then `npm run lint`.
