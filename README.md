# DevLog AI

Aplicación web full stack para desarrolladores individuales. Permite organizar proyectos, registrar tareas técnicas, guardar sesiones de trabajo y convertir notas de desarrollo en tareas estructuradas usando IA.

## Stack

- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui + React Query
- **Backend:** Node.js + Express
- **Base de datos:** SQLite (`better-sqlite3`)
- **IA:** Anthropic API (Claude)

## Estructura

```
devlog-ai/
  client/   ← React frontend
  server/   ← Express backend
  issues/   ← PRD e issues de implementación
```

## Inicio rápido

1. Copiar el archivo de variables de entorno:

```bash
cp .env.example .env
```

2. Agregar tu `ANTHROPIC_API_KEY` en `.env`.

3. Instalar dependencias:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

4. Iniciar en modo desarrollo:

```bash
npm run dev
```

El servidor corre en `http://localhost:3001` y el cliente en `http://localhost:5173`.

## Tests

```bash
npm test              # todos los tests
npm run test:server   # solo backend
```

