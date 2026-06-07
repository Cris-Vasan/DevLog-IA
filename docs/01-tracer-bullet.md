# 🎯 Sección 1: La Bala Trazadora y el Enrutamiento de las Skills

> *"Build one thin slice end-to-end first, so you know the architecture will actually work before committing to it."*
> — analogía de la Bala Trazadora, *The Pragmatic Programmer*

---

## 1.1 El punto de partida: el árbol de diseño y las asunciones iniciales

Antes de que Ralph escribiera una sola línea de código, el equipo ejecutó la skill **`grill-me`** sobre el brief del cliente (`client-brief.md`). Esta interrogación sistemática al PRD no era un paso ceremonial: era el mecanismo para **mapear el territorio de incertidumbre** antes de comprometer una arquitectura.

### Asunciones originales (pre-`grill-me`)

Las asunciones iniciales del equipo apuntaban a un sistema relativamente plano:

- Una sola entidad principal: *proyectos con tareas*.
- La conversión de notas via IA sería un módulo secundario, casi cosmético.
- SQLite sería suficiente sin abstracción adicional.
- El cliente HTTP del frontend sería trivial.

### Lo que cambió después del árbol de diseño

La sesión de `grill-me` reveló tres complejidades no triviales que alteraron el diseño:

1. **La jerarquía de datos es más profunda de lo esperado.** El sistema no era `Proyectos → Tareas` sino `Proyectos → (Tareas + Sesiones)` con una tabla de unión `session_tasks`. Esto implicaba que la capa de servicios necesitaba ser diseñada desde el principio para manejar relaciones, no solo CRUDs planos.

2. **Los valores de dominio (enums) son un contrato implícito de tres capas.** `priority`, `category` y `status` necesitaban coherencia entre el esquema SQL (`CHECK` constraints), la validación del servidor y los componentes de UI. La asunción inicial de "lo manejamos en el frontend" resultó ingenua.

3. **El módulo de IA tiene un punto de falla único: la API key.** La skill forzó a anticipar el comportamiento del sistema cuando `ANTHROPIC_API_KEY` no está configurada — resultando en el diseño explícito del retorno `503` y el estado deshabilitado en la UI del Note Converter.

---

## 1.2 Aplicación de la Bala Trazadora

La analogía de la **Bala Trazadora** sostiene que, ante un sistema con múltiples capas de incertidumbre, la primera inversión debe ser un camino delgado de extremo a extremo a través del componente *más incierto*. No el más fácil, sino el que más riesgo arquitectónico concentra.

### ¿Cuál era el issue más incierto?

En este sistema, el punto de mayor riesgo de integración no era el CRUD de proyectos (predecible) ni el esquema de base de datos (estándar). Era la **cadena completa de conversión de notas con IA**:

```
[UI: textarea] → POST /api/ai/convert → [Express route] 
    → [AI service] → [Anthropic API] → [JSON response]
    → [React Query hook] → [task card rendered in UI]
```

Este flujo cruzaba todas las capas del sistema, dependía de un servicio externo con facturación real, y su diseño condicionaba la forma del API client del frontend, la estructura del AI service y el contrato de respuesta.

### La decisión: atacar el issue 008 primero (en espíritu)

Aunque el orden formal de los issues comenzaba con el scaffold (001), la instrucción humana al agente fue construir el sistema de forma que **el AI service (`src/services/ai.js`) estuviera diseñado e inyectado desde el issue 001**. Esto se evidencia en `CLAUDE.md`:

```
# server/src/index.js
# inicializa el DB connection, crea el Anthropic client si ANTHROPIC_API_KEY 
# está seteada, registra Express routes, y arranca el servidor.
```

El cliente Anthropic no se importa directamente en el servicio: **se inyecta en startup**. Esta decisión, tomada antes de escribir el issue 008, fue el resultado directo de identificar la inyección de dependencia del cliente de IA como el riesgo de integración más alto del sistema.

### Feedback temprano obtenido

La bala trazadora dio al equipo tres confirmaciones arquitectónicas concretas antes de que se completara la mitad del sprint:

| Confirmación | Implicación |
|---|---|
| La respuesta de Anthropic es `{ title, description, priority, category }` — compatible con el schema de tasks | No fue necesario una capa de transformación adicional |
| El 503 cuando no hay API key es manejable desde el frontend con un estado de error normal | La UI del Note Converter no necesitó lógica especial de "modo degradado" |
| El Vite proxy reenvía `/api` correctamente en desarrollo | No fue necesario configurar CORS complejo para el E2E |

---

## 1.3 El rol de las skills en el enrutamiento

Las skills del agente (`/.agents/skills/`, `/.claude/skills/`) actuaron como **filtros de contexto** que determinaban qué tipo de razonamiento aplicaba Ralph a cada issue. No eran solo instrucciones: eran modos de operación.

La distinción clave fue entre skills de *exploración* (como `grill-me`, usada antes del código) y skills de *ejecución* (usadas durante la implementación). El enrutamiento correcto — usar `grill-me` antes de commitear una sola línea — fue lo que convirtió la incertidumbre inicial en decisiones de diseño concretas antes de que el costo de cambiarlas fuera alto.

---

[← Índice](./README.md) | [Siguiente: Anatomía de la Complejidad →](./02-anatomia-complejidad.md)
