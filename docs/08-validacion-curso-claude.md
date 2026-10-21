# Validacion contra el estandar de Claude Academy (AI-Native SDLC Playbook)

Fuente: https://academy.claude.com/courses/ai-native-sdlc-playbook (curso oficial de Anthropic,
"para engineering/platform/security leads cuya organizacion ya usa Claude Code"; 14 lecciones, ~1h,
organizado en 6 etapas del SDLC). Tambien existe como articulo unico en el blog de Claude.

Este documento compara nuestro stack AI-Native (`docs/07-ai-native-stack.md`) contra las 12 "jugadas"
(plays) oficiales de Anthropic, etapa por etapa, para detectar que ya cubrimos, que nos falta, y que
no aplica a nuestro caso (fabrica de laboratorios educativos, no una organizacion de ingenieria
tradicional).

## Estructura del curso (6 etapas)

1. **Plan** — capturar intencion como `intent.md`.
2. **Design** — requisitos y diseno derivados de esa intencion.
3. **Build** — plan mode de Claude Code, `CLAUDE.md`, skills como conocimiento institucional,
   sesiones paralelas y subagentes.
4. **Test** — dar a Claude un loop de feedback, evals continuos en CI.
5. **Deploy** — IA en el loop de revision de PRs, hooks como gates de aprobacion, integracion
   CI/CD.
6. **Maintain** — cerrar el loop sobre metricas de produccion.

## Mapeo etapa por etapa contra lo ya decidido en la fabrica

### Etapa 1-2: Plan + Design -> `intent.md` vs. nuestro `spec.md` + `constitution.md`

El curso propone `intent.md`: un archivo corto versionado que dice que se quiere, por que, y bajo
que restricciones — que luego se convierte en requisitos y diseno en una sola sesion con Claude.

**Comparacion:** nuestro flujo (`docs/07-ai-native-stack.md`, seccion 1) ya cubre esto, pero
dividido en dos artefactos en vez de uno: `constitution.md` (restricciones inmutables, estables en
el tiempo) + `spec.md` (que/por que de un laboratorio concreto, generado por el Arquitecto
Heuristico). Esto es MAS granular que el `intent.md` generico del curso, lo cual es apropiado para
nuestro caso: un `intent.md` unico no distinguiria entre "reglas que nunca cambian para este
laboratorio" (constitution) y "lo que queremos lograr esta iteracion" (spec/intent). **Decision: no
hace falta adoptar `intent.md` literal, nuestro desglose es mas preciso para el dominio.**

Brecha real detectada: el curso enfatiza que esto ocurre **"en una sola sesion de trabajo con
Claude"** — una conversacion fluida intent -> requisitos -> diseno. Nuestro diseno actual no
especifica si el Arquitecto Heuristico genera `spec.md` en una sola sesion o en pasos separados.
**Accion:** anadir a la skill `escribir-spec-heuristica-didactico-sistemica-3d` (ya propuesta en
seccion 3) la instruccion explicita de producir intent->spec->plan en una sola sesion continua
cuando sea posible, en vez de fragmentarlo en tareas separadas sin necesidad.

### Etapa 3: Build -> CLAUDE.md, skills, plan mode, sesiones paralelas

El curso distingue 3 lugares donde vive el conocimiento institucional: `CLAUDE.md` (contexto de
proyecto), **skills** (procedimiento reutilizable), **hooks** (regla mecanica). Tambien recomienda
plan mode de Claude Code como punto de partida por defecto, y sesiones paralelas/subagentes para
trabajo independiente.

**Comparacion:** coincide exactamente con lo que ya definimos:
- `CLAUDE.md` por laboratorio = equivalente a nuestro par `constitution.md` + spec/plan (el repo
  Rbot YA tiene un `CLAUDE.md` real, confirmando que este patron ya esta en uso).
- Skills = seccion 3 de nuestro documento (`modernizar-java3d-legacy`, etc.), con el mismo criterio
  del curso de "donde vive el conocimiento institucional repetible".
- Hooks = seccion 8/13 (settings hooks para gates mecanicos).
- Sesiones paralelas/subagentes = ya es como opera Hermes (`delegate_task`), nuestro orquestador.

**Sin brechas aqui — ya estamos alineados con el estandar.** Unico matiz: el curso recomienda
"Claude Code plan mode como punto de partida por defecto" — **accion:** anadir esto como practica
explicita para el Ingeniero y Agente 3D en la skill `modernizar-java3d-legacy`: iniciar siempre en
plan mode antes de tocar codigo en rutas criticas del simulador legado (coherente con la matriz de
riesgo de la seccion 6, donde ese caso exige spec formal antes de codigo).

### Etapa 4: Test -> feedback loop + evals continuos en CI

El curso propone que Claude reciba un loop de feedback explicito, y que los **evals corran en CI
cada vez que cambia la configuracion del agente** (prompt, modelo, skill).

**Comparacion:** esto es exactamente nuestra seccion 10 (EDD — Evaluation-Driven Development), ya
adoptada con el mismo principio: el eval se escribe antes del cambio, corre en CI de forma continua
contra cada ajuste de skill/prompt. **Coincidencia directa, sin brecha.**

Brecha real: el curso especifica "evals rerun **whenever the agent's setup changes**" — es decir,
automatizado como parte del pipeline CI, no como un paso manual que alguien recuerda ejecutar.
**Accion:** anadir a la seccion de EDD que los evals de cada skill deben vivir en un pipeline CI del
propio repo `virtual-labs-factory` (ej. GitHub Actions) que se dispare automaticamente al modificar
cualquier `SKILL.md`, no solo ejecutarse manualmente cuando el Director lo recuerde.

### Etapa 5: Deploy -> IA en el loop de revision de PRs + hooks como gates de aprobacion

El curso propone que Claude revise cada PR automaticamente, mientras ciertas acciones (como un
release) quedan retenidas por un hook hasta que una persona las apruebe.

**Comparacion:** coincide con nuestra mitigacion del riesgo "Gas Town" (seccion 7): el Director
actua como integrador/serializador de merges. Pero el curso agrega un matiz que no teniamos
explicito: **"Claude revisa cada PR, las personas aun revisan a mano ciertas cosas"** — es decir, no
es "el Director aprueba todo" vs. "un humano aprueba todo", sino un **reparto explicito de que se
revisa por maquina y que por humano**.

**Brecha real detectada:** no tenemos definido ese reparto explicito. **Accion:** anadir una tabla
analoga a la matriz de riesgo (seccion 6) pero para el momento de merge/deploy: que tipo de cambios
el Director aprueba solo (ej. ajustes de contenido 3D no criticos, documentacion) vs. que tipo
requiere aprobacion explicita del CEO (ej. cambios a la `HEURISTICA.md` misma, publicacion de un
laboratorio como "completo" ante el profesor).

### Etapa 6: Maintain -> cerrar el loop sobre metricas de produccion

El curso describe que cuando una metrica de produccion sale de su rango normal, eso se convierte
automaticamente en un nuevo `intent.md` que reinicia la planificacion — cerrando el ciclo completo
plan->deploy->metrica->plan de nuevo.

**Comparacion:** esto es el patron de **Loop Engineering** que ya adoptamos (seccion 11), pero el
curso lo aplica especificamente al mantenimiento post-deploy, algo que nuestro roadmap actual
(Fases 0-5) no cubre explicitamente — nuestras fases terminan en "laboratorio construido/validado",
no en "laboratorio en produccion siendo monitoreado y retroalimentando nuevas specs".

**Brecha real, la mas significativa de esta validacion:** no tenemos un loop de mantenimiento
post-publicacion de un laboratorio. **Accion:** anadir una "Fase 6 — Operacion y mantenimiento" al
roadmap (`docs/03-roadmap.md`), donde un laboratorio ya publicado sigue siendo monitoreado (ver
seccion de sensores mas abajo), y una metrica fuera de rango (ej. tasa de error de estudiantes
sospechosamente alta, indicando un bug pedagogico) dispara automaticamente una nueva iteracion de
spec para el Arquitecto Heuristico — cerrando el loop completo, no dejando el laboratorio "terminado
y olvidado" tras la Fase 2/3/4.

## Resumen de brechas detectadas (acciones concretas a incorporar)

| # | Brecha vs. el curso oficial | Accion |
|---|---|---|
| 1 | Flujo intent->spec no explicitamente en una sola sesion | Anadir instruccion a la skill del Arquitecto Heuristico |
| 2 | Plan mode no mencionado como practica por defecto | Anadir a la skill del Ingeniero/Agente 3D |
| 3 | Evals no automatizados en pipeline CI, solo descritos conceptualmente | Anadir CI que dispare evals al modificar cualquier skill |
| 4 | Sin reparto explicito de que revisa el Director vs. que revisa el CEO en merge/deploy | Nueva tabla de gates de aprobacion |
| 5 | Sin loop de mantenimiento post-publicacion de un laboratorio | Nueva Fase 6 del roadmap + conexion con capa de sensores |

## Conclusion de la validacion

El stack AI-Native que ya disenamos (docs 01, 07) **cubre 4 de las 6 etapas del estandar oficial de
Anthropic casi punto por punto** (Plan/Design, Build, Test, parte de Deploy), lo cual confirma que
la investigacion de 24 recursos (sesion anterior) nos llevo a una arquitectura consistente con la
practica recomendada directamente por el creador de la herramienta que usamos. Las brechas reales
estan concentradas en el **cierre del ciclo completo** (gates de aprobacion explicitos + loop de
mantenimiento post-deploy), que se resuelven con los 5 ajustes listados arriba, no con un rediseno.
