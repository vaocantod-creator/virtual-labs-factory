# Investigacion de Mercado y Tendencias

Fecha de investigacion: 2026-10-21. Fuentes: busquedas web (mercado EdTech, papers academicos recientes,
proyectos open-source de orquestacion de agentes).

## 1. Mercado de laboratorios virtuales educativos (estado actual)

### Tamano y crecimiento

- Mercado global de "Virtual Science Laboratory Higher Education Platforms": ~USD 1.4B en 2025,
  proyectado a USD 3.6B en 2032 (CAGR ~14.5%). Crecimiento sostenido, no una moda pasajera.
- Impulsores principales identificados en la industria:
  1. Subinversion cronica en infraestructura fisica de laboratorio en universidades publicas.
  2. Crecimiento de programas hibridos/online (+30% de la matricula en EEUU), que exige labs
     asincronos accesibles fuera de horario de clase.
  3. Mejoras en motores de simulacion y evaluacion adaptativa por IA, que reducen el escepticismo
     historico de los docentes sobre la equivalencia con el laboratorio fisico.
- Freno estructural: en disciplinas clinicas y de ingenieria quimica, los organismos de acreditacion
  siguen exigiendo horas minimas de laboratorio FISICO, lo que limita cuanto puede sustituirse (no
  cuanto puede complementarse).

### Jugadores establecidos

| Producto | Enfoque | Modelo | Fortaleza | Debilidad relevante para nosotros |
|---|---|---|---|---|
| **Labster** | 300+ simulaciones 3D (biologia, quimica, fisica, salud) | Pago por institucion/estudiante (~USD 49/estudiante por 8 sims) | Libreria grande, integra con LMS (Canvas, Moodle, Blackboard) | Generico — no cubre ingenieria de telecomunicaciones, robotica de control, ni mecanica orbital; contenido fijo, no personalizable al plan de un profesor especifico |
| **LabXchange** (Harvard) | Simulaciones + videos + rutas de aprendizaje | Gratuito | Excelente para ciencias basicas, curado por Harvard/OpenStax/Khan | No cubre ingenierias especializadas; no es un "lab a medida" |
| **PhET** (U. Colorado Boulder) | Simulaciones interactivas abiertas | Gratuito | Enorme alcance en fisica/quimica basica | Exploracion libre, no estructurada como practica de ingenieria con instrumento real |
| **LabsLand / Redes tipo R-Lab (LATAM)** | Laboratorios REMOTOS (hardware real controlado a distancia) | Institucional | Mide con instrumento fisico real, no simulado | Requiere comprar y mantener el equipo fisico igual; no resuelve el problema de costo de origen |

**Conclusion clave:** ninguno de los jugadores grandes cubre bien los dominios de ingenieria
especializada que maneja Victor (control/robotica 3D, patrones de radiacion de antenas, mecanica
orbital de satelites). El mercado esta dominado por ciencias basicas (biologia/quimica/fisica
introductoria). **Ese es exactamente el hueco donde Rbot + radiacion + satelites pueden competir.**

## 2. Tendencias en agentes de IA aplicados a contenido educativo 3D

Papers y proyectos recientes (2025-2026) confirman que la industria academica ya esta explorando
exactamente la direccion de la fabrica, aunque de forma fragmentada:

- **Framework multi-agente para autoria de contenido XR en K-12** (arXiv 2604.04728): separa
  explicitamente un "Agente Pedagogico" (traduce intencion docente a especificacion), un "Agente de
  Ejecucion" (genera el asset 3D via API tipo Meshy), un "Agente de Seguridad" y un "Agente Tutor"
  (enriquece la escena con contenido instruccional). Es casi un espejo en miniatura de la red
  agentica que ya disenamos (Arquitecto Heuristico + Agente 3D + QA + Reportero), pero limitado a
  K-12 y a generacion de un solo asset, no a laboratorios completos con logica de simulacion.
- **SENEM-AI** y **CLiVR**: usan LLMs para generar "companeros" o "pacientes" virtuales dentro de
  entornos 3D inmersivos — confirma la tendencia de meter agentes DENTRO del laboratorio (capa de
  operacion), no solo para construirlo. Esto valida el punto que dejamos abierto en `HEURISTICA.md`
  sobre distinguir agentes-que-construyen vs. agentes-que-operan-el-lab.
- **Robotica + Unity + ROS2 en universidades** (Lecon et al. 2025): confirma que ensenar
  programacion de robots en un entorno 3D simulado sigue siendo un caso de uso academico activo y
  publicado — directamente relevante para el caso Rbot.
- **Tendencia general de la industria (reporte Anthropic 2026 Agentic Coding Trends):** los sistemas
  multi-agente estan reemplazando los flujos de un solo agente; los agentes de larga duracion ya
  construyen sistemas completos a lo largo de dias, no solo tareas puntuales de minutos. Esto
  respalda directamente la viabilidad tecnica de operar la fabrica como la planteamos (ciclos
  semanales, no "una sesion de chat").

## 3. "Fabricas de software" agenticas (referencia directa para nuestra arquitectura)

Ya existen productos comerciales con el mismo concepto de "fabrica" que propusimos, aplicados a
software generico (no educativo):

- **Factory.ai**: ya usa literalmente el termino "software factory" — agentes ("Droids") que
  planifican, construyen, revisan y despliegan, con un panel llamado "Mission Control" para
  monitorear misiones activas en tiempo real. Confirma que el modelo mental CEO-revisa-dashboard es
  un patron de industria emergente, no una idea aislada nuestra.
- **ALMAS** (paper arXiv 2510.03463): framework de agentes alineados a roles agiles (SDLC completo),
  misma logica de "roles" que usamos (Arquitecto, Ingeniero, QA, etc.).
- **Marcus/Posidonius/Cato**: conjunto de herramientas open-source que separan coordinacion
  (Marcus), experimentacion/metricas (Posidonius) y observabilidad en tiempo real con "audit trails
  jugables" (Cato) — un patron de separacion de responsabilidades que podemos adoptar: nuestro
  Agente Director + futuro modulo de metricas + el dashboard pixel-art son analogos a esos tres.

## 4. Dashboards pixel-art para visualizar agentes (hallazgo mas directo y accionable)

Esto es lo mas relevante encontrado para la Fase 0-1 del roadmap: **ya existen herramientas
open-source que hacen exactamente lo que pediste**, ahorrando meses de desarrollo si se adaptan en
vez de construir desde cero:

- **pixel-agents-hq/pixel-agents** ("Pixel office"): convierte agentes de Claude Code (vistos desde
  terminal) en personajes pixel-art animados en una oficina 2D. Caminan a sus escritorios, se
  sientan, "escriben" cuando editan archivos, "leen" cuando buscan, y muestran una senal visual
  cuando estan esperando input. Arquitectura ya es agnostica de editor/agente (interfaz tipada
  `HookProvider`), soporta Claude Code hoy, con Codex/Gemini/Cursor en roadmap — **coincide
  exactamente con que Victor quiere usar Claude Code y Codex CLI**. Tiene editor de layout de
  oficina, burbujas de dialogo, sonidos, y soporta sub-agentes/equipos como personajes separados.
  Visión publicada por sus autores: "play a game, build a product" — con barras de salud para
  rate-limits/tokens y "muebles que hacen cosas", exactamente la direccion que imaginamos para nuestras
  fases V1-V3.
- **samwang0723/agent-office**: UI pixel-art equivalente mas simple, conectada por WebSocket,
  enfocada en equipos de Claude Code sobre tmux.
- **robsannaa/mission-control**: panel de control (no pixel-art) para monitorear flotas de agentes,
  con tablero tipo kanban (Backlog/In Progress/Review/Done) y cron jobs programados — util como
  referencia para la vista "administrativa" del CEO, complementaria al pixel-art.

**Implicacion directa para `docs/02-dashboard-pixel-art.md`:** en vez de construir el motor Phaser
desde cero (Fases V0-V3 que propusimos), la primera decision tecnica real debe ser evaluar
**forkear/adaptar `pixel-agents-hq/pixel-agents`** como base, extendiendolo para:
1. Soportar Codex CLI (ya esta en su roadmap, podriamos contribuir esa pieza).
2. Mapear sus "personajes" a nuestros roles especificos (Director, Arquitecto Heuristico, Agente 3D,
   Ingeniero, QA Pedagogico, Reportero) en vez de genericos.
3. Anadir una vista especifica por laboratorio (Rbot, radiacion, satelites) en vez de solo por
   editor/proyecto generico.

Esto puede ahorrar semanas enteras de la Fase 0 original.

## 5. Que nos esta faltando (gap analysis)

Comparando el mercado + la investigacion contra nuestra propuesta actual (`docs/01-05` del repo):

1. **No tenemos aun una decision de motor de simulacion por dominio.** El dashboard de agentes
   (pixel-art) es un problema ya resuelto por terceros; el verdadero riesgo tecnico sigue siendo
   el motor 3D/fisico de CADA laboratorio (Java3D legado para Rbot, motor de campo electromagnetico
   para radiacion, motor orbital para satelites) — eso no tiene equivalente open-source directo que
   podamos adaptar, hay que decidirlo caso por caso en `docs/05-casos-de-prueba.md`.
2. **Nos falta una capa de "agentes dentro del laboratorio" (tutor/asistente IA para el estudiante
   final), no solo agentes que construyen el laboratorio.** La investigacion (SENEM-AI, CLiVR, el
   framework K-12) muestra que esa es la frontera actual de la industria academica. Deberiamos
   anadir esto explicitamente como un eje futuro en `HEURISTICA.md` (ya quedo anotado como pregunta
   abierta, pero ahora tenemos evidencia de que es una tendencia real, no un lujo).
3. **No tenemos aun una metrica de "autonomia lograda"** (cuanto trabajo hacen los agentes sin
   intervencion humana) — Factory.ai y Posidonius SI miden esto explicitamente ("Agent Readiness
   score", comparacion de tiempos con distinto numero de agentes). Deberiamos anadir algo analogo
   al Agente Reportero: cuanto de la semana fue autonomo vs. cuanto requirio decision del CEO.
4. **No hemos definido aun el modelo de negocio/costo** mas alla de la mencion en
   `04-impacto-educativo.md`. El dato de mercado (USD 49/estudiante en Labster por 8 simulaciones)
   nos da una referencia de precio real para cuando se evalue el Nivel 3 (SaaS educativo) del
   documento de impacto.
5. **Validacion con acreditacion:** el freno que tienen Labster/LabXchange (organismos de
   acreditacion exigen horas de lab fisico en ciertas disciplinas) tambien aplicaria a cualquier
   laboratorio de la fabrica si se usa para reemplazar (no solo complementar) practica obligatoria.
   Esto debe quedar explicito como limite realista en `04-impacto-educativo.md`.

## 6. Recomendaciones concretas antes de iniciar Fase 1

1. ~~Evaluar forkear `pixel-agents-hq/pixel-agents` en vez de construir el dashboard desde cero con
   Phaser~~ — **resuelto**: adoptado en `docs/02-dashboard-pixel-art.md` (Phaser queda como plan B).
2. Anadir a `HEURISTICA.md` la distincion explicita entre agentes-constructores y
   agentes-operadores-del-lab, con referencia a la evidencia de esta investigacion.
3. Anadir una metrica de autonomia al Agente Reportero (actualiza `docs/01-red-agentica.md`).
4. Mantener el foco competitivo en los dominios de ingenieria especializada (control/robotica,
   telecomunicaciones, mecanica orbital) donde Labster/LabXchange/PhET NO compiten hoy — esa es la
   ventana de oportunidad real, no competir de frente en biologia/quimica basica.
