## Parent PRD

`issues/prd.md`

## What to build

Initialize the SQLite database layer on the server. On startup, the Express app should open (or create) the SQLite file at the path specified by `DATABASE_PATH` in `.env`, run a migration that creates all four tables, and expose the database connection for use by the service layer.

The four tables to create are `projects`, `tasks`, `sessions`, and `session_tasks`, with the schema, constraints, and cascade rules defined in the Implementation Decisions section of the PRD. All data and enum constraints (`priority`, `category`, `status`) should be enforced at the database level.

## Acceptance criteria

- [ ] Starting the server creates the SQLite file at the configured `DATABASE_PATH` if it does not exist
- [ ] All four tables (`projects`, `tasks`, `sessions`, `session_tasks`) are created on first run
- [ ] Re-starting the server with an existing database does not error or recreate tables
- [ ] `priority` column rejects values outside `low`, `medium`, `high`
- [ ] `category` column rejects values outside `bug`, `feature`, `refactor`, `docs`, `setup`, `research`
- [ ] `status` column rejects values outside `pending`, `in_progress`, `done`
- [ ] Deleting a project cascades to delete its tasks and sessions
- [ ] Deleting a task or session removes the corresponding rows in `session_tasks`
- [ ] The database file path is not hardcoded — it reads from `DATABASE_PATH` environment variable

## Blocked by

- Blocked by `issues/001-monorepo-scaffold.md`

## User stories addressed

- User story 25 (local SQLite storage)
- User story 27 (environment variable configuration)
