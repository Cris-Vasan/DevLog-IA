# 🔬 Sección 2: Anatomía de la Complejidad

> *"The best modules are those whose interfaces are much simpler than their implementations."*
> — John Ousterhout, *A Philosophy of Software Design*, Cap. 4

---

## Marco conceptual

Ousterhout define la **profundidad de un módulo** (module depth) como la relación entre la complejidad que oculta y la complejidad que expone en su interfaz. Un **módulo profundo** (*deep module*) tiene una interfaz pequeña frente a una implementación rica. Un **módulo superficial** (*shallow module*) tiene una interfaz casi tan compleja como su implementación — el costo de aprenderlo es casi igual al costo de reimplementarlo.

Esta sección aplica ese framework al código generado por Ralph.

---

## 2.1 Módulos Profundos — Los mejores diseños del agente

### 🟢 `server/src/db.js` — El módulo de base de datos

Este es el módulo más profundo del sistema. Su interfaz hacia el resto de la aplicación es **un único objeto de conexión compartido**:

```javascript
// Toda la aplicación consume el módulo así:
const db = require('./db');
```

Detrás de esa interfaz de una sola línea, el módulo oculta:

- Apertura del archivo SQLite en la ruta configurada por `DATABASE_PATH`
- Ejecución de migraciones de esquema al arranque (`CREATE TABLE IF NOT EXISTS`)
- Definición de las cuatro tablas con sus `CHECK` constraints y `CASCADE DELETE`
- Configuración de `PRAGMA foreign_keys = ON`
- Manejo del caso en que el directorio `data/` no existe

La interfaz es mínima; la implementación es considerablemente compleja. Esto es un módulo profundo en el sentido exacto de Ousterhout.

**Diagrama de profundidad:**

```
INTERFAZ:  db  (1 export)
           ─────────────────────────────────────────
IMPL:      apertura SQLite + migraciones + schema
           + foreign keys + path resolution
           (≈ 60 líneas de lógica)
```

---

### 🟢 `server/src/middleware/requireProject.js` — El middleware de validación de contexto

Interfaz:

```javascript
// Uso en cualquier ruta con proyecto padre:
router.get('/projects/:id/tasks', requireProject(db), handler)
```

El middleware oculta:
1. La consulta SQL para buscar el proyecto por `id`
2. La lógica de retorno `404` con mensaje JSON estandarizado
3. La inyección del proyecto en `req.project` para downstream handlers

Sin este módulo, **cada uno** de los handlers de tasks y sessions tendría que replicar ese bloque. El architecture review del 2026-05-24 identificó exactamente este problema como *"pattern repeats"* antes de que el módulo existiera. Después de implementar el issue 011, la interfaz de cada ruta se redujo al trabajo real, sin boilerplate de validación de existencia.

---

### 🟢 `server/src/services/ai.js` — El servicio de conversión IA

Interfaz pública (llamada desde la ruta `/api/ai/convert`):

```javascript
const result = await convertNoteToTask(client, noteText);
// Retorna: { title, description, priority, category }
// O lanza si client es null → el route devuelve 503
```

Lo que oculta detrás de esa firma de cuatro campos:

- Construcción del prompt de sistema con instrucciones de formato JSON
- Llamada a `messages.create` de la Anthropic API
- Parseo y validación de la respuesta del modelo
- Normalización de los valores de `priority` y `category` al vocabulario del dominio
- El hecho de que el cliente Anthropic es **inyectado**, no importado directamente (la API key nunca sale del servidor)

Para el consumidor de este módulo — la ruta Express — la complejidad de interactuar con un LLM externo queda completamente encapsulada. Esto es ocultamiento de información en su forma más útil.

---

### 🟢 `client/src/hooks/` — Los React Query hooks

Los cuatro hooks (`useProjects`, `useTasks`, `useSessions`, `useAI`) presentan una interfaz declarativa que oculta la complejidad de sincronización de datos:

```javascript
// Consumo en un componente:
const { data: tasks, isLoading, mutate: createTask } = useTasks(projectId);
```

Detrás de esa interfaz simple se oculta:
- Configuración de `queryKey` para invalidación granular de cache
- Lógica de refetch en foco / reconexión
- Manejo de estados de loading, error y success
- Llamadas al `api/client.js` y serialización/deserialización JSON

Los componentes de página son notablemente delgados gracias a esto — exactamente el patrón que Ousterhout llama "pulling complexity downward".

---

## 2.2 Módulos Superficiales — Los puntos donde el agente falló

### 🔴 El estado inicial de los enums — cuatro fuentes de verdad

El architecture review del 2026-05-24 documentó el problema antes de que fuera corregido. En el estado inicial, los valores de dominio `priority`, `category` y `status` existían como literales de string repetidos en cuatro lugares:

```javascript
// server/src/services/tasks.js (versión inicial)
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_CATEGORIES = ['bug', 'feature', 'refactor', 'docs', 'setup', 'research'];

// server/src/routes/tasks.js — COPIA
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// client/src/pages/ProjectView.jsx — COPIA
const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { low: 'blue', medium: 'yellow', high: 'red' };

// server/src/db.js — COPIA en CHECK constraints
CHECK(priority IN ('low','medium','high'))
```

Este es un módulo superficial en el peor sentido: la "interfaz" de conocer los valores válidos es exactamente tan compleja como la "implementación" de definirlos. Cuatro archivos para cambiar cuando el negocio agrega una prioridad "critical".

**La directriz humana que corrigió esto** fue el issue 009: *"Extraer un `server/src/constants.js` como single source of truth"*. El resultado:

```javascript
// server/src/constants.js — ÚNICO lugar
export const VALID_PRIORITIES = ['low', 'medium', 'high'];
export const VALID_CATEGORIES = ['bug', 'feature', 'refactor', 'docs', 'setup', 'research'];
export const VALID_STATUSES = ['pending', 'in_progress', 'done'];
```

El cliente mantiene su propio `client/src/lib/enums.js` paralelo (la frontera cliente/servidor impide importación directa), pero la alineación es explícita y documentada en `CLAUDE.md`: *"Keep in sync with server/src/constants.js"*.

---

### 🔴 El acceso a la base de datos por string mágico (`req.app.get('db')`)

El agente inicialmente resolvió el problema de compartir la conexión de base de datos con un patrón que esconde la dependencia detrás de una cadena de texto en el estado de Express:

```javascript
// routes/projects.js — versión inicial (shallow, opaca)
router.get('/', (req, res) => {
  const db = req.app.get('db');  // ← dependencia invisible en la firma
  const projects = listProjects(db);
  res.json(projects);
});
```

El problema de Ousterhout aquí es de **information leakage**: el mecanismo de entrega de la dependencia (`req.app`, la clave `'db'`) se filtra a cada handler. Cada ruta necesita saber que vive dentro de una app Express y que esa app tiene una propiedad específica. La interfaz del handler expone detalles del sistema de inyección.

La **directriz humana** del issue 010 (*"Router factory pattern"*) corrigió esto:

```javascript
// routes/projects.js — después (deep, explícito)
module.exports = function projectsRouter(db) {
  const router = Router();
  
  router.get('/', (req, res) => {
    const projects = listProjects(db);  // ← db es un closure, no una búsqueda
    res.json(projects);
  });
  
  return router;
};

// index.js — el wiring es explícito
app.use('/api', projectsRouter(db));
```

La dependencia ahora es visible en la firma del módulo. Los tests ya no necesitan `app.set('db', db)` — pasan el db directamente al router factory.

---

## 2.3 Fuga de Información (Information Leakage)

Ousterhout define *information leakage* como el caso donde una decisión de diseño se refleja en múltiples módulos, creando una dependencia entre ellos que no es visible en sus interfaces.

### Caso detectado: detalles de red filtrándose hacia los hooks

En una versión intermedia del desarrollo, los componentes de página accedían directamente a la URL del API:

```javascript
// ProjectView.jsx — versión con fuga
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/tasks`);
```

El componente de UI tenía conocimiento de:
1. La existencia de `VITE_API_URL` como variable de entorno
2. El path exacto del endpoint (`/api/projects/:id/tasks`)
3. La serialización HTTP (fetch, JSON.parse)

Esto viola el principio de ocultamiento de información: la UI no debería saber nada sobre cómo se transportan los datos.

**La corrección** fue consolidar todo el acceso de red en `client/src/api/client.js`, que exporta objetos semánticos:

```javascript
// client/src/api/client.js — el módulo profundo resultante
export const tasksApi = {
  list: (projectId, filters) => apiFetch(`/projects/${projectId}/tasks`, { params: filters }),
  create: (projectId, data) => apiFetch(`/projects/${projectId}/tasks`, { method: 'POST', body: data }),
  update: (taskId, data) => apiFetch(`/tasks/${taskId}`, { method: 'PUT', body: data }),
  delete: (taskId) => apiFetch(`/tasks/${taskId}`, { method: 'DELETE' }),
};
```

Ahora los componentes consumen los hooks, los hooks consumen `tasksApi`, y `tasksApi` es el único módulo que conoce URLs, métodos HTTP y serialización. La fuga está contenida.

### El bug del `apiFetch` header spread (issue 014)

Un caso sutil de information leakage fue identificado en el architecture review: `apiFetch` hacía spread de `...options` *después* de definir `Content-Type`, lo que permitía que un caller sobreescribiera silenciosamente el header. Esto filtraba el detalle de implementación de la serialización hacia los callers — que podían accidentalmente (o intencionalmente) romper el contrato JSON. El issue 014 corrigió el orden del spread:

```javascript
// Antes (fuga implícita — el caller puede destruir Content-Type):
headers: { 'Content-Type': 'application/json', ...options.headers }

// Después (el contrato JSON está protegido):
headers: { ...options.headers, 'Content-Type': 'application/json' }
```

---

[← La Bala Trazadora](./01-tracer-bullet.md) | [Siguiente: El Veredicto Retrospectivo →](./03-veredicto-subagentes.md)
