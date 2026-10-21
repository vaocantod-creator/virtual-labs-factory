# Insumo del profesor Andres Castillo: articulo ICAETT 2022

> Fuente: Melo Q., Castillo R., Valencia V., Bravo D., Simbana L. "Virtual Laboratory of Electronic
> Instrumentation Based on a Programming Proposal Focused on Systems". ICAETT 2022, LNNS 619,
> pp. 483-496, Springer 2023. DOI 10.1007/978-3-031-25942-5_38.
> Nota: lectura completada con el PDF integro (15 paginas). Hallazgos adicionales: 4 subsistemas
> (iluminacion, visualizacion, mobiliario, gestion de equipos), uso del patron MVC, hojas de calculo
> para validar formulas, 2 manuales de practica + manuales de usuario. Los detalles de los patrones
> siguen sin publicarse (el profesor los presentara en otro articulo).

## 1. Que aporta el articulo

Es la **metodologia concreta de produccion** (el "Metodo") que hasta ahora la fabrica solo tenia como
nombre. Describe un prototipo Java3D (osciloscopio + 2 generadores de funciones) y, sobre todo, el
metodo con el que se construyo.

Elementos clave:
- **Ciclo**: iterativo e incremental (analisis, diseno, codificacion, pruebas/depuracion).
- **Programacion sistemica**: el laboratorio es un sistema; cada equipo es un subsistema que se
  trata igual (se vuelve libreria Java independiente, con su propio manejador de eventos). Los
  metodos de manejo de senal y cambios de estado se vuelven "procesos".
- **Diseno top-down, implementacion bottom-up** (de lo conceptual al detalle; se construye de
  objetos pequenos a integracion).
- **Secuencia de diseno por subsistema (7 pasos)**: escenarios usuario-sistema -> casos de uso ->
  diagrama de clases -> diagramas de comunicacion -> diagramas de estado -> **grafos de escena** ->
  codificacion de elementos graficos desde el grafo de escena.
- **Patrones de diseno propios**: Object Mobility, Event Controller, Graphic Element Builder (clase
  abstracta Graphic Element Handler con 5 metodos abstractos: crear objetos, ajustar capacidades,
  articular elementos, ajustes iniciales, ajustes finales).
- **Component Library**: orden estrategico de desarrollo (de equipo basico a sofisticado) para que
  cada equipo aporte componentes reutilizables al siguiente (botones, perillas, displays graficos,
  cursores, clases abstractas; el analizador de espectro futuro aportaria modulos FFT).
- **Fidelidad al equipo real**: apariencia, usabilidad, operacion y modelo matematico similares al
  equipo fisico; diseno propio (sin copiar marcas comerciales).
- **Validacion**: por experto tecnico (usabilidad, similitud, funcionalidad), comparando senales
  generadas (frecuencia, amplitud, tipo). No por estudiantes novatos.
- **Configuraciones predefinidas de escena** (5), manejo con menus y teclado, canvas a pantalla completa.
- **Objetivo declarado**: practicas con costo reducido; el lab prepara al estudiante para el equipo
  fisico "sin miedo a danarlo".
- **Trabajo futuro**: metaverso, 3D inmersivo (joystick, cascos 3D).
- **Herramientas**: Java 15 + Java3D 1.5.1, Blender (modelado/render), UML con Rational Rose.

## 2. Lo que ya tenemos (cubierto)

| Tema del articulo | Donde esta en la fabrica |
|---|---|
| Ejes sistemico + 3D + didactico como base | `HEURISTICA.md` (4 ejes) |
| Java3D 1.5.1 como stack del caso piloto | `docs/05` (Rbot), skill `modernizar-java3d-legacy` (docs/07) |
| Grafo de escena legado | `docs/07`: la skill ya inventaria el grafo de escena al modernizar |
| Metodologia iterativa e incremental | Roadmap por fases/ciclos semanales (`docs/03`) |
| Validacion con experto humano | QA Pedagogico + gates al CEO (`docs/03`, `docs/01`) |
| Limite frente a laboratorio fisico | `HEURISTICA.md` (limite de acreditacion) |
| Meta de reducir costo/acceso | `docs/04-impacto-educativo.md` |
| Telecomunicaciones como dominio | Casos 2 y 3 (radiacion, satelites; el autor tiene Sateliton II) |

## 3. Lo que falta agregar

1. **Metodo del profesor como artefacto de primera clase.** Hoy `HEURISTICA.md` dice "metodos,
   estrategias, lineamientos y herramientas" pero el "metodo" no esta detallado. Agregar la
   secuencia de 7 pasos de diseno y el principio top-down/bottom-up como el flujo que sigue el
   Arquitecto Heuristico.
2. **Catalogo de patrones del profesor** (Object Mobility, Event Controller, Graphic Element
   Builder / Graphic Element Handler). Convertirlos en una skill de fabrica
   (`patrones-castillo-3d`) y en seccion del `constitution.md` (eje Sistemico y eje 3D).
3. **Component Library transversal** entre laboratorios. La fabrica hoy trata cada lab de forma
   aislada; el articulo propone acumular componentes (perillas, displays, cursores) lab a lab.
   Agregar a la Fase 3-4 una medicion de **% de reutilizacion de componentes** (metrica de sensores,
   `docs/09`) y definir el orden de laboratorios segun componentes que aportan.
4. **Principio "fidelidad al equipo real"** (apariencia, usabilidad, modelo matematico, diseno
   propio sin marcas). Es criterio de QA distinto del de "objeto de aprendizaje"; debe ser un
   criterio explicito del QA Pedagogico (junto a PDD) para labs de instrumentacion.
5. **Validacion por experto + comparacion de salidas** con valores de referencia. Agregar al QA un
   protocolo de validacion por experto (formato de acta) y pruebas de salida numerica del modelo
   matematico (frecuencia/amplitud/forma) como test automatizado.
6. **Escenarios/configuraciones predefinidas** como requisito de UX de cada lab (equipos en
   distintas disposiciones, acercamiento para operar).
7. **Nuevo caso de prueba potencial**: Laboratorio de Instrumentacion Electronica (generador de
   funciones + osciloscopio; futuro analizador de espectro con FFT). Es candidato a lab de
   referencia del propio profesor. **Requiere decision del CEO** para entrar al backlog (gate).
8. **Fundamento bibliografico**: referencias [14], [19], [20] del articulo (Maxwell 3D, objetos
   Java de telecom, Sateliton II) como antecedentes directos de los casos 2 y 3 de la fabrica.
9. **Trabajo futuro del articulo -> roadmap**: inmersivo/metaverso, alineado con el eje
   "3D inmersivo" ya declarado en el README; anotarlo como horizonte de Fase 5.

## 4. Tensiones a resolver con el profesor (no descartar, resolver)

- **Stack**: el articulo es Java3D por conviccion metodologica; la fabrica evalua stack web (ver
  ADR). Propuesta: tratar los patrones como **independientes del lenguaje** (son OO/eventos) y
  portarlos, dejando que el ADR por laboratorio decida el stack.
- **Estudiantes como evaluadores**: el articulo dice que la evaluacion por estudiantes "no es
  relevante" (solo por experto). PDD de la fabrica si mide interaccion del estudiante (docs/09).
  Se conservan ambas: experto para fidelidad, estudiantes para efectividad didactica.
- **Eje Agentes**: el articulo no trata agentes de IA; ese eje queda como aporte de la fabrica.
- **Learning objects vs. emulacion de equipo**: el articulo rechaza explicitamente el paradigma de
  objetos de aprendizaje. Definir con el profesor si la heuristica es solo para emulacion de equipo
  o tambien para fenomenos (Rbot, radiacion).

## 5. Descartes

Ninguno. Solo se reinterpreta: el uso de IBM Rational Rose (CASE obsoleto) se reemplaza por UML en
texto (PlantUML/Mermaid), conservando los mismos diagramas del metodo; el hardware/OS de la seccion
de materiales es contexto, no requisito.

## 6. Proximos pasos propuestos (requieren aprobacion CEO donde se indica)

- [x] Leer el PDF completo.
- [x] Skill `patrones-castillo-3d` (`skills/patrones-castillo-3d/`) + plantilla `templates/constitution.md`.
- [x] Guia de conversacion: `docs/11-guia-conversacion-profesor-castillo.md`.
- [ ] Extender `HEURISTICA.md` con el Metodo (**CEO explicito**, co-diseno con el profesor).
- [ ] Criterio "fidelidad al equipo real" en QA Pedagogico.
- [ ] Decidir si el Lab de Instrumentacion es 4to caso de prueba (**CEO explicito**).
- [ ] Pedir al profesor el articulo sobre los patrones ("se presentara en otro articulo").
