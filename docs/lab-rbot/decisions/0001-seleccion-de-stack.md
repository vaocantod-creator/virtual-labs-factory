# ADR-0001: Seleccion de tecnologia para migrar Rbot

- **Estado:** **ACEPTADA por el CEO (Victor) el 2026-10-22**: Three.js + TypeScript. WebXR queda como
  extension planificada, no como requisito inicial (ver seccion "WebXR"). El puente UDP->WebSocket y los
  tests dorados siguen como estrategia propuesta.
- **Fecha:** 2026-10-22
- **Laboratorio / alcance:** Rbot (`vdiquez/Rbot`)
- **Decide:** Arquitecto Heuristico propone; CEO aprueba

## Contexto (verificado contra el repo, oct 2026)

Datos del repo `vdiquez/Rbot`:
- ~3.100 lineas de Java en 36 clases de produccion (+ tests), 19 modelos `.3ds` (~1 MB en total).
- Java3D en la variante `org.scijava:j3dcore 1.6.0-scijava-1` sobre JOGL 2.3.2 (no 1.5.1, como decia
  `docs/05`; corregido). Compilacion a Java 8; el `run*` exige JDK 8 (en JDK 21 los entrypoints 3D
  fallan por configuracion grafica, segun su propio README).
- Dos aplicaciones Swing que hablan por UDP: Centro de Mando (puerto 8080) y Entorno Experimental
  (puerto 5555). El Entorno ejecuta el comando, mueve la escena 3D y **retransmite** el mensaje al
  destino configurado para sincronizar la vista del Centro de Mando.
- Protocolo: 10 comandos de una letra (`a`..`j`), modelados ya como `enum Command` con tests.
- El movimiento es **cinematico** (transformaciones de ejes y pasos fijos: 15 posiciones de rueda,
  24 grados por paso; camara con pasos de 0,1 y 2 unidades). No hay motor de fisica.
- Estado de modernizacion: backlog RB-001..RB-015 en `done` (build Gradle, Sonar con Quality Gate OK,
  50 tests, comandos testables, configuracion centralizada, separacion de responsabilidades,
  preparacion del refactor del modelo 3D). El `PLAN_TECNICO` de Rbot manda *mantener la tecnologia
  actual durante la estabilizacion* y deja la sustitucion tecnologica para la Fase D "selectiva".

Restricciones de la fabrica: laboratorios accesibles al estudiante sin GPU dedicada (`docs/01`),
publicacion a otras universidades (`docs/04`), constitution de Rbot (UDP 5555/8080 solo cambia con ADR),
y Metodo Castillo (`patrones-castillo-3d`) portable a otro stack.

## Opciones consideradas

1. **Mantener Java3D (scijava/JOGL) y subir a JDK 17/21.**
   Pros: cero migracion de logica, continuidad. Contras: Java3D es una libreria de mantenimiento minimo,
   el propio repo ya choca con JDK 21, requiere instalar Java en el equipo del estudiante, no corre en
   navegador, empaquetado nativo por plataforma.
2. **Three.js + TypeScript en navegador (recomendada).**
   Pros: sin instalacion, corre en cualquier equipo con WebGL, alcance de plataforma educativa,
   Three.js incluye `TDSLoader` (carga `.3ds` directo) y glTF; el modelo es escena-grafo igual que
   Java3D (`BranchGroup/TransformGroup` -> `Group/Object3D`), por lo que el Metodo Castillo se porta
   casi 1:1; los 19 assets pesan ~1 MB. Contras: cambia lenguaje, hay que resolver el transporte (ver
   decision), validar el aspecto visual, y el navegador no habla UDP.
3. **Babylon.js.** Pros: motor mas completo (fisica, inspector). Contras: no carga `.3ds` de forma nativa
   (hay que convertir), mas pesado de lo que Rbot necesita, ya que no usa fisica.
4. **Godot o Unity (export web).** Pros: editor y fisica. Contras: pipelines pesados, binarios grandes,
   curva alta para una escena cinematica pequena; Unity agrega licenciamiento.
5. **jMonkeyEngine / JavaFX 3D (seguir en Java).** Pros: conserva el lenguaje. Contras: sigue siendo de
   escritorio, sin ganancia de alcance, y obliga a reescribir la escena igual.

## Decision propuesta

**Opcion 2: Three.js + TypeScript**, ejecutada con estrategia *strangler* y sin big-bang:

1. Terminar en Java lo que el backlog ya tiene en curso (RB-015 y siguientes) y **congelar un
   "contrato de comportamiento" de Java** (tests dorados): secuencia de comandos -> estado de las
   transformaciones. Esa es la spec ejecutable contra la que se mide la paridad.
2. Portar primero el **Entorno Experimental** (escena y cinematica), manteniendo el Centro de Mando Java
   funcionando sin cambios.
3. Transporte: el navegador no puede abrir sockets UDP. Se propone un **puente** (Node.js) que acepta
   los mismos datagramas UDP `a`..`j` en 5555/8080 (invariante de la constitution preservado) y los
   reenvia por WebSocket al navegador. Asi la version vieja y la nueva interoperan.
4. Portar despues el Centro de Mando (controles y vista primera persona) a la misma app web.
5. Al lograr paridad (rubrica PDD + tests dorados), el protocolo puede evolucionar de UDP a
   WebSocket/WebRTC **mediante un ADR aparte**.

Mapeo del Metodo Castillo al nuevo stack (a confirmar con el profesor):
`ObjetoGrafico` (clase abstracta de 5 metodos) -> clase abstracta TypeScript sobre `THREE.Group` con
`ajustesIniciales/crearElementos/ajustarCapacidades/articularElementos/ajustesFinales`; `Cuerpo`,
`EstructuraCamara`, `WheelMovement` se vuelven subclases; `Command` -> `enum`; `Transceiver` /
`EnvironmentReceiver` -> modulo de transporte detras de una interfaz.

## Consecuencias

- Hay que convertir o cargar `.3ds` (probar `TDSLoader`; si hay perdida de materiales, convertir a glTF).
- Se necesita un arnes de paridad visual (capturas) y de comportamiento (tests dorados) antes de apagar Java.
- La migracion es de ~3.100 lineas: el riesgo no esta en el volumen, sino en reproducir la cinematica
  exacta (pasos y acumuladores de `refVertical`, `refAzimut`, `refElevacion`).
- La retransmision actual se hace por IP/puerto configurables en la UI; en web pasa a ser parte del puente.
- Queda dependiente de aprobacion: Node.js en el entorno del estudiante solo para el puente, o
  alojarlo en un servidor de la universidad.

## WebXR (consulta del profesor Castillo, oct 2026)

**Pertinente, como fase posterior y no como base.** Razones:
- Encaja con el trabajo futuro del propio articulo ICAETT 2022 (3D inmersivo, cascos, metaverso) y con el
  eje 3D de la heuristica ("representacion espacial e inmersiva"). Es evidencia directa para la tesis.
- Costo bajo en Three.js: `renderer.xr` y los helpers `VRButton`/`ARButton` vienen incluidos. Se habilita
  con `renderer.xr.enabled = true`, un boton de entrada, controladores via `renderer.xr.getController()` y
  `renderer.setAnimationLoop()` en vez de `requestAnimationFrame`. La escena y la logica del robot no cambian.
- Rbot gana sentido en inmersivo: la camara montada en el robot da una vista primera persona natural.
- **Limite de alcance (segun caniuse y comunidad, oct 2026): Safari en iPhone/iPad no soporta WebXR**
  (hasta la version 27.2 consultada). Si funciona en Chrome/Edge (Android, escritorio con headset), Meta
  Quest Browser y, segun foros de desarrolladores, Safari de Vision Pro (AR aun parcial). Para estudiantes con
  iPhone la experiencia debe ser **no inmersiva** (la version de pantalla normal).
- No hace falta casco para trabajar: existe emulacion en navegador (extension "Immersive Web Emulator"),
  [A VERIFICAR] que sirva para este caso.

**Reglas para que WebXR no complique la migracion:**
1. El modo de pantalla normal es la **linea base** y el criterio de paridad con Java; WebXR es una capa opcional encima.
2. Disenar desde ahora la escena para escala real en metros (en XR, 1 unidad = 1 metro) y separar
   "camara/entrada" de "escena": la camara de Rbot se maneja con comandos, el visor XR con la cabeza.
3. La entrada se abstrae: teclado/UI del Centro de Mando -> controladores XR, mapeados al mismo enum de
   comandos `a`..`j`. El protocolo no cambia.
4. Riesgo pedagogico y de salud a evaluar con QA Pedagogico: mareo por movimiento artificial (el robot
   avanza sin que el usuario se mueva) -> usar vista de cabina fija o teletransporte; no aceleraciones bruscas.
5. Accesibilidad: no puede ser el unico modo (equipos sin casco, politica de la universidad).
6. Una sesion de VR en el Entorno Experimental y el Centro de Mando en el mismo navegador implica decidir
   si el estudiante opera con controladores dentro del visor. Pregunta abierta para el profesor.

Plan: prototipo XR **despues** de la paridad con Java (hito propuesto: tras portar el Entorno Experimental).

## Lo que NO se ha verificado

- No se ejecuto Rbot (Java3D necesita entorno grafico; el servidor no lo tiene), asi que no he visto su
  comportamiento visual ni medido rendimiento.
- No se probo `TDSLoader` contra los 19 `.3ds` de Rbot: la carga limpia es una hipotesis.
- No se probo WebXR en ningun dispositivo; el soporte citado sale de caniuse y documentacion de Three.js,
  no de pruebas propias.
- La logica de estado de la camara (acumuladores) se leyo, no se valido con una corrida.
- El objetivo didactico de Rbot no esta documentado en el repo; se pregunta al autor (ver especificacion).
