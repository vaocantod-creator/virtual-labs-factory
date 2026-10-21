# Capa de Auditoria y Monitoreo (Sensores) para Aprendizaje Automatico

Define que se mide, donde se guarda, y como se consume esa data en la fabrica. Esta capa alimenta
tres cosas ya comprometidas en documentos previos: la metrica de autonomia (`HEURISTICA.md`), el
loop de EDD sobre los propios agentes (`docs/07-ai-native-stack.md` seccion 10), y la nueva Fase 6
de mantenimiento identificada en `docs/08-validacion-curso-claude.md`.

## Principio de diseno

Un sensor es un punto de instrumentacion que registra un evento **de forma estructurada y
versionada**, nunca solo como texto libre en un log. Cada sensor escribe a un `sensors.jsonl`
(append-only) por repo de laboratorio, mas un agregado central en `virtual-labs-factory/metrics/`.
Esto es deliberadamente simple (JSONL, no una base de datos) en la Fase 0-1, para no añadir
infraestructura antes de tener datos reales que justifiquen algo mas complejo.

## Catalogo de sensores (por capa)

### Capa 1 — Sensores de AGENTE (alimentan EDD, seccion 10 del stack AI-Native)

| Sensor | Que registra | Cuando dispara | Consumidor |
|---|---|---|---|
| `agent.task.duration` | Tiempo entre inicio y fin de una tarea delegada a un rol | Al completar cualquier tarea de `delegate_task` | Director (priorizacion), Reportero (informe semanal) |
| `agent.task.retry_count` | Cuantas veces una tarea tuvo que reintentarse o corregirse | Cada vez que un agente re-ejecuta tras fallo o rechazo de QA | Director (deteccion de skills que necesitan ajuste via EDD) |
| `agent.eval.score` | Resultado de un eval tecnico corrido contra un skill/prompt | Cada vez que se ajusta un skill y se corre su eval (ver EDD) | Director (decide si el cambio de skill se acepta) |
| `agent.autonomy.escalation` | Si una tarea requirio intervencion del CEO para resolverse | Cuando el Director no puede resolver y escala | Reportero (metrica de % de autonomia, `HEURISTICA.md`) |
| `agent.merge.outcome` | Resultado de cada intento de merge (aceptado/rechazado/conflicto) | Cada merge gestionado por el Director (rol integrador, seccion 7) | Director (deteccion de cuellos de botella tipo "Gas Town") |

### Capa 2 — Sensores de LABORATORIO (alimentan PDD y la nueva Fase 6 de mantenimiento)

| Sensor | Que registra | Cuando dispara | Consumidor |
|---|---|---|---|
| `lab.pdd.rubric_score` | Resultado de la rubrica pedagogica ejecutable, por criterio | Cada vez que QA Pedagogico valida un milestone | QA Pedagogico, Arquitecto Heuristico (retroalimentacion a la spec) |
| `lab.adr.count` | Cuantos ADRs se generaron en un periodo, por laboratorio | Cada vez que se crea un ADR | Reportero (senal de cuanta decision arquitectonica hubo esta semana) |
| `lab.devcontainer.build_status` | Si el devcontainer.json builda limpio | En cada verificacion del Ingeniero antes de reportar "listo" | Reportero (gate de publicacion) |
| `lab.student_interaction.error_rate` | **(Fase 6, post-publicacion)** tasa de acciones fallidas/confusas del estudiante real usando el laboratorio ya publicado | En produccion, cuando el laboratorio tiene usuarios reales | QA Pedagogico (dispara nueva iteracion de spec si sale de rango, cerrando el Loop Engineering de mantenimiento) |
| `lab.student_interaction.completion_rate` | **(Fase 6)** porcentaje de estudiantes que completan el laboratorio sin abandonar | En produccion | Arquitecto Heuristico (evidencia empirica para refinar la heuristica del profesor) |

### Capa 3 — Sensores de FABRICA (vista agregada para el CEO)

| Sensor | Que registra | Cuando dispara | Consumidor |
|---|---|---|---|
| `factory.cycle.autonomy_pct` | % de tareas del ciclo semanal resueltas sin intervencion del CEO | Al cierre de cada ciclo semanal (viernes, ver roadmap) | CEO (via Reportero) |
| `factory.harness.drift_detected` | Inconsistencias encontradas en el "garbage collection" periodico (seccion 5) | Cada corrida del paso de garbage collection | Director, Reportero |
| `factory.lab.throughput` | Cuantos laboratorios/milestones se completaron en el periodo | Al cierre de cada ciclo semanal | CEO (vista de velocidad de la fabrica) |

## Formato de registro (ejemplo)

```json
// sensors.jsonl — una linea por evento, append-only
{"ts": "2026-10-28T14:32:00Z", "sensor": "agent.task.duration", "rol": "Ingeniero de Laboratorio", "lab": "rbot", "tarea_id": "BACKLOG-014", "valor_segundos": 1840}
{"ts": "2026-10-28T15:10:00Z", "sensor": "agent.eval.score", "rol": "Ingeniero de Laboratorio", "skill": "modernizar-java3d-legacy", "score": 0.82, "baseline_previo": 0.71}
{"ts": "2026-10-28T16:00:00Z", "sensor": "lab.pdd.rubric_score", "lab": "rbot", "criterio": "feedback_correctivo_visible", "resultado": "pass"}
```

## De sensores a aprendizaje automatico (uso futuro, no Fase 0-1)

Los datos de `sensors.jsonl` acumulados a lo largo de varios ciclos semanales y varios laboratorios
son el dataset base para dos usos futuros, explicitamente diferidos hasta tener suficiente volumen
(estimado: despues de completar Rbot + al menos 1 laboratorio nuevo, Fase 3 del roadmap):

1. **Ajuste automatico de priorizacion del Director**: en vez de que el Director priorice tareas por
   intuicion, puede correlacionar `agent.task.retry_count` alto en cierto tipo de tarea con el skill
   usado, y sugerir (no decidir solo) que ese skill necesita revision via EDD antes de asignarse de
   nuevo.
2. **Deteccion temprana de laboratorios en riesgo**: si `lab.student_interaction.error_rate` de un
   laboratorio en produccion empieza a desviarse de su historico, eso dispara automaticamente una
   tarea para el QA Pedagogico (cerrando el Loop Engineering de mantenimiento, Fase 6) antes de que
   el CEO tenga que notarlo manualmente en el reporte semanal.

**No se implementa un modelo de ML en Fase 0-1.** La capa de sensores se construye primero como
registro estructurado simple; el aprendizaje automatico sobre esos datos es una decision de Fase 5
(plataforma educativa) cuando haya volumen suficiente de ciclos y laboratorios para que un modelo
tenga señal real, evitando sobre-ingenieria prematura (mismo principio aplicado en toda la
investigacion previa: no construir infraestructura compleja antes de que los datos la justifiquen).

## Responsable de cada capa

| Capa | Quien instrumenta | Quien consume primero |
|---|---|---|
| Agente | Director (en cada `delegate_task` que lanza) | Director mismo (EDD) |
| Laboratorio | Ingeniero/QA Pedagogico (en su flujo normal de trabajo) | QA Pedagogico, Arquitecto Heuristico |
| Fabrica | Reportero (agrega de las dos capas anteriores) | CEO |
