## What to build

Move enum validation out of route handlers and into the service layer. Currently `routes/tasks.js` validates `priority`, `category`, and `status` inline — duplicated between POST and PUT with slightly different logic. If a route bypasses validation, a raw DB exception surfaces instead of a clean 400.

Add `validateTaskCreate(fields)` and `validateTaskUpdate(fields)` to `services/tasks.js`. Each returns `null` (valid) or `{ error: '...' }`. Route handlers call validate, map the result to HTTP 400, then call the service. DB `CHECK` constraints remain as a safety net.

## Acceptance criteria

- [ ] `services/tasks.js` exports `validateTaskCreate(fields)` and `validateTaskUpdate(fields)`
- [ ] Each validator returns `null` on success or `{ error: string }` on failure
- [ ] Route handlers for POST and PUT tasks call the validator and return 400 if it fails
- [ ] No enum array literals remain in `routes/tasks.js`
- [ ] All existing 400-validation tests continue to pass
- [ ] New unit tests cover `validateTaskCreate` and `validateTaskUpdate` directly (no HTTP)

## Blocked by

- `009-enum-constants.md` — validators import from `constants.js`

## Type

AFK — refactor only, no new user-facing behavior
