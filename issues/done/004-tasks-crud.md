## Parent PRD

`issues/prd.md`

## What to build

Deliver the full Tasks vertical slice: REST API endpoints for tasks and the task list UI inside the Project View page.

The server exposes `GET /api/projects/:id/tasks`, `POST /api/projects/:id/tasks`, `PUT /api/tasks/:id`, and `DELETE /api/tasks/:id`. The GET endpoint accepts optional query params `?status=`, `?priority=`, and `?category=` (filtering logic will be surfaced in the UI in a later issue — the backend must support it now).

The Project View page renders the task list for the selected project. The user can create a task manually via a form (all fields: title, description, priority, category — status defaults to `pending`), change a task's status, edit any field of an existing task, and delete a task.

## Acceptance criteria

- [ ] `GET /api/projects/:id/tasks` returns all tasks for the project
- [ ] `GET /api/projects/:id/tasks?status=in_progress` returns only matching tasks
- [ ] `POST /api/projects/:id/tasks` creates a task with all required fields validated
- [ ] `PUT /api/tasks/:id` updates any combination of task fields
- [ ] `DELETE /api/tasks/:id` deletes the task and returns 204
- [ ] Invalid `priority` or `category` values return a 400 error
- [ ] Project View shows the list of tasks for the current project
- [ ] Each task displays title, priority, category, and status
- [ ] User can create a task manually via a form
- [ ] User can change a task's status (pending → in_progress → done)
- [ ] User can edit an existing task's fields
- [ ] User can delete a task with a confirmation step
- [ ] Task count on the Dashboard project card updates after mutations
- [ ] All mutations invalidate and refetch the task list via React Query

## Blocked by

- Blocked by `issues/003-projects-crud.md`

## User stories addressed

- User story 10 (create task manually)
- User story 11 (task fields: title, description, priority, category, status)
- User story 12 (change task status)
- User story 13 (edit task)
- User story 14 (delete task)
- User story 3 (task count on dashboard)
