# INDICE del proyecto (generado: no editar)

> Generado por `python3 herramientas/proyecto.py indice`. Se lee ANTES que cualquier documento: dice que hay, en que estado, y donde (con lineas) para leer solo lo necesario.
> Leer una seccion: `python3 herramientas/proyecto.py seccion <ruta> <titulo>`. Comprobar coherencia: `python3 herramientas/proyecto.py verificar`.

## Estado verificado (de `docs/estado.json`, pruebas del 2026-10-23, huella de codigo `91f40de269c753fc`)

- OK  `tipos`: sin cifra — TypeScript estricto sin errores
- OK  `compilacion`: sin cifra — Compilacion de produccion (vite build)
- OK  `puente`: 30 (fallos 0) — Puente UDP<->WebSocket (comprobaciones)
- OK  `servidor`: 52 (fallos 0) — Servidor de laboratorio y salas (comprobaciones)
- OK  `e2e-lab`: 14 (fallos 0) — Modo laboratorio extremo a extremo, dos navegadores (comprobaciones)
- OK  `propiedades`: 103 (fallos 0) — Propiedades del comportamiento de comandos (ADR-0002)
- OK  `paridad`: 77 (fallos 0) — Paridad numerica con el codigo Java real, secuencias (modo legado)
- OK  `e2e`: 21 (fallos 0) — Centro de Mando y Receptor extremo a extremo con UDP real (comprobaciones)
- OK  `carga-15`: 3000 (fallos 0) — Carga: 15 parejas, 200 comandos cada una a 20 cmd/s (comandos entregados)

**ADR:** ADR-0001 Seleccion de tecnologia para migrar Rbot [ACEPTADA por el CEO (Victor) el 2026-10-]; ADR-0002 Los comandos de Rbot son incrementos relativos fijos (s [ACEPTADA por instruccion del CEO (Victor]; ADR-0003 Puente UDP<->WebSocket y Centro de Mando web (interoper [ACEPTADA por instruccion del CEO (Victor]; ADR-0004 Modo laboratorio: un servidor, salas por pareja, sin in [ACEPTADA por instruccion del CEO (Victor]

**NO comprobado (no darlo por hecho):** Aplicaciones Swing de Java reales contra el puente (solo un cliente Java minimo); scripts/laboratorio.sh sin ejecutar y Dockerfile sin construir; Aspecto visual frente a Java con pantalla (iluminacion, campo de vision); Rendimiento en equipos de estudiantes y Wi-Fi reales; estudiantes reales; HTTPS y reconexion automatica; Nodo 20/22 (solo se probo Node 26.7)

## Documentos

### `HEURISTICA.md` (~3166 tok)
Heuristica (Puente con la tesis doctoral). Borrador vivo que traduce la heuristica doctoral del profesor (4 ejes: didactico, sistemico, 3D, agentes) en reglas operativas de la fabrica; requiere aprobacion explicita del CEO para cambiarse.
Secciones: Los 4 ejes, tal como los planteo el pr (L8) · Dos capas distintas del eje "Agentes"  (L20) · Metodo de validacion propuesto (L43) · Metrica de autonomia (nueva, tras inve (L62) · Limite realista a declarar explicitame (L78) · Evidencia que la fabrica debe producir (L89) · Pendiente de co-diseñar con el profeso (L98) · Puente con el stack AI-Native (actuali (L109) · Puente con el articulo del profesor (I (L170)
Enlaza: docs 01,03,04,06,07,10,11

### `README.md` (~2928 tok)
Virtual Labs Factory. Entrada al repo: vision, casos de prueba, arbol de archivos y estado actual con lo verificado y lo NO comprobado del piloto Rbot.
Secciones: Origen y proposito (L8) · Vision del CEO (Victor Ocanto) (L30) · Casos de prueba disponibles (inputs hi (L39) · Estructura de este repositorio (L51) · Vocabulario clave (evitar confusion de (L96) · Estado actual (L104)
Enlaza: docs 00,01,02,03,04,05,06,07,08,09,10,11,12,13,14

### `docs/01-red-agentica.md` (~2065 tok)
Red Agentica de la Fabrica de Laboratorios Virtuales. Jerarquia de agentes (Director, Arquitecto Heuristico, 3D, Ingeniero, QA Pedagogico, Reportero), sus roles y el protocolo por factory-state.json.
Secciones: Principio de diseno (L3) · Niveles (L15) · Roles detallados (L34) · Protocolo de comunicacion entre agente (L103) · Por que esta estructura sirve como pru (L132)

### `docs/02-dashboard-pixel-art.md` (~1960 tok)
Dashboard Pixel-Art del CEO. Diseno del dashboard pixel-art del CEO: adaptar pixel-agents-hq/pixel-agents en vez de construir desde cero, y sus fases.
Secciones: Objetivo (L3) · Decision tecnica actualizada (tras inv (L9) · Trabajo de adaptacion requerido (L50) · Diseno de la escena (vigente, ahora so (L71) · Fases de construccion del dashboard (a (L89) · Por que esto importa para la heuristic (L101)
Enlaza: docs 01,06

### `docs/03-roadmap.md` (~2743 tok)
Roadmap de la Fabrica (por fases y ciclos semanales). Fases 0-5 y checklist por fase (aqui se marca lo hecho), gates de aprobacion del CEO y cadencia semanal. Documento a tocar al cerrar cualquier hito.
Secciones: Fase 0 — Fundacion (semanas 1-2) (L6) · Fase 1 — Primer ciclo agentico real (s (L22) · Transversal — Brechas pendientes de la (L38) · Fase 2 — QA Pedagogico + Dashboard din (L47) · Fase 3 — Segundo laboratorio (semanas  (L53) · Fase 4 — Tercer laboratorio + consolid (L60) · Transversal — Metodo Castillo (insumo  (L68) · Fase 5 — Plataforma educativa (horizon (L87) · Cadencia operativa semanal (desde Fase (L92) · Fase 6 — Operacion y mantenimiento (po (L102) · Gates de aprobacion — que decide el Di (L122)
Enlaza: docs 01,04,08,09

### `docs/04-impacto-educativo.md` (~1332 tok)
Impacto Educativo y Plataforma en la Era de la IA. Tesis de impacto en universidades de recursos limitados y modelo de plataforma educativa con IA; incluye riesgos a gestionar.

### `docs/05-casos-de-prueba.md` (~1482 tok) — Estado: Codigo funcional legado, con plan de modernizacion ya iniciado (ver
Casos de Prueba (Laboratorios Candidatos). Ficha por laboratorio candidato: 1 Rbot (piloto), 2 radiacion, 3 satelites, 4 instrumentacion (propuesto, sin aprobar) y plantilla para nuevos.
Secciones: 1. Rbot — Robot Virtual Controlado a D (L6) · 2. Patrones de Radiacion (Telecomunica (L28) · 3. Satelites (L40) · 4. Laboratorio de Instrumentacion Elec (L50) · Antecedentes del profesor relevantes a (L65) · Plantilla para nuevos casos (L70)
Enlaza: docs 10,12

### `docs/06-investigacion-mercado.md` (~3143 tok)
Investigacion de Mercado y Tendencias. Investigacion de mercado: labs virtuales, agentes de IA, fabricas de software agenticas, dashboards pixel-art y brechas. Contexto, no se actualiza con el piloto.
Secciones: 1. Mercado de laboratorios virtuales e (L6) · 2. Tendencias en agentes de IA aplicad (L36) · 3. "Fabricas de software" agenticas (r (L60) · 4. Dashboards pixel-art para visualiza (L76) · 5. Que nos esta faltando (gap analysis (L109) · 6. Recomendaciones concretas antes de  (L136)
Enlaza: docs 01,02,04,05

### `docs/07-ai-native-stack.md` (~8217 tok)
Stack AI-Native de la Fabrica. Stack AI-Native: SDD, ADR, skills, orquestacion, harness, matriz de riesgo, EDD vs PDD y decisiones pendientes. El mas largo (~8k tokens): leer por seccion.
Secciones: 1. Spec-Driven Development (SDD) — dec (L7) · 2. Registro de Specs (Tessl) — adoptar (L68) · 3. Sistema de Skills — estandar adopta (L84) · 4. Orquestacion multi-agente — Hermes  (L115) · 5. Harness Engineering (Bockeler) — ad (L126) · 6. Matriz de riesgo para decidir "vibe (L142) · 7. Riesgos documentados de autonomia a (L160) · 8. Metodologias — mapeo final a la red (L175) · 9. Decisiones pendientes de validar co (L186) · 10. Desambiguacion de acronimos: EDD ( (L194) · 11. Loop Engineering — adoptado como c (L259) · 12. Donde se define el stack tecnico — (L304) · 13. Claude Code Mods — herramienta dis (L341)
Enlaza: docs 01,02,03,04

### `docs/08-validacion-curso-claude.md` (~2564 tok)
Validacion contra el estandar de Claude Academy (AI-Native SDLC Playbook). Validacion contra el curso AI-Native SDLC Playbook de Claude Academy: mapeo por etapa, brechas (origen de la Fase 6) y conclusion.
Secciones: Estructura del curso (6 etapas) (L12) · Mapeo etapa por etapa contra lo ya dec (L23) · Resumen de brechas detectadas (accione (L117) · Conclusion de la validacion (L127)
Enlaza: docs 03,07

### `docs/09-sensores-auditoria.md` (~2091 tok)
Capa de Auditoria y Monitoreo (Sensores) para Aprendizaje Automatico. Capa de sensores y metricas (JSONL por laboratorio) para auditoria, metrica de autonomia y futuro aprendizaje automatico.
Secciones: Principio de diseno (L8) · Catalogo de sensores (por capa) (L16) · Formato de registro (ejemplo) (L54) · De sensores a aprendizaje automatico ( (L63) · Responsable de cada capa (L84)
Enlaza: docs 07,08

### `docs/10-insumo-articulo-castillo.md` (~2317 tok)
Insumo del profesor Andres Castillo: articulo ICAETT 2022. Analisis del articulo ICAETT 2022 del profesor: que aporta, que ya estaba, que falta, tensiones y seccion de descartes.
Secciones: 1. Que aporta el articulo (L13) · 2. Lo que ya tenemos (cubierto) (L45) · 3. Lo que falta agregar (L58) · 4. Tensiones a resolver con el profeso (L87) · 5. Descartes (L100) · 6. Proximos pasos propuestos (requiere (L106)
Enlaza: docs 04,11

### `docs/11-guia-conversacion-profesor-castillo.md` (~1803 tok)
Guia de conversacion con el profesor Andres Castillo. Guia para la reunion con el profesor: mensaje de apertura, recomendaciones, preguntas (incl. videos y WebXR), entregables que se piden y cuidados.
Secciones: 1. Mensaje de apertura (sugerido) (L6) · 2. Que le recomendamos (L16) · 3. Preguntas para el profesor (L33) · 3b. Preguntas derivadas de los videos  (L60) · 3c. WebXR (el profesor lo menciono a V (L71) · 4. Lo que necesitamos de el (entregabl (L79) · 5. Lo que le ofrecemos (L88) · 6. Cuidados al presentar (L94)
Enlaza: docs 10

### `docs/12-videos-lab-instrumentacion.md` (~2551 tok)
12. Videos del Laboratorio de Instrumentacion Electronica (insumo del profesor Castillo). Analisis de los 29 videos del lab de instrumentacion: catalogo, lo que revelan del metodo, practicas -> rubricas PDD, brechas.
Secciones: 1. Que son los videos (L10) · 2. Catalogo por tema (sin duplicados) (L17) · 3. Lo que revelan sobre el metodo del  (L55) · 4. Mapa de practicas -> rubricas PDD c (L81) · 5. Brechas y preguntas (para `docs/11` (L99) · 6. Notas de calidad de la transcripcio (L115) · 7. Impacto en el repo (L123)
Enlaza: docs 13

### `docs/13-jars-lab-virtual-v5.md` (~4608 tok)
13. Analisis de los JARs del Laboratorio Virtual (Version 5) — profesor Castillo. Analisis estatico y por decompilacion de los JARs de la Version 5: patrones confirmados, mapa de equipos, formulas, oraculos, deuda tecnica.
Secciones: 1. Contenido (L11) · 2. Mapa de equipos y sistemas (L24) · 3. Confirmacion del Metodo Castillo en (L43) · 4. Modelo matematico y oraculos de pru (L75) · 5. Deuda tecnica y riesgos (para la mo (L96) · 6. Impacto en el repo (L112) · 7. Preguntas para el profesor derivada (L122) · 8. Alcance y limites de este analisis (L137) · 9. Verificacion por decompilacion (gen (L147)

### `docs/14-despliegue-laboratorio.md` (~663 tok)
Despliegue de Rbot Web en un laboratorio. Guia operativa para desplegar Rbot Web en un laboratorio (PC del aula o Docker), seguridad minima y lo que NO esta resuelto (ADR-0004).

### `docs/decisions/0000-plantilla-adr.md` (~178 tok) — Estado: propuesta | aceptada | reemplazada por ADR-XXXX
ADR-NNNN: <titulo corto de la decision>. Plantilla de ADR (contexto, opciones, decision, consecuencias).
Enlaza: docs 03

### `docs/lab-instrumentacion/transcripciones.md` (~14691 tok)
Transcripciones automaticas de los videos del Laboratorio de Instrumentacion. (SIN RESUMEN)
Datos crudos: no leer completo; usar `seccion`.

### `docs/lab-rbot/constitution.md` (~1456 tok) — Estado: PROPUESTA, pendiente de revision del CEO. Basada en la plantilla templates/constitution.md.
Constitution — Rbot (Robot Virtual Controlado a Distancia). Reglas inmutables de Rbot por eje (didactico, sistemico, 3D, agentes) y Metodo Castillo; fija protocolo UDP 5555/8080 y comandos relativos (ADR-0002). Propuesta pendiente de revision del CEO.
Secciones: Eje Didactico (reglas inmutables) (L9) · Eje Sistemico (reglas inmutables) (L17) · Eje 3D (reglas inmutables) (L33) · Eje Agentes (reglas inmutables — const (L42) · Metodo Castillo — programacion sistemi (L50) · Reglas de calidad (heredadas del repo) (L63)
Enlaza: docs 01

### `docs/lab-rbot/decisions/0001-seleccion-de-stack.md` (~2517 tok) — Estado: ACEPTADA por el CEO (Victor) el 2026-10-22: Three.js + TypeScript. WebXR queda como
ADR-0001: Seleccion de tecnologia para migrar Rbot. ADR aceptada: Three.js + TypeScript para migrar Rbot (opciones evaluadas, migracion gradual, puente, WebXR como fase posterior).
Secciones: Contexto (verificado contra el repo, o (L10) · Opciones consideradas (L32) · Decision propuesta (L51) · Consecuencias (L73) · WebXR (consulta del profesor Castillo, (L83) · Lo que NO se ha verificado (L113)

### `docs/lab-rbot/decisions/0002-comandos-relativos.md` (~1772 tok) — Estado: ACEPTADA por instruccion del CEO (Victor) el 2026-10-22, para la version web. El alcance sobre el
ADR-0002: Los comandos de Rbot son incrementos relativos fijos (sin estado acumulado compa. ADR aceptada: cada comando es un incremento relativo fijo, reversible y sin retraso; tabla de defectos medidos del comportamiento Java original; 103 propiedades.
Secciones: Contexto (L8) · Decision (L28) · Verificacion (ejecutada) (L56) · Consecuencias (L69) · Lo que NO se verifico (L81)
Enlaza: docs 03

### `docs/lab-rbot/decisions/0003-puente-udp-websocket-y-centro-de-mando-web.md` (~1678 tok) — Estado: ACEPTADA por instruccion del CEO (Victor) el 2026-10-22 ("procede con la salida a" del ADR-0002).
ADR-0003: Puente UDP<->WebSocket y Centro de Mando web (interoperabilidad con Rbot Java). ADR aceptada: puente Node UDP<->WebSocket sin cambiar el protocolo, Centro de Mando web, roles por URL, seguridad del puente y pruebas.
Secciones: Contexto (L7) · Decision (L12) · Seguridad (el puente abre puertos de r (L24) · Verificacion (ejecutada) (L34) · Lo que NO se verifico (L46) · Consecuencias (L56)

### `docs/lab-rbot/decisions/0004-modo-laboratorio-salas.md` (~1311 tok) — Estado: ACEPTADA por instruccion del CEO (Victor) el 2026-10-23 ("prepara el modo de despliegue para el laboratorio").
ADR-0004: Modo laboratorio: un servidor, salas por pareja, sin instalar nada en el equipo . ADR aceptada: servidor unico con salas por pareja y clave, topes, seguridad HTTP, pruebas de carga y limites declarados.

### `docs/lab-rbot/ensamblado-y-paridad.md` (~2779 tok) — Estado: ejecutado el 2026-10-22. Codigo en prototypes/rbot-web/; oraculo Java en prototypes/rbot-oracle/.
Ensamblado del robot en Three.js y prueba de paridad con el codigo real de Rbot. Informe del ensamblado del robot en Three.js y la prueba de paridad numerica contra el codigo Java real (oraculo), con control negativo y hallazgos heredados.
Secciones: Que se hizo (L6) · Como funciona Rbot (verificado en el c (L16) · 1. Resultado: paridad numerica con el  (L26) · 2. Lo que la prueba cubre y lo que NO (L35) · 3. La prueba discrimina (control negat (L48) · 4. Comparacion visual con la captura d (L54) · 5. Hallazgos de comportamiento heredad (L70) · 6. Como se ejecuto el oraculo (reprodu (L97) · 7. Siguiente paso propuesto (L106)
Enlaza: docs 02

### `docs/lab-rbot/especificacion.md` (~1914 tok) — Estado: BORRADOR del Arquitecto Heuristico (stack aprobado por el CEO: ver ADR-0001), pendiente de revision del CEO en
Especificacion — Rbot (modernizacion). Especificacion de Rbot (objetivo pedagogico, modelo sistemico, heuristicas 3D, criterios de exito medibles y evidencia). Borrador pendiente de revision.
Secciones: 1. Objetivo pedagogico (L7) · 2. Modelo sistemico (verificado en el  (L18) · 3. Heuristicas 3D (L35) · 4. Rol de los agentes (L47) · 5. Criterios de exito medibles (L52) · 5a. Comportamiento verificado con el c (L68) · 5b. Evidencia disponible (L75) · 6. Riesgos (L82)

### `docs/lab-rbot/evidencia-video-rbot.md` (~1297 tok)
Evidencia en video: Rbot (Java3D) funcionando. Lo que se ve en el video del Rbot real (dos ventanas Java, 4 vistas) y lo que no se pudo establecer; efecto sobre la especificacion.

### `docs/lab-rbot/prototipo-carga-3ds.md` (~1072 tok) — Estado: prototipo ejecutado el 2026-10-22. Codigo en prototypes/rbot-web/ (este repo). Responde a la hipotesis
Prototipo rbot-web: carga de las piezas `.3ds` de Rbot en Three.js. Resultado del prototipo de carga: las 19 piezas .3ds cargan con TDSLoader; hallazgos y lo que no prueba.

### `prototypes/rbot-oracle/README.md` (~370 tok)
Oraculo Java de Rbot (arnes de prueba). Arnes Java que ejecuta el codigo real de Rbot sin pantalla (renderer noop + Xvfb) y vuelca matrices: genera la referencia de paridad.

### `prototypes/rbot-web/README.md` (~1284 tok)
rbot-web — Rbot en Three.js + TypeScript. Guia del prototipo Three.js+TS: estructura, comandos de prueba, modo en red (ADR-0003), modo laboratorio (ADR-0004) y estado.
Enlaza: docs 14

### `skills/patrones-castillo-3d/SKILL.md` (~1142 tok)
Patrones Castillo 3D (metodo de programacion sistemica). Skill del Metodo Castillo (borrador v0.2): 7 pasos de diseno, 3 patrones, Component Library, ley dura y pitfalls.
Enlaza: docs 10

### `skills/patrones-castillo-3d/references/fidelidad-y-validacion.md` (~362 tok)
Fidelidad al equipo real y validacion por experto. Referencia: fidelidad al equipo real y validacion del modelo por experto.

### `skills/patrones-castillo-3d/references/patrones.md` (~611 tok) — Estado: articulo ICAETT 2022 + contraste con los JARs de la Version 5 (docs/13, lectura estatica de
Patrones del profesor Castillo — ficha de trabajo. Ficha de trabajo de los patrones (esqueleto con nombres reales del codigo y preguntas para el profesor).
Enlaza: docs 11

### `templates/constitution.md` (~395 tok)
Constitution — <nombre del laboratorio>. Plantilla de constitution por laboratorio (4 ejes + Metodo Castillo).

### `templates/spec.md` (~225 tok)
Especificacion — <nombre del laboratorio>. Plantilla de especificacion por laboratorio (sin eleccion de stack).

_Total de documentos: 34, ~78687 tokens si se leyeran todos._

## Codigo y datos (proposito = primer comentario del archivo)

- `docs/indice-resumenes.json` (8048 bytes): datos/config
- `docs/lab-rbot/img/prototipo-3ds.png` (265239 bytes): datos/config
- `docs/lab-rbot/img/rbot-java-inicio.jpg` (133215 bytes): datos/config
- `docs/lab-rbot/img/rbot-java-movido.jpg` (132101 bytes): datos/config
- `docs/lab-rbot/img/robot-web-captura-victor.png` (257504 bytes): datos/config
- `docs/lab-rbot/img/robot-web-gggiii.png` (235294 bytes): datos/config
- `prototypes/rbot-oracle/oraculo-77-secuencias.json` (102075 bytes): datos/config
- `prototypes/rbot-oracle/src/com/rbot/experimentalenviroment/body/Oraculo.java` (103 lineas): ARNES DE ORACULO (fuera del repo de Victor, no lo modifica): ejecuta el codigo REAL de Rbot sobre `Cuerpo`
- `prototypes/rbot-web/Dockerfile` (23 lineas): -
- `prototypes/rbot-web/bridge/puente.mjs` (284 lineas): Puente UDP <-> WebSocket de Rbot (ADR-0003).
- `prototypes/rbot-web/bridge/puente.test.mjs` (123 lineas): Pruebas del puente UDP<->WebSocket con trafico real (loopback). Usa puertos altos para no chocar con Rbot Java
- `prototypes/rbot-web/bridge/servidor.mjs` (100 lineas): Servidor de laboratorio de Rbot Web (ADR-0004): sirve la aplicacion compilada (`dist/`) y el puente en UN solo
- `prototypes/rbot-web/bridge/servidor.test.mjs` (159 lineas): Pruebas del servidor de laboratorio (HTTP estatico + salas WebSocket). Sin navegador; usa un directorio tempor
- `prototypes/rbot-web/index.html` (50 lineas): Rbot Web — Entorno Experimental y Centro de Mando
- `prototypes/rbot-web/package.json` (906 bytes): datos/config
- `prototypes/rbot-web/piezas.html` (21 lineas): Rbot Web — prototipo de carga de piezas .3ds
- `prototypes/rbot-web/scripts/copiar-modelos.sh` (8 lineas): Copia las 19 piezas .3ds desde el repo de Victor (vdiquez/Rbot, carpeta piezas/).
- `prototypes/rbot-web/scripts/laboratorio.sh` (27 lineas): Arranca el servidor de laboratorio de Rbot Web (ADR-0004) y muestra los enlaces para estudiantes.
- `prototypes/rbot-web/src/app.ts` (228 lineas): Con sala, por defecto el WebSocket es el MISMO servidor que sirvio la pagina (modo laboratorio); sin sala, el 
- `prototypes/rbot-web/src/java3d.ts` (56 lineas): Emulacion minima de javax.media.j3d.Transform3D con la misma semantica que usa Rbot.
- `prototypes/rbot-web/src/piezas.ts` (158 lineas): Las 19 piezas del repo vdiquez/Rbot (carpeta piezas/). Nombres exactos de archivo.
- `prototypes/rbot-web/src/red/centro.ts` (58 lineas): Logica del Centro de Mando (puerto de `Transmitter.java` + `ViewFinder.java`), sin interfaz ni red: facil de p
- `prototypes/rbot-web/src/red/transporte.ts` (119 lineas): Mensajes del puente (ver bridge/puente.mjs).
- `prototypes/rbot-web/src/robot/Cuerpo.ts` (164 lineas): Cuerpo del robot (puerto de `Cuerpo.java`). Reune chasis, 4 ruedas, 2 orugas de 29 eslabones y la estructura d
- `prototypes/rbot-web/src/robot/Entorno.ts` (235 lineas): Rangos del Centro de Mando (ViewFinder.java) EXPRESADOS EN PASOS ENTEROS: vertical -18..58 (pasos de 0,1), azi
- `prototypes/rbot-web/src/robot/ObjetoGrafico.ts` (35 lineas): Origen de las piezas 3D: devuelve una copia independiente de cada `.3ds` cargado.
- `prototypes/rbot-web/src/robot/camara.ts` (209 lineas): Camara (puerto de `Camara.java`): cabeza de la camara, gira en Y local (`rotarEjeY`, 'elevacion').
- `prototypes/rbot-web/src/robot/constantes.ts` (84 lineas): Posiciones canonicas de los 29 eslabones del circuito de la oruga.
- `prototypes/rbot-web/src/robot/oruga.ts` (116 lineas): Eslabon parametrico de la oruga (puerto de `TrackLink.java`). Ocupa uno de 29 puestos del circuito.
- `prototypes/rbot-web/src/robot/rueda.ts` (83 lineas): Rueda parametrica (puerto de `WheelMovement.java`): 15 posiciones angulares de -24 grados.
- `prototypes/rbot-web/src/robot/vistas.ts` (235 lineas): Plataformas de vista de `VirtualScenary.java`: 4 vistas del Entorno Experimental (panel del "Receptor", 2x2).
- `prototypes/rbot-web/tools/carga.mjs` (63 lineas): Prueba de carga del servidor de laboratorio: N salas (Centro + Receptor) enviando comandos a la vez. Mide late
- `prototypes/rbot-web/tools/comparar.mjs` (56 lineas): Prueba de paridad: compara el estado del Entorno web (Three.js) con el del codigo REAL de Rbot (oraculo Java).
- `prototypes/rbot-web/tools/correr-todo.mjs` (68 lineas): Ejecuta TODAS las pruebas del prototipo y escribe los resultados en un JSON (fuente de verdad de las cifras: d
- `prototypes/rbot-web/tools/e2e-lab.mjs` (79 lineas): Prueba extremo a extremo del MODO LABORATORIO: servidor.mjs sirve dist/ y el puente; dos navegadores (Centro y
- `prototypes/rbot-web/tools/e2e.mjs` (128 lineas): Prueba extremo a extremo: dos paginas (Centro de Mando y Receptor) + puente + UDP real + un cliente Java del J
- `prototypes/rbot-web/tools/escena.mjs` (50 lineas): Ejecuta una secuencia de comandos en el Entorno (navegador sin pantalla), guarda captura y volcado de estado.
- `prototypes/rbot-web/tools/generar-secuencias.mjs` (32 lineas): Genera las secuencias de prueba de paridad (fijas + aleatorias con semilla, reproducibles).
- `prototypes/rbot-web/tools/probar.mjs` (70 lineas): Abre el prototipo en Chromium sin pantalla (WebGL por software), espera la carga de las piezas,
- `prototypes/rbot-web/tools/propiedades.mjs` (139 lineas): Propiedades del comportamiento MEJORADO (ADR-0002). Se ejecutan en el navegador sin pantalla.
- `prototypes/rbot-web/tools/secuencias.txt` (2960 bytes): datos/config
- `prototypes/rbot-web/tsconfig.json` (317 bytes): datos/config
