# DevLog AI — Handoff Document
**Date:** 2026-06-04  
**Repo:** `E:\Trabajos\ids\DevLog-IA` | branch: `main` | remote: `https://github.com/Cris-Vasan/DevLog-IA`  
**Last commit:** `8dd5a2b` — Add E2E test suite with Playwright (16 tests)

---

## Estado del proyecto: COMPLETO + TESTEADO

| Área | Estado |
|---|---|
| Backend (issues 001–014) | ✅ 147 unit/integration tests passing |
| Dashboard | ✅ lista proyectos, crear/editar/borrar, link al Converter |
| Project View | ✅ Kanban, filtros, Work Sessions |
| Note Converter | ✅ `/convert` → Claude → task card |
| E2E (Playwright) | ✅ 16 tests, 3 spec files |

---

## Tests

### Unit / integration (server)
```bash
npm run test:server   # 147 tests — Mocha + Chai + Supertest
```

### E2E (Playwright)
```bash
npm run test:e2e      # 16 tests — Chromium headless
```
Levanta servidores propios en `:3002` (API) y `:5174` (Vite). DB aislada en `data/e2e-test.db`.

| Spec | Tests |
|---|---|
| `e2e/dashboard.spec.js` | 4 — create project, navigate, Note Converter link |
| `e2e/project-view.spec.js` | 8 — Kanban, create task, status advance, filtros, sessions |
| `e2e/note-converter.spec.js` | 4 — disabled state, enable, error sin API key, reset |

---

## Cómo levantar

```bash
cd E:\Trabajos\ids\DevLog-IA
mkdir data          # si no existe
cp .env.example .env  # completar ANTHROPIC_API_KEY
npm run dev         # server :3001 + Vite :5173
```

Note Converter requiere `ANTHROPIC_API_KEY`. Sin ella el servidor devuelve 503 y la UI muestra el error.

---

## Posibles próximos pasos

- **Deploy** — build del cliente, servir estáticos desde Express, env vars en prod
- **CI** — agregar GitHub Actions que corra `test:server` y `test:e2e` en cada PR
- **UX extras** — paginación, búsqueda de tareas, exportar sesiones

---

## Archivos clave

| Qué | Dónde |
|---|---|
| Arquitectura y comandos | `CLAUDE.md` |
| PRD | `issues/prd.md` |
| Issues completadas | `issues/done/` |
| Server entry | `server/src/index.js` |
| Constants (enums) | `server/src/constants.js` |
| AI service | `server/src/services/ai.js` |
| API client | `client/src/api/client.js` |
| Hooks | `client/src/hooks/` |
| Dashboard | `client/src/pages/Dashboard.jsx` |
| Project View | `client/src/pages/ProjectView.jsx` |
| Note Converter | `client/src/pages/NoteConverter.jsx` |
| E2E specs | `e2e/` |
| Playwright config | `playwright.config.js` |

---

## Notas de entorno

- **Shell:** PowerShell + Bash (Bash usa paths POSIX `/e/Trabajos/...`)
- **Git desde subdirectorios:** usar `git -C "E:/Trabajos/ids/DevLog-IA" <cmd>`
- **CORS:** Vite proxy reenvía `/api` → `:3001` (dev) / `:3002` (e2e)
- **data/:** debe existir antes de iniciar el servidor
