## Parent PRD

`issues/prd.md`

## What to build

Deliver the full Sessions vertical slice: REST API endpoints for work sessions and the session UI inside the Project View page.

The server exposes `GET /api/projects/:id/sessions`, `POST /api/projects/:id/sessions`, `PUT /api/sessions/:id`, and `DELETE /api/sessions/:id`. Sessions are returned in reverse chronological order (most recent first).

The Project View page gains a sessions section below the task list. The user can log a new session via a form (fields: date, duration in minutes, description — all required). The user can edit an existing session and delete one. Task association (linking sessions to tasks) is handled in a later issue — the form does not need a task selector yet.

## Acceptance criteria

- [ ] `GET /api/projects/:id/sessions` returns all sessions for the project, most recent first
- [ ] `POST /api/projects/:id/sessions` creates a session with date, duration_minutes, and description validated as required
- [ ] `PUT /api/sessions/:id` updates any combination of session fields
- [ ] `DELETE /api/sessions/:id` deletes the session and returns 204
- [ ] Project View shows the list of logged sessions for the current project
- [ ] Each session entry displays date, duration, and description
- [ ] User can open a form to log a new session
- [ ] User can edit an existing session
- [ ] User can delete a session with a confirmation step
- [ ] All mutations invalidate and refetch the session list via React Query

## Blocked by

- Blocked by `issues/003-projects-crud.md`

## User stories addressed

- User story 18 (log a work session manually)
- User story 20 (see sessions in chronological order)
- User story 21 (edit a session)
- User story 22 (delete a session)
