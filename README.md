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
