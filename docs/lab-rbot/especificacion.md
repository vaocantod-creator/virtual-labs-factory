# Especificacion — Rbot (modernizacion)

> Estado: BORRADOR del Arquitecto Heuristico (stack aprobado por el CEO: ver ADR-0001), pendiente de revision del CEO en lo demas (Victor es co-autor de la
> tesis original: varias respuestas solo las tiene el). No menciona stack nuevo; ver ADR-0001.
> Plantilla: `templates/spec.md`. Constitution: `docs/lab-rbot/constitution.md`.

## 1. Objetivo pedagogico
Lo que consta en el repo: Rbot simula un robot movil con orugas y una camara montada en una
estructura de cremallera, controlado a distancia desde un Centro de Mando.
**No hay objetivo de aprendizaje documentado.** Preguntas para Victor:
1. ¿Que competencia deberia ganar el estudiante (control a distancia, telecomunicaciones, robotica,
   redes UDP, otra)?
2. ¿A que nivel (curso/carrera) y con que conocimientos previos?
3. ¿Que errores conceptuales se quieren prevenir (latencia, perdida de paquetes, marcos de referencia
   de la camara)?
4. ¿Hay una practica de laboratorio asociada en la tesis?

## 2. Modelo sistemico (verificado en el codigo)
- **Subsistemas:** Centro de Mando (`commandcenter`: vista primera persona, controles, emisor y receptor
  UDP), Entorno Experimental (`experimentalenviroment`: escena 3D, cuerpo del robot, receptor UDP, vistas
  isometrica/superior/primera persona), escena (`virtualuniverse.VirtualScenary`, 482 lineas, la clase
  mas grande), configuracion (`config`), vistas de red (`view`).
- **Flujo:** el Centro de Mando emite un comando UDP al Entorno (5555) -> el Entorno ejecuta el comando
  sobre la escena y **retransmite** el mismo mensaje al destino configurado -> el Centro de Mando lo recibe
  (8080) y actualiza su vista.
- **Comandos:** `a`..`j` (ver constitution). Cada uno mueve piezas distintas del robot: p. ej. `a/b`
  rotan la cremallera y el engranaje elevador, `c/d` giran la estructura de camara y el engranaje base,
  `e/f` rotan la camara, `g/h/i/j` mueven orugas y cuerpo.
- **Estado interno:** tres acumuladores (`refVertical`, `refAzimut`, `refElevacion`) crecen o decrecen
  por paso fijo y no tienen limite explicito en el receptor del Entorno [HALLAZGO: posible desborde
  funcional; el Centro de Mando acota el rango de los controles a -18..58 para el movimiento vertical].
- **Estructura del codigo:** ~3.100 lineas; `WheelMovement` ya unifico 4 clases casi identicas
  (refactor del backlog).

## 3. Heuristicas 3D
- Escena con orugas de eslabones articulados, ruedas con 15 posiciones angulares (24 grados), camara
  elevable y orientable, y un cuarto virtual (`VirtualRoom`).
- Vistas: el video muestra la ventana "Receptor" con **4 vistas** (perspectiva de la habitacion, superior, primera persona y
  vista cercana del robot) y la ventana "Control a Distancia" con su vista en primera persona. La paridad visual entre versiones es
  criterio de aceptacion; referencia en `docs/lab-rbot/evidencia-video-rbot.md` (colores pasteles lisos, sombreado plano, sin texturas).
- **WebXR (extension planificada, ADR-0001):** vista primera persona del robot en visor; la camara del
  robot se separa de la camara del usuario; el modo pantalla normal es la linea base.
- Hallazgo del Metodo Castillo: las clases de la escena extienden `BranchGroup`/`TransformGroup` sin una
  clase base que fuerce los 5 pasos; la migracion es la oportunidad de introducir `ObjetoGrafico` en el
  nuevo stack (a confirmar con el profesor).

## 4. Rol de los agentes
- Constructores: Director -> Arquitecto (esta spec + ADR) -> Agente 3D (assets y paridad visual) ->
  Ingeniero (migracion) -> QA Pedagogico (rubrica PDD).
- Operadores: ninguno hoy. Posible linea futura: tutor que explique el efecto de cada comando.

## 5. Criterios de exito medibles
Verificables hoy en el repo:
- `./gradlew check` en verde (50 tests, Sonar Quality Gate OK) durante toda la migracion del lado Java.
- Los 10 comandos `a`..`j` se reconocen y uno desconocido se rechaza (ya cubierto en `CommandTest`).
- **Propiedades de los comandos (ADR-0002):** reversibilidad, independencia del historial, magnitud lineal, camara sin retraso y saturacion en los limites:
  103 propiedades verificadas (`prototypes/rbot-web/tools/propiedades.mjs`).

A definir (propuesta):
- **Test dorado de comportamiento:** para una secuencia fija de comandos (p. ej. `g g i c e a`), las
  transformaciones finales de las piezas coinciden entre la version Java y la nueva con tolerancia numerica.
- **Paridad visual:** capturas comparables de las 3 vistas en 5 puntos de una secuencia.
- **Interoperabilidad:** Centro de Mando Java + Entorno nuevo (y viceversa) funcionan a traves del puente.
- **Rubrica PDD:** depende de la respuesta a la seccion 1.
- **Accesibilidad:** corre en un equipo sin GPU dedicada (criterio de `docs/01`).
- **WebXR (fase posterior):** sesion inmersiva funcional en un visor soportado, con modo no inmersivo como alternativa.

## 5a. Comportamiento verificado con el codigo real (ver `ensamblado-y-paridad.md`)
- Entrada: **flechas direccionales** (arriba=`g`, abajo=`h`, derecha=`i`, izquierda=`j`); los spinners envian `a`..`f` solo con cambios de exactamente un paso.
- Paridad numerica del Entorno Experimental (cuerpo, camara, ruedas y eslabones) con el puerto web: 0 diferencias en 77 secuencias.
- Comportamiento original (medido): estado compartido entre avanzar y retroceder (`gh` no vuelve al origen; el primer `g` va hacia atras), retraso de un
  paso en la camara y acumuladores sin limite en el receptor. **Corregido por ADR-0002**: comandos relativos fijos, reversibles y sin retraso; el
  original queda como `modo: 'legado'` para paridad.

## 5b. Evidencia disponible
- Codigo y tests del repo `vdiquez/Rbot` (verificado).
- Prototipo de carga de las 19 piezas `.3ds` en Three.js: `docs/lab-rbot/prototipo-carga-3ds.md` (19/19 cargan).
- Grabacion de Rbot funcionando: `docs/lab-rbot/evidencia-video-rbot.md` (sin voz; no permite leer los valores de los controles).
- Oraculo Java con el codigo real de Rbot (`prototypes/rbot-oracle/`): 77 secuencias de referencia para el test dorado (ya no hace falta un segundo video para el comportamiento numerico).
- Falta: capturas de Rbot real con una secuencia conocida para decidir la iluminacion y comparar el dibujado.

## 6. Riesgos
- Reproducir con exactitud la cinematica acumulativa.
- Perdida de materiales/texturas al convertir `.3ds`.
- Cambio de modelo de comunicacion (UDP -> navegador) y latencia del puente.
- No se pudo ejecutar Rbot en el servidor (sin entorno grafico): toda la validacion visual debe hacerse
  en una maquina con pantalla (la de Victor) o con un runner con GPU/software rendering.
- El repo `vdiquez/Rbot` es de Victor: ningun cambio se hizo alli; esta spec vive en la fabrica.
