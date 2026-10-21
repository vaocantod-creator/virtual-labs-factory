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
   Phaser para el dashboard por velocidad de iteracion, etc.)

## Evidencia que la fabrica debe producir por cada laboratorio

- [ ] Especificacion inicial (Arquitecto Heuristico) mapeada a los 4 ejes.
- [ ] Registro de decisiones tecnicas y su justificacion.
- [ ] Informe de QA Pedagogico (no solo QA tecnico).
- [ ] Reflexion post-mortem: que parte del metodo se reutilizo de laboratorios anteriores y que
      tuvo que adaptarse (esto es lo que prueba — o refuta — que la heuristica generaliza).

## Pendiente de co-diseñar con el profesor (Fase 0)

- Terminologia exacta que usa su documento doctoral, para no inventar nombres distintos a los suyos.
- Criterios de evaluacion formal que el espera usar para "validar" la heuristica (cualitativos,
  cuantitativos, estudio de caso, etc.) — esto determina que metricas debe capturar el QA Pedagogico.
- Si la heuristica distingue entre "agentes en la construccion del lab" y "agentes dentro del lab ya
  construido (tutores IA para el estudiante)" como dos capas separadas, o las trata como una sola.
