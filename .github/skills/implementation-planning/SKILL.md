---
name: implementation-planning
description: Break the approved architecture into a dependency-ordered task list with acceptance criteria and blocked tasks in docs/impl-plan.md. Use for the Implementation Planning stage.
---
Procedure:
1. Read `docs/requirements.md`, `docs/architecture.md`, and `docs/design-review.md`.
2. Break the work into tasks with IDs such as T-001. Each task covers one coherent change.
3. For each task, list the files it touches, its dependencies (the task IDs it needs first), its priority, and its acceptance criteria. Acceptance criteria must be testable.
4. Order tasks so every task appears after its dependencies. Mark any task whose dependency is not finished as blocked and name the blocking task.
5. Write `docs/impl-plan.md` with sections: Overview, Task List (in dependency order), Blocked Tasks, Test Strategy.
6. Mirror the task list in `workflow/workflow-state.json` under `implementationTasks` after approval.
7. Ask the user to approve the plan.
