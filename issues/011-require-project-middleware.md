## What to build

Extract the repeated parent-exists check into a `requireProject(db)` Express middleware. Right now every child route (tasks GET, tasks POST, sessions GET, sessions POST) duplicates:

```js
const project = getProject(db, req.params.id)
if (!project) return res.status(404).json({ error: 'Project not found' })
```

Create a `requireProject(db)` middleware that performs this check and attaches the project as `req.project`. All child routes use the middleware and drop their inline check.

## Acceptance criteria

- [ ] `server/src/middleware/requireProject.js` (or similar) exports `requireProject(db)`
- [ ] Middleware attaches `req.project` on success, returns 404 JSON on failure
- [ ] All task routes (`GET /api/projects/:id/tasks`, `POST /api/projects/:id/tasks`) use the middleware
- [ ] All session routes (`GET /api/projects/:id/sessions`, `POST /api/projects/:id/sessions`) use the middleware
- [ ] No inline `getProject` + 404 guard remains in child route handlers
- [ ] All existing 404-for-nonexistent-project tests continue to pass

## Blocked by

- `010-router-factory.md` — middleware fits cleanly into the factory pattern

## Type

AFK — refactor only, no new user-facing behavior
