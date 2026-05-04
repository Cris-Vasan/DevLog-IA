# PRD — DevLog AI (v1)

## Problem Statement

Developers working on personal, freelance, or academic projects struggle to keep their work organized in a single place. Ideas, pending tasks, bugs, and progress notes end up scattered across personal notes, chat messages, commit histories, and documents. This makes it hard to track what has been done, what is pending, and what the real state of a project is at any given moment. Existing tools like Notion, Trello, or GitHub Issues are either too generic or require too much manual structure — they don't speak the language of a developer's daily workflow.

## Solution

DevLog AI is a full-stack web application built specifically for individual developers. It provides a single workspace where a developer can organize projects, register technical tasks, log work sessions, and convert quick development notes into structured tasks using AI. The core differentiator is the AI-powered note-to-task conversion: the developer writes a free-form note (e.g., "auth endpoint fails when token expires and user stays logged in"), clicks a button, and the AI returns a structured task with title, description, priority, and category — ready to review and save. Everything lives in one place, tied to a project, with no collaboration overhead.

## User Stories

1. As a developer, I want to create a new project with a name and description, so that I can organize all my tasks and sessions under a single context.
2. As a developer, I want to see a dashboard listing all my projects, so that I can quickly understand the overall state of my work.
3. As a developer, I want each project card on the dashboard to show the number of pending and in-progress tasks, so that I can assess workload at a glance.
4. As a developer, I want to open a project and see all its tasks and sessions, so that I can navigate the full context of that project in one place.
5. As a developer, I want to write a free-form development note and click a button to convert it into a structured task using AI, so that I don't have to manually format every task I create.
6. As a developer, I want the AI to return a task title, description, priority, and category from my note, so that the resulting task is immediately useful without extra editing.
7. As a developer, I want to review the AI-generated task before saving it, so that I stay in control of what gets added to my project.
8. As a developer, I want to edit any field of the AI-generated task before saving, so that I can correct or refine the AI output when needed.
9. As a developer, I want to discard an AI-generated task if it is not useful, so that I am never forced to save something I don't want.
10. As a developer, I want to create tasks manually without using AI, so that I can add structured tasks directly when I already know what I want to record.
11. As a developer, I want each task to have a title, description, priority (low / medium / high), category (bug / feature / refactor / docs / setup / research), and status (pending / in_progress / done), so that tasks carry enough context to be actionable.
12. As a developer, I want to change the status of a task, so that I can track its progress through pending, in progress, and done.
13. As a developer, I want to edit an existing task, so that I can update its details as the work evolves.
14. As a developer, I want to delete a task, so that I can remove tasks that are no longer relevant.
15. As a developer, I want to filter tasks by status within a project, so that I can focus on what is active or pending.
16. As a developer, I want to filter tasks by priority within a project, so that I can focus on the most important work.
17. As a developer, I want to filter tasks by category within a project, so that I can see only bugs, or only features, etc.
18. As a developer, I want to log a work session manually with a date, estimated duration, and description of what I did, so that I have a record of time spent and progress made.
19. As a developer, I want to associate a work session with one or more tasks, so that I can link effort to specific work items.
20. As a developer, I want to see all sessions logged for a project in chronological order, so that I can review my work history.
21. As a developer, I want to edit a logged session, so that I can correct a date, duration, or description after the fact.
22. As a developer, I want to delete a session, so that I can remove incorrectly logged entries.
23. As a developer, I want to edit a project's name and description, so that I can keep its details accurate as the project evolves.
24. As a developer, I want to delete a project and all its associated tasks and sessions, so that I can clean up finished or abandoned work.
25. As a developer, I want the application to store all data locally using SQLite, so that my data is private and available without an internet connection.
26. As a developer, I want the AI integration to run through the backend, so that my Anthropic API key is never exposed in the browser.
27. As a developer, I want the application to load configuration from environment variables, so that it can be deployed to a server without code changes.

## Implementation Decisions

### Architecture

- **Monorepo structure** with two subdirectories: `/client` (React frontend) and `/server` (Express backend). A root-level `package.json` provides scripts to run both together in development.
- **No authentication in v1.** The app runs as a single-user local application. There is no login, registration, or session management.
- **Data hierarchy:** `Project → Tasks` and `Project → Sessions`. Sessions can optionally reference one or more tasks within the same project.

### Backend Modules

- **Database module** — initializes the SQLite database using `better-sqlite3`, runs migrations on startup, and exposes a single shared database connection. All queries go through this module.
- **Projects service** — CRUD operations for projects. Deleting a project cascades to delete all associated tasks and sessions.
- **Tasks service** — CRUD operations for tasks. Handles filtering by status, priority, and category. Validates that priority and category values match the predefined enums.
- **Sessions service** — CRUD operations for work sessions. Handles the many-to-many relationship between sessions and tasks.
- **AI conversion service** — receives a free-form note string, calls the Anthropic API using the Claude model, and returns a structured object with `title`, `description`, `priority`, and `category`. The prompt is defined server-side. The Anthropic API key is read from environment variables.
- **REST API routes** — Express router that maps HTTP endpoints to the service layer. All routes return JSON.

### Frontend Modules

- **API client** — a thin wrapper over `fetch` that centralizes base URL configuration and error handling. Used by all React Query hooks.
- **React Query hooks** — one custom hook per resource (`useProjects`, `useTasks`, `useSessions`, `useAIConvert`). These hooks encapsulate all data fetching, mutation, and cache invalidation logic.
- **Pages** — four top-level route components: Dashboard, Project View, Note Converter, Session Form.
- **UI components** — built with shadcn/ui primitives. Components are stateless where possible and receive data and callbacks as props.

### Database Schema

**projects**
- `id` INTEGER PRIMARY KEY
- `name` TEXT NOT NULL
- `description` TEXT
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP

**tasks**
- `id` INTEGER PRIMARY KEY
- `project_id` INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE
- `title` TEXT NOT NULL
- `description` TEXT
- `priority` TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high'))
- `category` TEXT NOT NULL CHECK(category IN ('bug', 'feature', 'refactor', 'docs', 'setup', 'research'))
- `status` TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'done'))
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
- `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP

**sessions**
- `id` INTEGER PRIMARY KEY
- `project_id` INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE
- `date` DATE NOT NULL
- `duration_minutes` INTEGER NOT NULL
- `description` TEXT NOT NULL
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP

**session_tasks** (join table)
- `session_id` INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE
- `task_id` INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE
- PRIMARY KEY (`session_id`, `task_id`)

### API Contracts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get a single project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project (cascades) |
| GET | `/api/projects/:id/tasks` | List tasks for a project (supports `?status=`, `?priority=`, `?category=`) |
| POST | `/api/projects/:id/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/projects/:id/sessions` | List sessions for a project |
| POST | `/api/projects/:id/sessions` | Create a session |
| PUT | `/api/sessions/:id` | Update a session |
| DELETE | `/api/sessions/:id` | Delete a session |
| POST | `/api/ai/convert` | Convert a free-form note to a structured task |

### AI Conversion

- Request body: `{ "note": "string" }`
- Response body: `{ "title": "string", "description": "string", "priority": "low|medium|high", "category": "bug|feature|refactor|docs|setup|research" }`
- The backend prompt instructs Claude to return valid JSON matching this schema. The frontend parses the response and pre-fills the task form for user review.

### Environment Variables

- `ANTHROPIC_API_KEY` — required for AI conversion
- `PORT` — Express server port (default: 3001)
- `DATABASE_PATH` — path to the SQLite file (default: `./data/devlog.db`)

## Testing Decisions

**What makes a good test:** Tests should verify observable behavior through the module's public interface, not internal implementation details. A test should break only when the behavior the user depends on changes — not when the internal code is refactored.

**Modules to test:**

- **Tasks service** — test CRUD operations and filtering logic against a real in-memory SQLite database (not a mock). Verify that invalid priority/category values are rejected, that cascade deletes work, and that filters return the correct subset of tasks.
- **Sessions service** — test creation, update, deletion, and the session-task association. Verify that deleting a session removes its join table entries.
- **AI conversion service** — test the prompt construction and response parsing logic. Mock the Anthropic API call to avoid network dependency in tests. Verify that the service handles malformed AI responses gracefully.
- **REST API routes** — integration tests using a test HTTP client (e.g., `supertest`) against the Express app with a real test database. Verify that the correct status codes and response shapes are returned.

**Out of scope for testing in v1:** Frontend component tests, end-to-end browser tests.

## Out of Scope

- User authentication, registration, and multi-user support
- Team collaboration features
- Real-time timer or Pomodoro tracking
- AI-powered background analysis or automatic suggestions
- Dev journal with fragment selection for task conversion (planned for v2)
- Reporting, charts, or progress graphs
- Global search across projects
- User settings or profile page
- Mobile application
- Browser extension
- GitHub / Linear / Jira integration
- Notifications or reminders
- Dark/light mode toggle (can default to one theme)
- Export or import of data

## Further Notes

- The AI conversion endpoint should be resilient: if the Anthropic API is unavailable or returns an unexpected response, the backend should return a clear error and the frontend should show a user-friendly message without crashing.
- The SQLite database file should not be committed to the repository. Add the database path to `.gitignore`.
- The `.env` file should not be committed. A `.env.example` file documenting required variables should be included instead.
- For v2, the most natural next features are: dev journal with AI fragment selection, task status board (kanban view), and user authentication for hosted deployment.
