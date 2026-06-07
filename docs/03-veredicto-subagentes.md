# ⚖️ Sección 3: El Veredicto Retrospectivo de los Sub-Agentes

> *"The best way to achieve good design is to invest in it. Change amplification is the first symptom of a design that didn't invest enough."*
> — John Ousterhout, *A Philosophy of Software Design*, Cap. 2

---

## 3.1 El Punto de Control Arquitectónico: contexto

El **2026-05-24**, aproximadamente en el punto medio del sprint, se ejecutó la skill `/improve-codebase-architecture` sobre el estado del código. El resultado fue el archivo `architecture-review-20260524.html` — un análisis de tres voces paralelas que debatían seis candidatos de mejora, rankeados por **leverage** (cuántos módulos se benefician), **locality** (qué tan concentrado es el cambio) y **timing** (qué tan pronto el costo del problema se compone).

Los seis candidatos identificados fueron:

| # | Candidato | Clasificación | Resuelto en issue |
|---|-----------|--------------|-------------------|
| 1 | Enum constants — sin single source of truth | **Strong** | 009 |
| 2 | DB connection hidden via `req.app.get('db')` | **Strong** | 010 |
| 3 | Parent-exists check duplicado en cada ruta | **Worth exploring** | 011 |
| 4 | Validación split entre ruta y DB | **Worth exploring** | 012 |
| 5 | Services sin tests unitarios directos | **Worth exploring** | 013 |
| 6 | `apiFetch()` — shallow wrapper con bug de header spread | **Speculative** | 014 |

---

## 3.2 Impacto del debate en la segunda mitad del sprint

### Velocidad: aceleración con fricción puntual

El debate de los sub-agentes no ralentizó el sprint — lo **organizó**. La recomendación del review fue explícita: *"Start with #2 — Router Factory"* porque era el cambio de menor costo y mayor impacto antes de que se agregaran más módulos de rutas (sessions, que llegaría en el issue 006).

El efecto observable en la segunda mitad del desarrollo:

**Issues 009–011 (semana 2, primeros):** Se ejecutaron como refactors de base antes de cualquier nueva feature. Esto fue costoso en términos de tiempo de sprint inmediato, pero estableció invariantes que los issues 012–014 pudieron asumir sin negociar.

**Issues 012–013 (validación + tests de servicio):** Gracias a que `constants.js` ya existía (issue 009) y el router factory ya estaba en lugar (010), mover la validación al service layer fue una operación quirúrgica. El agente no necesitó razonar sobre dónde vivían los enum values — ya tenían un lugar canónico.

**Issue 014 (apiFetch bug):** Este fue el único issue de la segunda mitad que llegó con un bug real ya documentado desde el architecture review. Su resolución tomó menos de una hora precisamente porque el review había identificado el archivo exacto (`client/src/api/client.js:3-16`) y la naturaleza del problema (orden del spread). El costo de *no* haberlo documentado habría sido descubrirlo como un bug de integración al final.

### Estimación del impacto sin el Punto de Control

Si los issues 009-011 no hubieran existido y el desarrollo hubiera continuado con el estado del código pre-review:

- **Issue 012** (validación en services) habría requerido primero extraer los enums, luego mover la validación — dos cambios en uno, con mayor riesgo de regresión.
- **Issue 013** (tests de servicio) habría encontrado que escribir tests directos al service layer era incómodo porque el `db` se obtenía via `req.app.get()`, no por inyección — los tests habrían seguido siendo HTTP-only.
- El **Issue 006** (sessions) habría replicado el patrón `req.app.get('db')` en un tercer módulo de rutas, y el `requireProject` check en al menos cuatro handlers adicionales.

---

## 3.3 Veredicto: elasticidad de la interfaz vs. Change Amplification

Ousterhout introduce *Change Amplification* (amplificación del cambio) como uno de los tres síntomas primarios de complejidad: cuando un cambio aparentemente simple requiere modificar muchos módulos.

### ¿La interfaz elegida resistió el cambio?

**Sí, en las capas que importaban.** El análisis concreto:

#### ✅ La capa de servicios absorbió los cambios sin amplificación

Cuando el issue 012 requirió mover la validación de rutas hacia servicios, el cambio fue local:

```
tasks.js (service)  ← se agregó validateCreate() y validateUpdate()
routes/tasks.js     ← se simplificó, delegando a service
```

El resto del sistema no se enteró. Los hooks del frontend, los componentes, los tests E2E — ninguno necesitó cambiar. La razón: el service layer era el módulo correcto para ese conocimiento desde el principio.

#### ✅ El `requireProject` middleware eliminó amplificación futura

Con el middleware en lugar, agregar cualquier recurso hijo de un proyecto (hipotéticamente: comentarios, attachments, tags) no requiere replicar la lógica de existencia. La interfaz de las rutas hijas es estable frente a ese tipo de extensión.

#### ⚠️ Amplificación parcial: los enums en cliente y servidor

El único punto donde se experimentó amplificación real fue la sincronización de `server/src/constants.js` con `client/src/lib/enums.js`. Agregar una nueva categoría de tarea requiere modificar ambos archivos. La nota en `CLAUDE.md` documenta esto explícitamente como un contrato manual.

Esto es una limitación arquitectónica conocida del monorepo con frontend/backend desacoplados sin bundler compartido. La alternativa — exponer los enums via `GET /api/meta/enums` y que el cliente los consuma dinámicamente — fue identificada en el architecture review como mejora futura, pero se clasificó como fuera del scope del sprint.

#### ✅ El AI service demostró "buen gusto arquitectónico"

El concepto de *buen gusto arquitectónico* de Ousterhout implica que una buena interfaz anticipa los cambios más probables y los hace baratos. El AI service pasó esta prueba cuando, al ajustar el prompt del modelo (para mejorar la calidad de categorización), el cambio fue completamente interno:

```javascript
// Solo se modificó server/src/services/ai.js
// Nada en las rutas, nada en el cliente, nada en los tests E2E cambió
```

El contrato de la interfaz — `{ title, description, priority, category }` — se mantuvo estable mientras la implementación evolucionó. Esto es exactamente el comportamiento que Ousterhout describe como indicador de un módulo bien diseñado.

---

## 3.4 Lecciones de co-creación hombre-máquina

### Lo que el agente hizo bien sin instrucciones explícitas

- La separación service/routes desde el issue 001 fue una decisión proactiva del agente que no estaba en el PRD.
- La inyección del cliente Anthropic (vs. importarlo directamente) protegió la testabilidad del AI service.
- Los cascade deletes en el esquema SQLite evitaron la necesidad de lógica de limpieza en el service layer.

### Lo que requirió intervención humana

| Problema | Por qué el agente no lo resolvió solo |
|----------|--------------------------------------|
| Cuatro fuentes de verdad para enums | El agente optimiza localmente — cada issue parecía correcto por separado |
| `req.app.get('db')` como patrón de inyección | Es un patrón común en Express; el agente siguió la convención más frecuente en su training data |
| Header spread order en `apiFetch` | Bug silencioso; sin un test que lo ejercitara, no había señal de falla |

La lectura crítica de esto es que **el agente tiende hacia la consistencia local** (cada módulo es razonablemente correcto en aislamiento) pero **falla en la coherencia global** (los módulos forman un sistema con invariantes compartidos). El Punto de Control Arquitectónico fue el mecanismo que subsanó exactamente esa brecha.

---

## 3.5 Estado final del sistema bajo la óptica de Ousterhout

| Dimensión | Evaluación |
|-----------|-----------|
| Profundidad de módulos | Alta en servicios y middleware; media en rutas (thin by design) |
| Ocultamiento de información | Bien logrado en db.js, services/, hooks/; parcial en enums |
| Change amplification | Controlada; el único vector residual es la sincronización manual de enums |
| Consistency | Fuerte — convenciones de naming, estructura de respuestas y manejo de errores son uniformes |
| Comments | El `CLAUDE.md` actúa como documentación de diseño de alto nivel; los módulos individuales tienen comentarios mínimos pero adecuados |

**Veredicto general:** El sistema resultante está en el cuadrante de "buena ingeniería" según los criterios de Ousterhout. No es perfecto — la sincronización manual de enums y la ausencia de tests de servicios directos en las fases tempranas son deudas técnicas reconocidas. Pero la arquitectura es elástica: los cambios más probables (nuevos tipos de tarea, nuevas categorías, nuevas pages en el frontend) tienen caminos de bajo costo gracias a las decisiones tomadas en el Punto de Control.

---

[← Anatomía de la Complejidad](./02-anatomia-complejidad.md) | [↑ Índice](./README.md)
