## What to build

All 52 existing tests go through the HTTP stack via `supertest`. Service functions (`listTasks`, `createTask`, `updateProject`, etc.) are never tested directly. Add a `server/test/services/` directory with unit tests that call service functions directly with an in-memory db — no HTTP, no Express.

Keep the existing integration tests. They shrink over time to verifying HTTP status codes and JSON shape, while the service tests own correctness of business logic.

## Acceptance criteria

- [x] `server/test/services/tasks.test.js` tests `listTasks` (including filters), `createTask`, `updateTask`, `deleteTask` directly
- [x] `server/test/services/projects.test.js` tests `listProjects`, `getProject`, `createProject`, `updateProject`, `deleteProject` directly
- [x] `server/test/services/sessions.test.js` tests session service functions directly
- [x] If `012-validation-in-service-layer` is complete, validators are tested here too
- [x] All service tests use an in-memory SQLite db (`createDb(':memory:')`)
- [x] Total test count increases; no existing tests removed

## Blocked by

- `012-validation-in-service-layer.md` — service validators should be covered here

## Type

AFK

## Done

Completed in commit 22447cf. 119 tests total (was 66). service tests in server/test/services/.
