# Heuristica (Puente con la tesis doctoral)

> Este documento es un **borrador vivo**, no la heuristica final del profesor Andres Castillo.
> Su proposito es traducir el documento doctoral (lo didactico + lo sistemico + lo 3D + agentes)
> en decisiones operativas concretas para la fabrica. Debe revisarse y ajustarse junto con el
> profesor antes de considerarse estable (ver Fase 0 del roadmap).

## Los 4 ejes, tal como los planteo el profesor

> "Una heuristica (un documento) que integre lo didactico, lo sistemico, 3D y agentes para la
> produccion de Lab virtuales."

| Eje | Pregunta que responde | Agente(s) responsable(s) en la fabrica |
|---|---|---|
| Didactico | ¿El laboratorio ensena y evalua correctamente el fenomeno/competencia? | QA Pedagogico, Arquitecto Heuristico |
| Sistemico | ¿El laboratorio se comporta como un sistema completo y coherente (entrada/proceso/salida, igual que el equipo real)? | Arquitecto Heuristico, Ingeniero de Laboratorio |
| 3D | ¿La representacion espacial/visual es fiel y comprensible? | Agente de Contenido 3D |
| Agentes | ¿Como participan los agentes de IA, tanto en construir el laboratorio como en su operacion para el estudiante? | Toda la red agentica (construccion) + diseno de tutores/asistentes IA dentro del propio lab (operacion) |

## Dos capas distintas del eje "Agentes" (actualizado tras investigacion de mercado)

> Ver `docs/06-investigacion-mercado.md`, seccion 5, punto 2. La literatura academica reciente
> (2025-2026) confirma que esta distincion ya es una linea activa de investigacion, no una
> especulacion nuestra, y conviene formalizarla explicitamente en la heuristica:

1. **Agentes constructores** — la red agentica descrita en `docs/01-red-agentica.md` (Director,
   Arquitecto Heuristico, Agente 3D, Ingeniero, QA Pedagogico, Reportero). Operan **antes** de que
   el laboratorio llegue al estudiante; su trabajo termina cuando el laboratorio se publica.
2. **Agentes operadores** — agentes de IA que viven **dentro** del laboratorio ya construido,
   interactuando directamente con el estudiante en tiempo real: tutores conversacionales, personajes
   simulados (ej. un "profesor virtual" o un "companero de laboratorio" con el que practicar), o
   asistentes que guian al estudiante cuando se equivoca. Evidencia de que esto es relevante:
   - SENEM-AI: estudiantes virtuales con personalidad en un entorno 3D para entrenar a profesores.
   - CLiVR: pacientes virtuales conversacionales en VR para practicas medicas.
   - Framework XR K-12: un "Agente Tutor" que enriquece la escena generada con anotaciones,
     glosario y preguntas de evaluacion.

**Implicacion para la heuristica:** un laboratorio puede validarse en el eje "Agentes" en dos
niveles independientes — (a) fue construido eficientemente por agentes, y (b) ofrece agentes utiles
durante su uso. Un laboratorio puede cumplir (a) sin (b), o viceversa; la heuristica final del
profesor deberia aclarar si exige ambos o si distingue variantes del producto segun cual cumplen.

## Metodo de validacion propuesto

Segun las palabras del profesor:

> "Para probar que esa heuristica es valida, desarrollare un lab virtual, basado en metodos,
> estrategias, lineamientos y herramientas que senale esa heuristica."

Esto implica que la heuristica debe producir, para cada laboratorio:

1. **Metodos** — como se construye (el proceso que sigue la fabrica, documentado en
   `docs/01-red-agentica.md` y `docs/03-roadmap.md`).
2. **Estrategias** — decisiones de alto nivel por laboratorio (ej. priorizar estabilizacion antes
   que modernizar, como ya se definio para Rbot en su propio `PLAN_EJECUTIVO.md`).
3. **Lineamientos** — reglas concretas y repetibles (ej. Definition of Done, convenciones de commit,
   checklist del QA Pedagogico).
4. **Herramientas** — el stack tecnico elegido y por que (Gradle/Java3D para Rbot por continuidad;
   `pixel-agents` adaptado para el dashboard por reutilizacion de una solucion ya validada por la
   comunidad en vez de reinventarla, segun `docs/06-investigacion-mercado.md`).

## Metrica de autonomia (nueva, tras investigacion de mercado)

> Ver `docs/06-investigacion-mercado.md`, seccion 5, punto 3. Herramientas comerciales comparables
> (Factory.ai con su "Agent Readiness score", Posidonius con sus experimentos de escalado) ya miden
> formalmente cuanto trabajo ocurre sin intervencion humana. La heuristica deberia adoptar un
> indicador equivalente, calculado por el Agente Reportero cada semana:

```
% de autonomia del ciclo = (tareas completadas sin decision del CEO) / (tareas totales del ciclo)
```

Este numero, mostrado en el dashboard pixel-art, es evidencia directa y cuantificable de que tan
"lo mas autonoma posible" (criterio explicito del CEO) esta logrando ser la fabrica, y sirve como
dato empirico para la tesis doctoral sobre que tan automatizable es realmente este tipo de
produccion.

## Limite realista a declarar explicitamente (nuevo)

> Ver `docs/06-investigacion-mercado.md`, seccion 1. Los jugadores establecidos del mercado
> (Labster, LabXchange) enfrentan un techo estructural: organismos de acreditacion en ciertas
> disciplinas (clinicas, ingenieria quimica) exigen horas minimas de laboratorio **fisico**, sin
> importar que tan bueno sea el laboratorio virtual. La heuristica debe reconocer este limite para
> no sobreprometer: un laboratorio de la fabrica **complementa** la practica fisica donde la
> acreditacion lo permite, y en los casos donde no, sirve como preparacion/refuerzo antes o despues
> de la practica real, no como sustituto total. Este matiz debe quedar explicito en
   `docs/04-impacto-educativo.md`.

## Evidencia que la fabrica debe producir por cada laboratorio

- [ ] Especificacion inicial (Arquitecto Heuristico) mapeada a los 4 ejes.
- [ ] Registro de decisiones tecnicas y su justificacion.
- [ ] Informe de QA Pedagogico (no solo QA tecnico).
- [ ] Metrica de autonomia del ciclo (ver arriba).
- [ ] Reflexion post-mortem: que parte del metodo se reutilizo de laboratorios anteriores y que
      tuvo que adaptarse (esto es lo que prueba — o refuta — que la heuristica generaliza).

## Pendiente de co-diseñar con el profesor (Fase 0)

- Terminologia exacta que usa su documento doctoral, para no inventar nombres distintos a los suyos.
- Criterios de evaluacion formal que el espera usar para "validar" la heuristica (cualitativos,
  cuantitativos, estudio de caso, etc.) — esto determina que metricas debe capturar el QA Pedagogico.
- Si la heuristica distingue formalmente entre agentes-constructores y agentes-operadores (seccion
  arriba) como dos capas separadas y evaluables por separado, o las trata como una sola dimension.
- Si el limite de acreditacion (seccion arriba) debe ser parte formal de la heuristica o queda solo
  como nota de alcance de negocio fuera del documento academico.


## Puente con el stack AI-Native (actualizado tras investigacion de 24 recursos)

> Ver `docs/07-ai-native-stack.md` para la investigacion completa (Spec-Driven Development,
> skills reutilizables, orquestacion multi-agente, registro de specs, harness engineering, y
> riesgos documentados de autonomia agentica a escala).

### PDD — Pedagogy-Driven Development (definicion propia de la fabrica)

> Nota de nomenclatura: esta metodologia se llamo inicialmente "EDD (Education-Driven Development)".
> Se renombro a **PDD** porque "EDD" ya es un termino de industria con otro significado
> (Evaluation-Driven Development, ver `docs/07-ai-native-stack.md` seccion 10 para el detalle y la
> metodologia EDD real que tambien adopta la fabrica, aplicada a los agentes mismos, no al
> laboratorio como producto).

La investigacion de SDD (Spec-Driven Development) y del registro de specs tipo Tessl dejo un vacio
claro: ningun framework generico de la industria cubre la validacion **pedagogica** de un artefacto
de software, solo la tecnica (tests de codigo, conformidad de API). La fabrica llena ese vacio con
una metodologia propia, **PDD (Pedagogy-Driven Development)**: antes de dar un laboratorio por
completo, el QA Pedagogico ejecuta una "rubrica pedagogica ejecutable" — equivalente a un test suite,
pero que verifica que el estudiante puede observar/manipular correctamente el fenomeno declarado en
la spec, no que el codigo compile.

**Esto es, en si mismo, candidato a ser el aporte mas original de la fabrica a la heuristica
doctoral del profesor**: PDD seria la pieza que conecta formalmente lo didactico (eje 1 de su
heuristica) con una practica de ingenieria de software verificable (en vez de quedar como intencion
cualitativa).

### Constitution por laboratorio mapeada a los 4 ejes

Cada repo de laboratorio debe tener un `constitution.md` (adoptado de GitHub Spec Kit) cuyas
secciones reflejen explicitamente los 4 ejes de la heuristica, no solo reglas tecnicas sueltas:

```
# Constitution — <nombre del laboratorio>

## Eje Didactico (reglas inmutables)
- ...

## Eje Sistemico (reglas inmutables)
- ...

## Eje 3D (reglas inmutables)
- ...

## Eje Agentes (reglas inmutables — distingue constructores vs. operadores, ver arriba)
- ...
```

Esto convierte la heuristica de documento teorico a **artefacto operativo que todo agente ejecutor
(Claude Code/Codex) debe respetar sin excepcion** en cada laboratorio construido — es la evidencia
empirica mas directa de que la heuristica "funciona" en la practica, tal como el profesor busca
demostrar con su tesis doctoral.

### Pendiente de co-diseñar con el profesor (actualizado)

- Si la "rubrica pedagogica ejecutable" (PDD) debe disenarse junto con el, dado que es el puente
  mas directo entre esta investigacion y su heuristica doctoral.
- Si el formato `constitution.md` de 4 secciones (arriba) es la forma correcta de operacionalizar
  sus 4 ejes, o si el prefiere otra estructura.
