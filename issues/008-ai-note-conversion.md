## Parent PRD

`issues/prd.md`

## What to build

Deliver the AI-powered note-to-task conversion feature end-to-end: the backend endpoint that calls the Anthropic API, and the Note Converter page in the frontend.

The server exposes `POST /api/ai/convert` which accepts `{ "note": "string" }`, calls the Claude API with a server-side prompt, and returns `{ "title": "string", "description": "string", "priority": "low|medium|high", "category": "bug|feature|refactor|docs|setup|research" }`. The `ANTHROPIC_API_KEY` is read from environment variables and never sent to the client. If the API is unavailable or returns an unexpected response, the endpoint returns a clear error with an appropriate HTTP status code.

The Note Converter is a dedicated page accessible from the Project View (scoped to a specific project). The user writes a free-form note in a text area, clicks "Convert", sees a loading state while the API is called, and then reviews the AI-generated task fields in an editable form. The user can modify any field before saving the task to the project. The user can also discard the result and start over.

## Acceptance criteria

- [ ] `POST /api/ai/convert` calls the Anthropic API and returns a structured task object
- [ ] The returned `priority` value is always one of `low`, `medium`, `high`
- [ ] The returned `category` value is always one of `bug`, `feature`, `refactor`, `docs`, `setup`, `research`
- [ ] If the Anthropic API is unavailable, the endpoint returns a 502 with a descriptive error message
- [ ] If the AI returns malformed output, the endpoint returns a 500 with a descriptive error message
- [ ] The `ANTHROPIC_API_KEY` is never included in any client-side response or bundle
- [ ] The Note Converter page has a text area for the free-form note and a Convert button
- [ ] While waiting for the API response, a loading indicator is shown and the button is disabled
- [ ] After conversion, the AI-generated fields are displayed in an editable form pre-filled with the result
- [ ] The user can edit any field (title, description, priority, category) before saving
- [ ] Saving creates the task in the current project and navigates to the Project View
- [ ] The user can discard the result and return to the empty note input
- [ ] If the API call fails, the UI shows a user-friendly error message without crashing

## Blocked by

- Blocked by `issues/004-tasks-crud.md`

## User stories addressed

- User story 5 (write a note and convert it with AI)
- User story 6 (AI returns title, description, priority, category)
- User story 7 (review AI-generated task before saving)
- User story 8 (edit any field before saving)
- User story 9 (discard the AI result)
- User story 26 (Claude API call runs on the backend)
