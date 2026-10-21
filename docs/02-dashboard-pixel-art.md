# Dashboard Pixel-Art del CEO

## Objetivo

Darle a Victor (CEO) una vista inmediata y agradable del estado de la fabrica: que agente esta
activo, en que laboratorio, hace cuanto, y que acaba de entregar. Estilo visual: pixel-art tipo
juego de gestion, una oficina 2D donde cada agente es un personaje con animacion simple.

## Decision tecnica actualizada (tras investigacion de mercado)

> Ver `docs/06-investigacion-mercado.md`, seccion 4. Ya existen herramientas open-source que
> resuelven gran parte de este problema. Construir desde cero duplicaria esfuerzo innecesariamente.

### Recomendacion: adaptar `pixel-agents-hq/pixel-agents` en vez de construir desde cero

`pixel-agents-hq/pixel-agents` ("Pixel office") ya convierte agentes de Claude Code en personajes
pixel-art animados en una oficina 2D: caminan a su escritorio, se sientan, "escriben" cuando editan
archivos, "leen" cuando buscan, y muestran una senal visual cuando esperan input. Caracteristicas
relevantes directamente para nosotros:

- Arquitectura agnostica de editor/agente mediante una interfaz `HookProvider` tipada — Claude Code
  es la implementacion de referencia hoy, con **Codex en su propio roadmap** (coincide exactamente
  con el stack que Victor quiere usar: Claude Code + Codex CLI orquestados por Hermes).
- Dos formas de uso: extension de VS Code, o **CLI standalone** (`npx pixel-agents`) que sirve la
  misma oficina como app de navegador — util para correr fuera de un IDE, en el servidor donde vive
  la fabrica.
- Editor de layout de oficina integrado (pisos, paredes, muebles).
- Burbujas de dialogo cuando un agente espera input o permiso.
- Soporte de sub-agentes y equipos como personajes separados — encaja con nuestra jerarquia
  Director -> Arquitecto/3D/Ingenieria/QA/Reportero.
- Deteccion de actividad via hooks de Claude Code (`SessionStart`, `PreToolUse`,
  `PermissionRequest`, `Stop`) con un modo heuristico de respaldo leyendo transcripciones JSONL si
  los hooks no estan disponibles.
- Vision publicada por sus propios autores: "play a game, build a product" — con barras de salud
  para rate-limits/tokens y "muebles que hacen cosas", que es casi exactamente la progresion V1-V3
  que ya habiamos imaginado para este documento.

### Alternativas descartadas (quedan documentadas para referencia)

- **samwang0723/agent-office**: equivalente mas simple (WebSocket, enfocado en tmux). Util como
  referencia de implementacion mas liviana si `pixel-agents` resulta sobredimensionado.
- **robsannaa/mission-control**: no es pixel-art, es un panel de control tipo kanban
  (Backlog/In Progress/Review/Done) con cron jobs. No reemplaza al dashboard visual, pero es una
  buena referencia para una vista "administrativa" complementaria que el CEO pueda usar para
  aprobar/rechazar decisiones sin entrar al pixel-art.
- **Construir desde cero con Phaser 3** (decision original de este documento): se descarta como
  primera opcion. Queda como plan B si `pixel-agents` no logra adaptarse al caso de multiples
  laboratorios + roles especificos de la fabrica (ver siguiente seccion).

## Trabajo de adaptacion requerido

`pixel-agents` fue disenado para visualizar sesiones de Claude Code genericas, no una fabrica con
multiples laboratorios y roles fijos. El trabajo de adaptacion (a cargo del Ingeniero de Laboratorio
en una tarea temprana de Fase 0) consiste en:

1. **Mapear personajes a roles de la fabrica**, no a sesiones genericas: Director, Arquitecto
   Heuristico, Agente de Contenido 3D, Ingeniero de Laboratorio, QA Pedagogico, Reportero — en vez
   de un personaje por sesion de terminal sin nombre.
2. **Anadir una vista por laboratorio**: el estado debe distinguir en que laboratorio (Rbot,
   radiacion, satelites) esta trabajando cada agente, no solo que agente esta activo.
3. **Conectar la fuente de datos a `factory-state.json`** (ya definido en
   `docs/01-red-agentica.md`) ademas de — o en reemplazo de — los hooks nativos de Claude Code, para
   que el estado mostrado sea el que el Agente Director consolida, no solo actividad cruda de
   terminal.
4. **Contribuir soporte de Codex CLI** si para cuando lo necesitemos el proyecto original aun no lo
   ha implementado — esto ademas devuelve valor al proyecto open-source original.
5. **Anadir la metrica de autonomia** (ver `docs/06-investigacion-mercado.md`, seccion 5, punto 3)
   como un indicador visible en el dashboard: cuanto del ciclo semanal corrio sin intervencion del
   CEO.

## Diseno de la escena (vigente, ahora sobre la base de pixel-agents)

```
┌──────────────────────────────────────────────────────────┐
│  OFICINA DE LA FABRICA  (pixel-art, vista top-down)        │
│                                                              │
│  [Mesa Arquitecto]   [Mesa 3D]   [Mesa Ingenieria]          │
│       🧑‍💻                🎨            🧑‍🔧                   │
│                                                              │
│  [Pizarra Director]              [Mesa QA]   [Mesa Reporte] │
│         🧑‍💼                          🧪           📣          │
│                                                              │
│  Barra lateral: lista de laboratorios activos + fase        │
│  Panel inferior: ultimo log/evento por agente                │
│  Indicador superior: % de autonomia del ciclo (sin CEO)      │
└──────────────────────────────────────────────────────────┘
```

## Fases de construccion del dashboard (actualizadas)

1. **V0 — Despliegue base de `pixel-agents`:** instalar y correr la herramienta tal cual sobre una
   sesion real de Claude Code trabajando en Rbot, para validar que la deteccion de actividad
   funciona en nuestro entorno antes de invertir en adaptarla.
2. **V1 — Mapeo de roles y laboratorios:** aplicar los 4 puntos de adaptacion listados arriba.
3. **V2 — Movimiento e interaccion entre agentes:** agentes caminan entre estaciones segun a quien
   le entregan trabajo (ej. Ingenieria entrega a QA), usando el layout editor nativo de la
   herramienta.
4. **V3 — Historial navegable + metrica de autonomia:** linea de tiempo semanal y el indicador de
   autonomia mencionado arriba, construidos sobre la base ya adaptada.

## Por que esto importa para la heuristica

Un lab virtual fiel a un instrumento real necesita, segun la heuristica, representacion **sistemica**
y **3D** del fenomeno. El propio dashboard es un micro-caso de ese principio aplicado a la gestion:
convierte un proceso invisible (agentes de IA trabajando) en un sistema visual comprensible — el
mismo principio que luego se aplica a, por ejemplo, convertir un patron de radiacion invisible en una
escena 3D entendible por un estudiante. Adaptar una herramienta ya validada por la comunidad en vez
de reinventarla tambien es, en si mismo, un ejemplo del principio de "rescatar experiencia y
productos ya logrados" que el profesor menciono explicitamente.
