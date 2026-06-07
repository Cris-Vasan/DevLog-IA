# 🗺️ DevLog AI — Software Journey

> Bitácora crítica de co-creación hombre-máquina sobre el desarrollo de **DevLog AI**: una aplicación fullstack para que desarrolladores individuales organicen proyectos, registren tareas técnicas y conviertan notas libres en issues estructurados usando IA.

---

## Sobre este sitio

Este documento no es una referencia técnica tradicional. Es una **narrativa retrospectiva** que examina, bajo la lente de la ingeniería de software moderna, cómo un equipo humano y un agente de IA (Ralph / Claude Code) co-construyeron un sistema funcional en un sprint acotado.

El análisis se fundamenta directamente en los conceptos de **"A Philosophy of Software Design"** de John Ousterhout.

---

## Stack del sistema

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + Tailwind CSS + shadcn/ui + React Query |
| Backend | Node.js + Express |
| Base de datos | SQLite (`better-sqlite3`) |
| IA | Anthropic API (Claude) |
| Tests E2E | Playwright (16 tests) |
| Tests unitarios | Mocha + Chai + Supertest (147 tests) |

---

## Estado final del proyecto

**Completado el 2026-06-04.** Los 14 issues verticales derivados del PRD fueron resueltos y cerrados por el flujo de agentes.

```
issues/done/
  001 - Monorepo scaffold          ✅
  002 - Database initialization    ✅
  003 - Projects CRUD              ✅
  004 - Tasks CRUD                 ✅
  005 - Task filtering UI          ✅
  006 - Sessions CRUD              ✅
  007 - Session–task associations  ✅
  008 - AI note conversion         ✅
  009 - Enum constants extraction  ✅
  010 - Router factory pattern     ✅
  011 - requireProject middleware  ✅
  012 - Task validation in service ✅
  013 - Service-layer unit tests   ✅
  014 - apiFetch header spread fix ✅
```

---

## Secciones del Journey

| # | Sección | Descripción |
|---|---------|-------------|
| [01](./01-tracer-bullet.md) | 🎯 La Bala Trazadora | Estrategia de exploración y mitigación de riesgo inicial |
| [02](./02-anatomia-complejidad.md) | 🔬 Anatomía de la Complejidad | Módulos profundos vs. superficiales — análisis con código real |
| [03](./03-veredicto-subagentes.md) | ⚖️ El Veredicto Retrospectivo | Impacto del debate arquitectónico en la segunda mitad del sprint |

---

*Repositorio: [github.com/Cris-Vasan/DevLog-IA](https://github.com/Cris-Vasan/DevLog-IA)*
