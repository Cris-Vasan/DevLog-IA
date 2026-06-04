## Parent PRD

`issues/prd.md`

## What to build

Add filter controls to the Project View task list. The backend already supports `?status=`, `?priority=`, and `?category=` query params (implemented in issue 004). This slice surfaces those filters in the UI.

The Project View should show filter controls that allow the user to narrow the visible task list by one or more of: status (`pending`, `in_progress`, `done`), priority (`low`, `medium`, `high`), and category (`bug`, `feature`, `refactor`, `docs`, `setup`, `research`). Filters are applied client-side via React Query query params — the active filters are passed to the API and the result list updates accordingly.

## Acceptance criteria

- [ ] Project View shows filter controls for status, priority, and category
- [ ] Selecting a filter value updates the task list to show only matching tasks
- [ ] Multiple filters can be active simultaneously (e.g. status=in_progress AND priority=high)
- [ ] Clearing all filters restores the full task list
- [ ] Filter state is reflected in the active UI controls (selected value is visually indicated)
- [ ] The task list shows a message when no tasks match the active filters

## Blocked by

- Blocked by `issues/004-tasks-crud.md`

## User stories addressed

- User story 15 (filter by status)
- User story 16 (filter by priority)
- User story 17 (filter by category)
