## What to build

Extract the repeated parent-exists check into a `requireProject(db)` Express middleware. Right now every child route (tasks GET, tasks POST, sessions GET, sessions POST) duplicates:

```js
const project = getProject(db, req.params.id)
if (!project) return res.status(404).json({ error: 'Project not found' })
```

Create a `requireProject(db)` middleware that performs this check and attaches the project as `req.project`. All child routes use the middleware and drop their inline check.

## Acceptance criteria

- [x] `server/src/middleware/requireProject.js` (or similar) exports `requireProject(db)`
- [x] Middleware attaches `req.project` on success, returns 404 JSON on failure
- [x] All task routes (`GET /api/projects/:id/tasks`, `POST /api/projects/:id/tasks`) use the middleware
- [x] All session routes (`GET /api/projects/:id/sessions`, `POST /api/projects/:id/sessions`) use the middleware
- [x] No inline `getProject` + 404 guard remains in child route handlers
- [x] All existing 404-for-nonexistent-project tests continue to pass

## Blocked by

- `010-router-factory.md` — middleware fits cleanly into the factory pattern

## Type

AFK — refactor only, no new user-facing behavior

## Done

Completed 2026-05-24. 121 tests pass (added 2 unit tests for the middleware itself).
Files: server/src/middleware/requireProject.js (new), server/src/routes/tasks.js, server/src/routes/sessions.js, server/test/middleware/requireProject.test.js (new).
