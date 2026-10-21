# Roadmap de la Fabrica (por fases y ciclos semanales)

El CEO revisa avances **semanalmente**. Cada semana cierra con un reporte en `reports/semana-NN.md`
generado por el Agente Reportero.

## Fase 0 — Fundacion (semanas 1-2)

Objetivo: dejar la fabrica lista para operar, sin agentes autonomos todavia ejecutando trabajo real.

- [x] Crear repositorio `virtual-labs-factory`.
- [ ] Redactar `HEURISTICA.md` junto con el profesor Andres Castillo (mapeo formal de su documento
      a decisiones operativas de la fabrica).
- [ ] Definir el primer laboratorio piloto: **Rbot**, porque ya tiene codigo, historia y un plan de
      modernizacion iniciado (`PLAN_EJECUTIVO.md`, `BACKLOG_EJECUCION.md` ya existen en ese repo).
- [ ] Especificar `factory-state.json` (formato final) y donde vive (este repo o un endpoint).
- [ ] V0 del dashboard pixel-art (estatico, lee el JSON, sin movimiento).

## Fase 1 — Primer ciclo agentico real (semanas 3-5)

Objetivo: el Agente Director + Ingeniero de Laboratorio ejecutan trabajo real y autonomo sobre Rbot,
siguiendo el backlog ya existente en ese repo.

- [ ] Agente Director programado (cron semanal o diario) que revisa `BACKLOG_EJECUCION.md` de Rbot
      y decide la siguiente tarea.
- [ ] Ingeniero de Laboratorio ejecuta esa tarea via Claude Code/Codex CLI en modo no interactivo,
      siguiendo el Definition of Done ya definido en `CLAUDE.md` de Rbot (implementar -> validar ->
      `./gradlew check` -> commit -> push).
- [ ] Arquitecto Heuristico redacta la primera especificacion formal (`docs/lab-rbot/especificacion.md`)
      conectando las decisiones tecnicas del backlog con los 4 ejes de la heuristica.
- [ ] Reportero entrega el primer informe semanal real al CEO.

## Fase 2 — QA Pedagogico + Dashboard dinamico (semanas 6-8)

- [ ] QA Pedagogico evalua el estado de Rbot bajo criterio didactico (no solo tecnico).
- [ ] Dashboard pasa a V1/V2 (animaciones, movimiento entre estaciones).
- [ ] Primer ciclo de retroalimentacion hacia `HEURISTICA.md` con evidencia real de Rbot.

## Fase 3 — Segundo laboratorio (semanas 9-12)

- [ ] Victor comparte el repo de **patrones de radiacion** (telecomunicaciones).
- [ ] La fabrica repite el ciclo completo (Arquitecto -> 3D -> Ingenieria -> QA -> Reporte) sobre
      un dominio distinto, probando que la heuristica generaliza mas alla de Rbot.
- [ ] Comparacion documentada: que se reutilizo del proceso de Rbot vs. que tuvo que adaptarse.

## Fase 4 — Tercer laboratorio + consolidacion (semanas 13-16)

- [ ] Repo de **satelites** entra a la fabrica.
- [ ] Con 3 laboratorios distintos construidos/modernizados bajo el mismo proceso, se consolida
      evidencia suficiente para validar (o ajustar) la heuristica del profesor.
- [ ] Borrador de "version 1.0" de `HEURISTICA.md` como documento candidato a anexarse a la tesis
      doctoral.

## Fase 5 — Plataforma educativa (horizonte posterior)

- [ ] Evaluar empaquetar la fabrica + los laboratorios resultantes como oferta para otras
      universidades (ver `04-impacto-educativo.md`).

## Cadencia operativa semanal (desde Fase 1 en adelante)

```
Lunes      -> Agente Director revisa backlog y asigna tareas de la semana.
Martes-Jue -> Ingeniero/3D/QA ejecutan, agente Reportero registra avances diarios internos.
Viernes    -> Reportero consolida `reports/semana-NN.md` y lo entrega al CEO por Telegram.
Fin semana -> CEO revisa, responde con decisiones/ajustes -> entran al backlog del lunes siguiente.
```
