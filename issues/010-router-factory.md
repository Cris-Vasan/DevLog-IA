## What to build

Refactor all Express route modules to export factory functions that accept `db` as a parameter, instead of fetching it at request time via `req.app.get('db')`.

Currently every route handler calls `const db = req.app.get('db')` — a hidden runtime dependency on Express app state. Tests must call `app.set('db', db)` before each suite. The fix: each router module exports a function `projectsRouter(db)` / `tasksRouter(db)` / `sessionsRouter(db)`, and `app.js` wires them at startup.

## Acceptance criteria

- [ ] `routes/projects.js` exports `module.exports = function(db) { return router }` 
- [ ] `routes/tasks.js` exports the same factory pattern
- [ ] `routes/sessions.js` exports the same factory pattern
- [ ] `app.js` calls `projectsRouter(db)`, `tasksRouter(db)`, `sessionsRouter(db)`
- [ ] No route handler calls `req.app.get('db')`
- [ ] Tests no longer need `app.set('db', db)` — db is passed at router creation time
- [ ] All existing tests pass without modification to test logic

## Blocked by

None — can start immediately

## Type

AFK — refactor only, no new user-facing behavior
