## What to build

Extract all enum constants (`priority`, `category`, `status`) to a single canonical source. Right now `VALID_PRIORITIES`, `VALID_CATEGORIES`, and `VALID_STATUSES` are defined independently in `server/src/services/tasks.js`, `server/src/routes/tasks.js`, `client/src/pages/ProjectView.jsx`, and the DB `CHECK` constraints — four sources of truth.

Create `server/src/constants.js` as the single source on the backend. Add `GET /api/meta/enums` so the frontend can fetch the canonical list and replace its hardcoded arrays. Color maps (`PRIORITY_COLORS`, `CATEGORY_COLORS`) move to one shared location in the client.

## Acceptance criteria

- [ ] `server/src/constants.js` exports `VALID_PRIORITIES`, `VALID_CATEGORIES`, `VALID_STATUSES`
- [ ] `services/tasks.js` and `routes/tasks.js` import from `constants.js` (no inline arrays)
- [ ] `GET /api/meta/enums` returns `{ priorities, categories, statuses }`
- [ ] `client/src/pages/ProjectView.jsx` no longer hardcodes enum arrays — consumes the API or a shared module
- [ ] Color maps live in one client-side file
- [ ] All 52+ existing tests continue to pass

## Blocked by

None — can start immediately

## Type

AFK — refactor only, no new user-facing behavior
