## What to build

Fix a bug in `client/src/api/client.js`: the `apiFetch` function spreads `...options` before merging headers, which means any caller passing a `headers` key silently overwrites `Content-Type: application/json`.

Optionally: classify HTTP errors by status code so hooks can distinguish validation errors (400) from server errors (500) and display appropriate UI feedback.

## Acceptance criteria

- [ ] `apiFetch` merges headers correctly — caller headers extend defaults, not overwrite them
- [ ] Fix: `headers: { 'Content-Type': 'application/json', ...options.headers }` is preserved when `...options` is spread
- [ ] (Optional) `apiFetch` throws a structured error `{ message, status, isValidation }` instead of a plain string
- [ ] No existing API behavior changes for current callers

## Blocked by

None — can start immediately

## Type

AFK — bug fix + optional enhancement
