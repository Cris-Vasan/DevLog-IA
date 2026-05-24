## What to build

All 52 existing tests go through the HTTP stack via `supertest`. Service functions (`listTasks`, `createTask`, `updateProject`, etc.) are never tested directly. Add a `server/test/services/` directory with unit tests that call service functions directly with an in-memory db — no HTTP, no Express.

Keep the existing integration tests. They shrink over time to verifying HTTP status codes and JSON shape, while the service tests own correctness of business logic.

## Acceptance criteria

- [ ] `server/test/services/tasks.test.js` tests `listTasks` (including filters), `createTask`, `updateTask`, `deleteTask` directly
- [ ] `server/test/services/projects.test.js` tests `listProjects`, `getProject`, `createProject`, `updateProject`, `deleteProject` directly
- [ ] `server/test/services/sessions.test.js` tests session service functions directly
- [ ] If `012-validation-in-service-layer` is complete, validators are tested here too
- [ ] All service tests use an in-memory SQLite db (`createDb(':memory:')`)
- [ ] Total test count increases; no existing tests removed

## Blocked by

- `012-validation-in-service-layer.md` — service validators should be covered here

## Type

AFK
