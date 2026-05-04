## Parent PRD

`issues/prd.md`

## What to build

Set up the monorepo structure with a working development environment. The repository should contain `/client` (React + Vite + Tailwind CSS + shadcn/ui) and `/server` (Express) as subdirectories, with a root-level script that runs both concurrently in development mode.

The server should expose a single `GET /api/health` endpoint that returns `{ "status": "ok" }`. The client should render a minimal placeholder page that confirms it can reach the server. No database, no business logic — just a verified full-stack scaffold that both developers and CI can build from.

## Acceptance criteria

- [ ] Running `npm run dev` from the repo root starts both the Express server and the Vite dev server
- [ ] `GET /api/health` returns `{ "status": "ok" }` with status 200
- [ ] The React app renders without errors in the browser
- [ ] Tailwind CSS is configured and a shadcn/ui component (e.g. Button) renders correctly
- [ ] A `.env.example` file exists at the repo root documenting all required environment variables
- [ ] A `.gitignore` is present that excludes `node_modules`, `.env`, and the SQLite database file

## Blocked by

None — can start immediately.

## User stories addressed

- User story 25 (data stored locally)
- User story 27 (configuration from environment variables)
