# Guia de conversacion con el profesor Andres Castillo

Contexto: Victor revisa el articulo ICAETT 2022 (Melo, Castillo et al.) y propone integrarlo a la
fabrica. Texto base para la reunion; ver `docs/10-insumo-articulo-castillo.md`.

## 1. Mensaje de apertura (sugerido)

"Profesor, revise su articulo del Laboratorio Virtual de Instrumentacion Electronica y lo estamos
integrando a la Virtual Labs Factory. Nada de lo suyo se descarta: su metodo de programacion
sistemica (subsistemas independientes, diseno top-down / implementacion bottom-up, los 7 pasos con
grafo de escena) pasa a ser el flujo oficial del Arquitecto Heuristico; sus patrones (Object
Mobility, Event Controller, Graphic Element Builder) quedan como una skill reutilizable por los
agentes; y la Component Library queda como el mecanismo para que cada laboratorio aporte piezas al
siguiente. Queremos validarlo con usted antes de darlo por estable."

## 2. Que le recomendamos

1. **Formalizar el metodo como parte de la heuristica**: el articulo es el "metodo" y la fabrica el
   "como lo ejecutan agentes". Proponemos que la tesis lo presente asi: metodo (suyo) + agentes
   (aporte de la fabrica) + PDD (validacion pedagogica ejecutable).
2. **Publicar el articulo de patrones que menciona** (y el del metodo de programacion sistemica):
   hoy los agentes solo conocen los nombres y la funcion general; sin el detalle no podemos
   garantizar fidelidad al patron.
3. **Separar patron de lenguaje**: expresar los patrones de forma independiente de Java3D, para que
   sirvan igual en Rbot (Java3D), y en laboratorios nuevos si el stack cambia (ADR por laboratorio).
4. **Componer una Component Library publica** (perillas, displays, cursores, FFT) como activo
   academico citable, con version y documentacion.
5. **Incorporar PDD** como complemento de su validacion por experto: su criterio mide fidelidad,
   PDD mide si el estudiante aprende. Se conservan ambos.
6. **Aprovechar sus antecedentes** (Sateliton II, Maxwell 3D, objetos Java de telecomunicaciones)
   como base de los laboratorios 2 y 3 (radiacion y satelites).

## 3. Preguntas para el profesor

Sobre el metodo
- ¿Los 7 pasos son obligatorios y secuenciales, o se iteran por subsistema?
- ¿Cuales son los subsistemas minimos de todo laboratorio (iluminacion, visualizacion, mobiliario,
  gestion de equipos) o varian segun dominio (p. ej. un robot o un patron de radiacion)?
- ¿Como se aplica el metodo a laboratorios que NO son equipos (fenomenos, robots, orbitas)?
- ¿Como se relaciona su metodo con MVC en la practica?
Sobre los patrones
- Firmas exactas y orden de invocacion de los 5 metodos de Graphic Element Handler.
- ¿Como interactuan Object Mobility y Event Controller?
- ¿Autoriza que los agentes usen sus nombres de patrones y los citen? ¿Hay licencia o restriccion?
Sobre alcance y validacion
- ¿La heuristica es para emulacion de equipo real (objetivo del articulo) o tambien para objetos
  de aprendizaje/fenomenos? El articulo rechaza el paradigma de objetos de aprendizaje.
- ¿Acepta que la evaluacion con estudiantes (PDD) complemente la del experto?
- ¿Que rango de tolerancia numerica es aceptable al comparar con el equipo real?
- ¿Quien actuaria como experto tecnico validador de cada laboratorio?
Sobre agentes y stack
- ¿La heuristica exige agentes constructores, operadores o ambos (eje Agentes)?
- ¿Acepta un stack distinto a Java3D (p. ej. web) si los patrones se portan?
- ¿Metaverso/inmersivo (su trabajo futuro) entra como fase de la heuristica o queda como extension?
Sobre casos de prueba
- ¿Le interesa que el Laboratorio de Instrumentacion (generador + osciloscopio + analizador de
  espectro) sea un 4º caso de prueba de la fabrica? (decision final de Victor)
- ¿Puede compartir las practicas y manuales de usuario ya elaborados y el codigo del prototipo?

## 3b. Preguntas derivadas de los videos y de los JARs

Ver `docs/12` (seccion 5) y `docs/13` (seccion 7). Las mas importantes:
- ¿Entrega el codigo fuente `.java`? Hoy solo tenemos binarios `.class`.
- ¿`ObjetoGrafico`, `ObjetoGrafico2` y `EquipoTelecom` son versiones sucesivas del mismo patron? ¿Cual es la vigente?
- ¿"Object Mobility" es la movilidad de la clase base o un patron aparte? ¿"Event Controller" son los `*Control` + `Procesador*`?
- ¿Licencia y permisos para analizar, derivar rubricas y citar fragmentos?
- ¿Hay videos y practicas del osciloscopio HP, el analizador de espectro y el medidor/atenuador SWR?
- ¿Faltan JARs referenciados (`ComponentesLabTel.jar`, `NGeneradorFunciones.jar`, ...)?

## 4. Lo que necesitamos de el (entregables)

- PDF/manuscrito de los articulos de patrones y de metodo sistemico.
- Documento doctoral vigente (terminologia exacta; hoy `HEURISTICA.md` es borrador).
- Manuales de practica y de usuario del laboratorio de instrumentacion.
- Codigo fuente `.java` del prototipo (hoy solo tenemos los JARs de la Version 5).
- Criterios de validacion formales que usara para la tesis.
- Repos pendientes: patrones de radiacion y satelites (por Victor).

## 5. Lo que le ofrecemos

- Evidencia empirica (sensores, % autonomia, % reutilizacion de componentes, rubrica PDD) para su tesis.
- Retroalimentacion de la heuristica con cada laboratorio construido.
- Reporte semanal y dashboard para seguimiento.

## 6. Cuidados al presentar

- Presentar como **propuesta de integracion**, no como heuristica final: `HEURISTICA.md` es borrador.
- Reconocer que los patrones estan reconstruidos solo desde el articulo y requieren su confirmacion.
- No prometer reemplazo de laboratorio fisico (limite de acreditacion).
