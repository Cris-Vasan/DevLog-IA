## Parent PRD

`issues/prd.md`

## What to build

Add task association to sessions via the `session_tasks` join table. When creating or editing a session, the user can link it to one or more tasks from the same project.

The server's create and update session endpoints accept an optional `task_ids` array. On create, the server inserts the corresponding rows into `session_tasks`. On update, it replaces the existing associations with the new set. The GET sessions endpoint should include the associated task IDs (and optionally task titles) in each session response.

The session form in the Project View gains a multi-select control listing the tasks of the current project. The user can select zero or more tasks to associate with the session. Existing associations are pre-filled when editing a session.

## Acceptance criteria

- [ ] `POST /api/projects/:id/sessions` accepts an optional `task_ids` array and writes to `session_tasks`
- [ ] `PUT /api/sessions/:id` accepts an optional `task_ids` array and replaces existing associations
- [ ] `GET /api/projects/:id/sessions` includes associated task IDs in each session object
- [ ] Deleting a session removes its rows from `session_tasks`
- [ ] Deleting a task removes its rows from `session_tasks` without deleting the session
- [ ] The session form shows a list of tasks in the current project for selection
- [ ] Selected tasks are saved when the session is created or updated
- [ ] Existing task associations are pre-selected when editing a session
- [ ] A session with zero task associations is valid

## Blocked by

- Blocked by `issues/004-tasks-crud.md`
- Blocked by `issues/006-sessions-crud.md`

## User stories addressed

- User story 19 (associate a session with tasks)
