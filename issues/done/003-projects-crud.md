## Parent PRD

`issues/prd.md`

## What to build

Deliver the full Projects vertical slice: REST API endpoints for projects and the Dashboard UI that consumes them.

The server exposes `GET /api/projects`, `POST /api/projects`, `GET /api/projects/:id`, `PUT /api/projects/:id`, and `DELETE /api/projects/:id`. Deleting a project cascades to all its tasks and sessions.

The client renders a Dashboard page (the app's home route) that lists all projects. Each project card shows the project name, description, and a count of pending and in-progress tasks (can be 0 for now). From the Dashboard the user can create a new project, edit an existing one, and delete one. A Project View page (the route for a single project) renders as a placeholder — it will be filled in by later issues.

Data fetching uses React Query. The API client centralizes the base URL from an environment variable.

## Acceptance criteria

- [ ] `GET /api/projects` returns an array of all projects
- [ ] `POST /api/projects` creates a project and returns it with a 201 status
- [ ] `PUT /api/projects/:id` updates name and/or description
- [ ] `DELETE /api/projects/:id` deletes the project and returns 204
- [ ] `GET /api/projects/:id` returns 404 for a non-existent project
- [ ] Dashboard page lists all projects fetched from the API
- [ ] Each project card shows name and description
- [ ] User can open a form to create a new project (name required, description optional)
- [ ] User can open a form to edit an existing project's name and description
- [ ] User can delete a project with a confirmation step
- [ ] Clicking a project navigates to the Project View route (placeholder content is acceptable)
- [ ] All mutations invalidate and refetch the project list via React Query

## Blocked by

- Blocked by `issues/002-database-initialization.md`

## User stories addressed

- User story 1 (create project)
- User story 2 (dashboard listing projects)
- User story 3 (pending/in-progress task count per project)
- User story 23 (edit project)
- User story 24 (delete project)
