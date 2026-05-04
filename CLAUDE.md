# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DevLog AI — a full-stack web app for individual developers to organize projects, register technical tasks, log work sessions, and convert free-form development notes into structured tasks using AI (Claude).

## Monorepo structure

```
devlog-ai/
  client/       ← React + Vite + Tailwind CSS + shadcn/ui + React Query
  server/       ← Node.js + Express + SQLite (better-sqlite3)
  issues/       ← PRD and vertical-slice issue files
  package.json  ← root scripts only (no shared code)
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

- **Entry point** initializes the DB connection, registers Express routes, and starts the server.
- **Database module** opens the SQLite file at `DATABASE_PATH` (from env), runs schema migrations on startup, and exports a single shared connection used by all services.
- **Service layer** (`projects`, `tasks`, `sessions`, `ai`) contains all business logic and SQL queries. Routes are thin — they validate input, call a service, and return JSON.
- **AI service** calls the Anthropic API with a server-side prompt and returns `{ title, description, priority, category }`. The API key never leaves the server.

### Frontend (`/client`)

- **API client** — a single module wrapping `fetch` with the base URL from `VITE_API_URL`. All hooks import from here.
- **React Query hooks** — one custom hook per resource (`useProjects`, `useTasks`, `useSessions`, `useAIConvert`). These own all fetching, mutation, and cache invalidation.
- **Pages** — four routes: Dashboard (project list), Project View (tasks + sessions for one project), Note Converter (AI conversion flow), Session Form.
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

Work is broken into vertical slices in `issues/`. Read `issues/prd.md` for the full product spec. Each `issues/NNN-*.md` file is a self-contained implementation unit with acceptance criteria and dependency info.

Current slices (in dependency order):
1. `001-monorepo-scaffold` — repo setup, no blockers
2. `002-database-initialization` — SQLite schema, blocked by 001
3. `003-projects-crud` — projects API + Dashboard UI, blocked by 002
4. `004-tasks-crud` — tasks API + Project View UI, blocked by 003
5. `005-task-filtering` — filter controls, blocked by 004
6. `006-sessions-crud` — sessions API + UI, blocked by 003
7. `007-session-task-associations` — session↔task join, blocked by 004 + 006
8. `008-ai-note-conversion` — AI endpoint + Note Converter UI, blocked by 004
