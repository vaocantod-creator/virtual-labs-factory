# Virtual Labs Factory

**Fabrica de Laboratorios Virtuales Agentica.** Sistema multi-agente autonomo que disena, construye,
valida y mantiene laboratorios virtuales educativos 3D, usando como primer caso de prueba la
modernizacion del proyecto [Rbot](https://github.com/vdiquez/Rbot) (tesis de grado 2007, Robot Virtual
Controlado a Distancia con Java3D).

## Origen y proposito

En 2007, Victor Ocanto y Ronald Verenzuela desarrollaron Rbot como tesis de grado: un robot virtual
3D controlado remotamente via UDP, bajo la tutoria de los profesores Andres Castillo y Felipe Pacheco.
En ese momento ya existia la vision de construir laboratorios virtuales para universidades, tan
realistas como el equipo de medicion fisico real.

Hoy, el profesor Andres Castillo desarrolla una **tesis doctoral** cuyo producto es una **heuristica**
(documento metodologico) que integra:

- **Lo didactico** — como se ensena y se evalua con el laboratorio.
- **Lo sistemico** — como el laboratorio se articula como sistema completo (hardware/software/usuario).
- **3D** — la representacion espacial e inmersiva del fenomeno o equipo simulado.
- **Agentes** — uso de agentes de software (IA) en la produccion y/o operacion del laboratorio.

Esta heuristica necesita un caso de prueba real que demuestre su validez. **Virtual Labs Factory es
ese caso de prueba**: una fabrica de software operada por agentes de IA que construye laboratorios
virtuales siguiendo metodos, estrategias, lineamientos y herramientas derivados de la heuristica.

Al validarse, el documento de heuristica queda listo para adaptarse a otros dominios de producto
educativo, y la fabrica queda como una plataforma reutilizable para generar nuevos laboratorios.

## Vision del CEO (Victor Ocanto)

- Victor actua como **CEO de la fabrica**: define que laboratorios se construyen, revisa avances
  **semanalmente**, aprueba o corrige rumbo. No opera el detalle tecnico dia a dia.
- La fabrica debe ser **lo mas autonoma posible**: los agentes planifican, construyen, prueban y
  reportan sin intervencion humana constante.
- Existe una **interfaz grafica tipo pixel-art** (estilo juego de gestion/simulacion) donde el CEO
  puede observar a los agentes "trabajando" en tiempo real dentro de una oficina virtual.

## Casos de prueba disponibles (inputs historicos del CEO)

1. **Rbot** — Robot virtual 3D controlado por UDP (Java3D, 2007). https://github.com/vdiquez/Rbot
2. **Patrones de radiacion** — proyecto de telecomunicaciones (pendiente de compartir repo).
3. **Satelites** — proyecto de simulacion satelital (pendiente de compartir repo).

Cada uno es candidato a convertirse en un "producto" construido/modernizado por la fabrica, sirviendo
de evidencia empirica para la heuristica del profesor.

## Estructura de este repositorio

```
virtual-labs-factory/
  README.md                       <- este archivo
  HEURISTICA.md                   <- mapeo explicito heuristica del profesor -> decisiones de la fabrica
  docs/
    01-red-agentica.md             <- arquitectura de agentes, roles, jerarquia, protocolos
    02-dashboard-pixel-art.md      <- diseno tecnico de la interfaz CEO
    03-roadmap.md                  <- fases y entregables semanales (incluye Fase 6: operacion/mantenimiento)
    04-impacto-educativo.md        <- tesis de impacto en universidades / plataforma educativa IA
    05-casos-de-prueba.md          <- ficha por cada laboratorio candidato (Rbot, radiacion, satelites)
    06-investigacion-mercado.md    <- mercado EdTech, competidores, tendencias de agentes
    07-ai-native-stack.md          <- SDD, ADR, skills, harness, EDD/PDD, Loop Engineering, mods, riesgos
    08-validacion-curso-claude.md  <- comparacion contra el "AI-Native SDLC Playbook" de Claude Academy
    09-sensores-auditoria.md       <- capa de sensores/metricas para auditoria y futuro aprendizaje automatico
  skills/                          <- conocimiento procedural reutilizable entre sesiones (formato Hermes)
  reports/
    semana-NN.md                   <- informe semanal generado por el agente Reportero para el CEO
  agents/                          <- (fase posterior) configuracion/prompts de cada agente
```

## Vocabulario clave (evitar confusion de acronimos)

- **SDD** = Spec-Driven Development (como se especifica antes de construir).
- **EDD** = Evaluation-Driven Development (como se evalua la mejora de los AGENTES mismos).
- **PDD** = Pedagogy-Driven Development (como se valida que un LABORATORIO ensena correctamente —
  metodologia propia de esta fabrica, no existe en la industria general).
- Ver `docs/07-ai-native-stack.md` seccion 10 para el detalle completo de esta distincion.

## Estado actual

Fase 0: planificacion y diseno de la red agentica + stack AI-Native + capa de sensores. Sin agentes
desplegados todavia en produccion.

Ver `docs/03-roadmap.md` para las fases siguientes.
