# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DevLog AI — a full-stack web app for individual developers to organize projects, register technical tasks, log work sessions, and convert free-form development notes into structured tasks using AI (Claude).

## Monorepo structure

```
devlog-ai/
  client/                  ← React + Vite + Tailwind CSS + shadcn/ui + React Query
  server/                  ← Node.js + Express + SQLite (better-sqlite3)
  issues/                  ← PRD and vertical-slice issue files (done/ for completed)
  .agents/skills/          ← mattpocock/skills toolkit (agent skill definitions)
  .claude/skills/          ← Claude Code skill definitions
  skills-lock.json         ← skills version lock
  devlog-ai-handoff.md     ← latest session handoff document
  architecture-review-*    ← architecture analysis reports
  package.json             ← root scripts only (no shared code)
```

## Commands

From the repo root (once scaffolded):

```bash
npm run dev          # start both server and client concurrently
npm run dev:server   # start Express server only
npm run dev:client   # start Vite dev server only
npm run test         # run all tests
npm run test:server  # run server tests only
```

From `/server`:

```bash
npm test                        # run all server tests
npm test -- --grep "Projects"   # run a single test suite by name
```

## Architecture

### Data hierarchy

`Project → Tasks` and `Project → Sessions`. Sessions optionally link to Tasks via a `session_tasks` join table.

### Backend (`/server`)

- **Entry point** (`src/index.js`) initializes the DB connection, creates the Anthropic client if `ANTHROPIC_API_KEY` is set, registers Express routes, and starts the server.
- **Database module** (`src/db.js`) opens the SQLite file at `DATABASE_PATH` (from env), runs schema migrations on startup, and exports a single shared connection used by all services.
- **Constants** (`src/constants.js`) — single source of truth for enum arrays (`VALID_PRIORITIES`, `VALID_CATEGORIES`, `VALID_STATUSES`). Import from here; never hardcode enum strings elsewhere.
- **Service layer** (`src/services/`: `projects`, `tasks`, `sessions`, `ai`) contains all business logic and SQL queries. Routes are thin — they validate input, call a service, and return JSON.
- **`requireProject` middleware** (`src/middleware/requireProject.js`) — looks up a project by `:id`, attaches it to `req.project`, and returns 404 if not found. Used by all project-scoped routes.
- **AI service** (`src/services/ai.js`) — the Anthropic client is injected at startup (not imported directly). Returns `{ title, description, priority, category }`. The API key never leaves the server. Returns 503 if the client is not configured.

### Frontend (`/client`)

- **API client** (`src/api/client.js`) — single module wrapping `fetch` with base URL from `VITE_API_URL`. Exports `projectsApi`, `tasksApi`, `sessionsApi`, `aiApi`.
- **React Query hooks** (`src/hooks/`) — one file per resource: `useProjects`, `useTasks`, `useSessions`, `useAI`. These own all fetching, mutation, and cache invalidation.
- **Pages** (`src/pages/`) — three routes:
  - `/` → `Dashboard` — project list with task count, link to Note Converter
  - `/projects/:id` → `ProjectView` — Kanban board (Pending / In Progress / Done), filter controls, Work Sessions section
  - `/convert` → `NoteConverter` — textarea input → `POST /api/ai/convert` → structured task card with title, description, priority/category badges
- **Enums** (`src/lib/enums.js`) — client-side constants for labels and badge colours. Keep in sync with `server/src/constants.js`.
- **UI** — shadcn/ui components. Keep page components thin; extract reusable pieces as needed.

### Database schema

Four tables: `projects`, `tasks`, `sessions`, `session_tasks`. Cascade deletes are enforced at the DB level — deleting a project removes all its tasks and sessions.

Enum values enforced via `CHECK` constraints:
- `priority`: `low`, `medium`, `high`
- `category`: `bug`, `feature`, `refactor`, `docs`, `setup`, `research`
- `status`: `pending`, `in_progress`, `done`

### REST API shape

All endpoints under `/api`. Resources follow:
- `/api/projects` — CRUD
- `/api/projects/:id/tasks` — list + create (supports `?status=`, `?priority=`, `?category=`)
- `/api/tasks/:id` — update + delete
- `/api/projects/:id/sessions` — list + create
- `/api/sessions/:id` — update + delete
- `/api/ai/convert` — POST `{ note }` → `{ title, description, priority, category }`

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key for AI conversion |
| `PORT` | No | `3001` | Express server port |
| `DATABASE_PATH` | No | `./data/devlog.db` | Path to the SQLite file |
| `VITE_API_URL` | No | `http://localhost:3001` | Base URL used by the React client |

See `.env.example` for the full template.

## Issue tracking

Work is broken into vertical slices in `issues/`. Read `issues/prd.md` for the full product spec. Completed issues are in `issues/done/`.

| Issue | Title | Status |
|---|---|---|
| 001 | Monorepo scaffold | ✅ done |
| 002 | Database initialization | ✅ done |
| 003 | Projects CRUD | ✅ done |
| 004 | Tasks CRUD | ✅ done |
| 005 | Task filtering UI | ✅ done |
| 006 | Sessions CRUD | ✅ done |
| 007 | Session–task associations | ✅ done |
| 008 | AI note conversion | ✅ done |
| 009 | Enum constants extraction | ✅ done |
| 010 | Router factory pattern | ✅ done |
| 011 | `requireProject` middleware | ✅ done |
| 012 | Task validation in service layer | ✅ done |
| 013 | Service-layer unit tests | ✅ done |
| 014 | apiFetch header spread fix | ✅ done |

**All issues complete.** The project is feature-complete as of 2026-06-04.

## E2E tests

16 Playwright tests covering all three pages. Run with:

```bash
npm run test:e2e
```

Tests spin up isolated servers (API on `:3002`, Vite on `:5174`) with a dedicated DB (`data/e2e-test.db`). Each test resets state via the projects API before running.

| File | Tests |
|---|---|
| `e2e/dashboard.spec.js` | 4 — create project, navigate, Note Converter link |
| `e2e/project-view.spec.js` | 8 — Kanban, create task, status advance, filters, sessions |
| `e2e/note-converter.spec.js` | 4 — disabled state, enable on input, error on no API key, reset |

Supporting files: `playwright.config.js`, `e2e/helpers.js`, `e2e/global-setup.js`, `server/start-test.js`, `client/vite.config.e2e.js`.
