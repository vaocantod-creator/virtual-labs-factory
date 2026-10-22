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
      Semilla creada en la raiz del repo; falta definir esquema final y quien lo actualiza.
- [ ] V0 del dashboard pixel-art (estatico, lee el JSON, sin movimiento).

## Fase 1 — Primer ciclo agentico real (semanas 3-5)

Objetivo: el Agente Director + Ingeniero de Laboratorio ejecutan trabajo real y autonomo sobre Rbot,
siguiendo el backlog ya existente en ese repo.

- [ ] Agente Director programado (cron semanal o diario) que revisa `BACKLOG_EJECUCION.md` de Rbot
      y decide la siguiente tarea.
- [ ] Ingeniero de Laboratorio ejecuta esa tarea via Claude Code/Codex CLI en modo no interactivo,
      siguiendo el Definition of Done ya definido en `CLAUDE.md` de Rbot (implementar -> validar ->
      `./gradlew check` -> commit -> push).
- [~] Arquitecto Heuristico redacta la primera especificacion formal (`docs/lab-rbot/especificacion.md`)
      conectando las decisiones tecnicas del backlog con los 4 ejes de la heuristica.
      **Borrador listo** junto con `constitution.md` y `decisions/0001-seleccion-de-stack.md` (propuestas,
      pendientes de CEO; faltan respuestas de Victor sobre el objetivo pedagogico).
- [ ] Reportero entrega el primer informe semanal real al CEO.

## Transversal — Brechas pendientes de la validacion contra el curso de Claude Academy

> Origen: `docs/08-validacion-curso-claude.md`, resumen de brechas 1-3 (las 4 y 5 ya estan en la
> tabla de gates y la Fase 6).

- [ ] Flujo intent -> spec en una sola sesion: anadirlo a la skill del Arquitecto Heuristico.
- [ ] Plan mode como practica por defecto: anadirlo a la skill del Ingeniero y del Agente 3D.
- [ ] CI que dispare los evals (EDD) al modificar cualquier skill.

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

## Transversal — Metodo Castillo (insumo del articulo ICAETT 2022)

- [x] Analisis del articulo (`docs/10`) y skill `patrones-castillo-3d` v0.1.
- [x] Videos del lab de instrumentacion procesados (`docs/12`).
- [x] JARs del profesor inspeccionados sin ejecutar (`docs/13`): Graphic Element Handler confirmado en el codigo.
- [ ] Reunion con el profesor (`docs/11`): confirmar patrones, alcance y tolerancias (anadir preguntas de `docs/12` seccion 5).
- [ ] Aplicar el Metodo Castillo en la especificacion de Rbot (Fase 1) y registrar la Component Library.
- [ ] Medir `lab.component_reuse_pct` desde el segundo laboratorio (Fase 3).
- [ ] Decidir si el Laboratorio de Instrumentacion entra como 4º caso (**CEO explicito**).
- [ ] WebXR (peticion del profesor): prototipo inmersivo de Rbot **tras** la paridad con Java; ver ADR-0001. Horizonte Fase 5: metaverso.
- [x] Stack de Rbot aprobado por el CEO: Three.js + TypeScript (ADR-0001, 2026-10-22).
- [x] Prototipo de carga `.3ds` (`prototypes/rbot-web/`): 19/19 piezas cargan. Video de Rbot recibido (`docs/lab-rbot/evidencia-video-rbot.md`).
- [x] Robot ensamblado en Three.js y **paridad numerica con el codigo real de Rbot: 77 secuencias, 0 diferencias** (`docs/lab-rbot/ensamblado-y-paridad.md`).
- [x] Comportamiento de comandos mejorado (ADR-0002): relativos, reversibles, sin retraso; 103 propiedades, 0 fallos. Pendiente: decidir el alcance sobre el repo Java y la interoperabilidad con el Centro de Mando Java.
- [x] Puente UDP<->WebSocket + Centro de Mando web + Receptor con retransmision (ADR-0003): 30 pruebas del puente y 21 extremo a extremo, 0 fallos; cliente Java real verificado.
- [ ] Extender el oraculo a las 4 vistas; capturas de Rbot real con una secuencia conocida (iluminacion); probar contra las aplicaciones Swing completas en una maquina con pantalla.

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


## Fase 6 — Operacion y mantenimiento (post-publicacion, horizonte continuo)

> Agregada tras validar la fabrica contra el curso oficial "AI-Native SDLC Playbook" de Claude
> Academy (ver `docs/08-validacion-curso-claude.md`). Brecha detectada: las fases 0-5 terminaban en
> "laboratorio construido/validado" sin un loop de mantenimiento post-publicacion.

Objetivo: cuando un laboratorio ya esta publicado y en uso por estudiantes reales, la fabrica sigue
monitoreandolo (capa de sensores, `docs/09-sensores-auditoria.md`) y cierra el loop automaticamente
cuando algo se desvia.

- [ ] Instrumentar sensores de interaccion real del estudiante (`lab.student_interaction.*`,
      ver `docs/09-sensores-auditoria.md`) en el primer laboratorio publicado (Rbot modernizado).
- [ ] Definir el rango normal esperado para cada metrica de produccion (ej. tasa de error aceptable)
      junto con el QA Pedagogico, antes de considerar el sensor "activo".
- [ ] Cuando una metrica sale de rango, se genera automaticamente una nueva iteracion de spec para
      el Arquitecto Heuristico (cerrando el Loop Engineering de mantenimiento) en vez de esperar a
      que el CEO lo note en el reporte semanal.
- [ ] Reportero incluye en cada informe semanal el estado de produccion de los laboratorios ya
      publicados, no solo el avance de los que aun estan en construccion.

## Gates de aprobacion — que decide el Director solo vs. que requiere al CEO

> Agregado tras la misma validacion (seccion de brechas, punto 4). El curso oficial distingue
> explicitamente que revisa la IA/el orquestador y que revisa un humano en el momento de merge/
> deploy; no es "todo automatico" ni "todo manual".

| Tipo de cambio | Aprobador | Justificacion |
|---|---|---|
| Ajuste de contenido 3D no critico (textura, color, detalle visual menor) | Director (solo) | Bajo impacto, alta detectabilidad (matriz de riesgo, seccion 6 del stack AI-Native) |
| Documentacion, reportes | Director (solo) | Bajo riesgo |
| Cambio a logica core del simulador legado (fisica, protocolo) | Director + merge solo tras ADR aprobado | Alto impacto, baja detectabilidad |
| Publicar un laboratorio como "completo" ante el profesor/universidad | **CEO explicito** | Decision de negocio/academica, no solo tecnica |
| Cambios a `HEURISTICA.md` | **CEO explicito** (y co-diseño con el profesor cuando aplique) | Es el documento puente con la tesis doctoral, no una decision tecnica interna |
| Nuevo laboratorio entra al backlog (ej. aceptar un 4to caso de prueba) | **CEO explicito** | Decision estrategica de que construye la fabrica |
