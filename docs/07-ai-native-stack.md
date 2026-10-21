# Stack AI-Native de la Fabrica

Sintesis de la investigacion de 24 recursos externos (SDD/ADR, skills reutilizables, orquestacion
multi-agente, registro de specs, pensamiento de la industria sobre ingenieria asistida por IA, y
riesgos documentados de autonomia agentica), con decisiones concretas para Virtual Labs Factory.

## 1. Spec-Driven Development (SDD) — decision adoptada

Fuentes: GitHub Spec Kit, MADR, articulo de Bockeler/Fowler sobre los 3 niveles de SDD, Dev
Container Spec.

### Marco de 3 niveles (Bockeler/Fowler) — aplicado por tipo de laboratorio

| Nivel | Definicion | Cuando lo usamos |
|---|---|---|
| Spec-first | La spec guia la generacion inicial y luego se descarta | Cambios triviales (ajustar textura, copy de UI) — NO requieren el ritual completo |
| Spec-anchored | La spec se mantiene viva como referencia de evolucion | **Laboratorios nuevos** (greenfield: radiacion, satelites) |
| Spec-as-source | La spec es la fuente de verdad permanente; el codigo se regenera | Reservado como aspiracion futura, no exigible aun |

**Decision:** laboratorios nuevos operan en **spec-anchored**. Rbot (legado) opera en un regimen
especial: antes de modernizar, el Arquitecto Heuristico debe producir una spec de **comportamiento
observado actual** (reverse-engineering), no una spec aspiracional — porque el comportamiento real
de 2007 nunca quedo documentado y modernizar sin esto arriesga perder invariantes educativos que
nadie registro.

### Constitucion por laboratorio (adoptado de spec-kit)

Cada repo de laboratorio tiene su propio `constitution.md`: reglas inmutables que todo agente
ejecutor (Claude Code/Codex) debe respetar sin excepcion. Ejemplo para Rbot:

```
- Ninguna refactorizacion de la escena 3D se mergea sin verificacion visual lado a lado
  (legado vs. nuevo) aprobada por QA Pedagogico.
- Ningun cambio en el protocolo UDP de control se acepta sin test de regresion de latencia.
- El contenido pedagogico (que puede manipular el estudiante, que feedback recibe) no se
  modifica sin aprobacion explicita del QA Pedagogico.
```

### ADRs (MADR) como memoria institucional entre agentes

Carpeta `docs/decisions/NNNN-titulo.md` en cada repo de laboratorio. El Arquitecto Heuristico la
alimenta cada vez que toma una decision con impacto arquitectonico o pedagogico (ej. "Three.js vs
Babylon.js", "representar campo de radiacion con shader vs malla de particulas"). Resuelve el
problema concreto de la fabrica: **multiples laboratorios tocados por distintos agentes en distintos
momentos, sin memoria humana continua** — sin ADRs, un agente que retome el repo de satelites en 6
meses no sabe por que se eligio esa arquitectura.

### Dev Container Spec como contrato de entorno reproducible

Cada laboratorio-repo debe incluir un `devcontainer.json` valido, mantenido por el Ingeniero, como
entregable obligatorio (no opcional) antes de considerarse "listo". Da paridad de entorno entre
agentes que lo desarrollan y el QA que lo valida, y permite un **catalogo de "Features" propias de
la fabrica** (ej. `java3d-legacy-runtime`, `threejs-webgl-testing`) reutilizables entre laboratorios.

### Flujo integrado por laboratorio

```
constitution (1 vez) -> spec (Director+Arquitecto) -> plan+contracts+ADRs (Arquitecto)
  -> devcontainer (Ingeniero) -> tasks -> implement (Ingeniero/Agente 3D)
  -> QA Pedagogico valida CONTRA LA SPEC, no contra tests tecnicos
  -> analyze/converge (detecta drift spec-codigo) -> Reportero documenta
```

El gate diferenciador de este dominio frente a cualquier SDD generico: **QA Pedagogico valida
contra la spec pedagogica** (¿el estudiante puede observar el fenomeno X correctamente?), algo que
ningun framework de SDD generico cubre — debe disenarse a medida (ver seccion EDD mas abajo).

## 2. Registro de Specs (Tessl) — adoptar el patron, no la plataforma

Decision: **no adoptar Tessl literalmente** por ahora (es para specs de software con tests de
conformidad ejecutables; nuestras specs mezclan requisitos pedagogicos no siempre automatizables).
Si adoptamos su **patron**:

- Spec versionada y testeable como artefacto de primera clase, con registro propio (self-hosted o
  carpeta `specs/` versionada en el repo `virtual-labs-factory`) en vez de una plataforma externa.
- Extension propia: "rubrica pedagogica ejecutable" ademas del conformance test tecnico — el QA
  Pedagogico corre esa rubrica como un "eval", aunque no sea un test de codigo puro.
- Reuso futuro entre laboratorios (ej. un lab de Optica y uno de Circuitos comparten specs base de
  interaccion 3D o rubrica de evaluacion) y entre universidades, cuando el modelo escale (Fase 5 del
  roadmap / Nivel 2-3 de `04-impacto-educativo.md`).
- Publicar publicamente SOLO specs genericas reutilizables (patrones de interaccion 3D) — nunca
  specs atadas al curriculo especifico de una universidad, por ahora.

## 3. Sistema de Skills — estandar adoptado: convencion Hermes, con ideas de superpowers/mattpocock

Se evaluaron 3 sistemas de skills (obra/superpowers, mattpocock/skills, Hermes nativo). Decision:
**usar el formato Hermes** (el framework orquestador de la fabrica), porque ya tiene disciplina de
costo de contexto (descripcion <=60 caracteres pagada cada turno, cuerpo cargado solo bajo demanda) y
prohibe skills-router — pero se incorporan 2 ideas fuertes de los otros sistemas:

- **De superpowers:** la "ley dura" no negociable en vez de sugerencia blanda (ej. "NO SE MERGEA
  CODIGO SIN TEST DE REGRESION VISUAL" en vez de "se recomienda verificar visualmente").
- **De mattpocock:** glosario compartido como artefacto de primera clase (`references/glosario.md`)
  — terminos como "andamiaje", "retroalimentacion inmediata", "grado de libertad manipulable" deben
  tener definicion unica, referenciada por todos los roles, para evitar que Arquitecto/Ingeniero/QA
  usen vocabulario distinto para lo mismo.

### Skills propuestas para la fabrica (a crear cuando se inicie Fase 1)

1. **`modernizar-java3d-legacy`** (Agente 3D/Ingeniero): inventariar grafo de escena legado -> mapear
   a stack destino -> portar geometria estatica -> verificar paridad visual -> portar interaccion
   test-first -> checklist de paridad pedagogica.
2. **`escribir-spec-heuristica-didactico-sistemica-3d`** (Arquitecto Heuristico): "grilling" previo
   (preguntar objetivo de aprendizaje, nivel, errores conceptuales a prevenir) antes de escribir la
   spec; plantilla fija (Objetivo pedagogico -> Modelo sistemico -> Heuristicas 3D -> Criterios de
   exito medibles); gate de aprobacion del Director antes de pasar a implementacion.
3. **`qa-pedagogico-laboratorio`** (QA Pedagogico): checklist de fidelidad al modelo sistemico de la
   spec + pruebas de "camino del estudiante" (acciones esperadas vs. errores comunes, el lab debe
   dar feedback correctivo, no solo bloquear) + evidencia visual por criterio.
4. **`vocabulario-fabrica-labs`** (base, referenciada por todas): glosario unico compartido.

## 4. Orquestacion multi-agente — Hermes ya cubre lo esencial

Se evaluaron 3 proyectos (caveman, rowboat, ecc) como posibles bases de orquestacion. Ninguno
resulto ser un framework de jerarquia de roles sobre multiples repos — son herramientas
complementarias (optimizacion de tokens, asistente personal con "Spaces", mejora de harness
individual). **Decision: Hermes sigue siendo el orquestador** (ya cubre `delegate_task` paralelo,
cron, memoria vía skills). Unica idea a tomar prestada de rowboat: el concepto de **"Space"/pizarra
compartida** como mecanismo de comunicacion Director<->roles — ya lo teniamos disenado como
`factory-state.json` (ver `docs/01-red-agentica.md`), asi que esto confirma el diseno existente en
vez de cambiarlo.

## 5. Harness Engineering (Bockeler) — adoptado como principio estructural

"Harness" = el conjunto de tooling/practicas que mantiene a los agentes en linea, restringiendo el
espacio de soluciones en vez de confiar en que generen codigo correcto "porque si". 3 componentes
adoptados:

1. **Context engineering**: cada agente tiene acceso curado al estado real del repo (mapas de
   arquitectura del simulador legado, convenciones vigentes) — no solo instrucciones sueltas.
2. **Architectural constraints deterministas**: linters + structural tests que bloqueen que el
   Agente 3D o Ingeniero rompan contratos entre agentes, sin depender de que el Director "revise y
   lo note" — la restriccion es mecanica, no solo supervision.
3. **"Garbage collection" periodico**: un paso recurrente (QA Pedagogico o Reportero) que detecta
   inconsistencias entre spec pedagogica y codigo generado, documentacion desactualizada,
   violaciones arquitectonicas — combate la entropia que se acumula con multiples agentes operando
   sobre el mismo repo a lo largo de meses.

## 6. Matriz de riesgo para decidir "vibe coding" vs. especificacion formal (Bockeler)

Adoptada explicitamente como politica operativa de la fabrica — no es opcional, se aplica a cada
tarea que un agente ejecuta:

| Agente/Tarea | Probabilidad error | Impacto | Detectabilidad | Regimen |
|---|---|---|---|---|
| Agente 3D: geometria/shaders de prototipo | media | baja (iterable) | alta (feedback visual) | Vibe coding permitido, revision visual post-hoc |
| Ingeniero: logica core del simulador legado (fisica/calculos) | alta (legado sin tests) | alta (rompe simulacion) | baja (sin red de seguridad) | **Spec formal obligatoria + tests de caracterizacion ANTES de codigo** |
| QA Pedagogico: validacion de criterios de aprendizaje | media | alta (afecta validez educativa) | media | Spec + checklist determinista, no solo juicio del LLM |
| Arquitecto Heuristico: estructura de modulos nuevos (greenfield) | baja-media | media | alta (se revisa en diseno) | Vibe coding para explorar opciones; decision final requiere aprobacion del Director |
| Reportero: documentacion/reportes | baja | baja | alta | Vibe coding libre |

**Regla operativa unica (memorizable):** *"Si el cambio toca rutas criticas del simulador legado
(fisica, persistencia de estado, interfaces entre agentes) O no existe una red de seguridad
(tests/tipos) que detecte un error -> especificacion formal + harness ANTES de escribir codigo. Si
es exploracion, UI, prototipo visual o documentacion -> vibe coding con revision ligera posterior."*

## 7. Riesgos documentados de autonomia agentica a escala — mitigaciones adoptadas

De la investigacion sobre MAKER (paper arXiv), "Revenge of the Junior Developer" (Sourcegraph/Yegge)
y "Welcome to Gas Town" (Yegge):

| Riesgo documentado | Mitigacion adoptada en la fabrica |
|---|---|
| Error acumulado en cadenas largas sin descomposicion (MAKER: Hanoi se descarrila tras cientos de pasos) | Tareas de agente **granulares con criterio de aceptacion explicito**; verificacion cruzada (un segundo agente o el Director revisa el output antes de avanzar) en vez de un pase largo sin checkpoints |
| Cuello de botella caotico en merges con multiples agentes en paralelo ("monkey knife fight", Gas Town) | El **Agente Director actua como integrador/serializador de merges** — ningun agente especializado mergea directo a main sin pasar por el Director |
| Agentes que se "quedan atascados" esperando input en vez de seguir trabajando (demasiado "educados") | Mecanismo de **heartbeat/nudge**: el Director revisa periodicamente (via cron) si un agente delegado quedo esperando input y lo reactiva o escala al CEO |
| Perdida de contexto/estado al reiniciar sesion de un agente | Estado persistido **fuera de la sesion** en `factory-state.json` + ADRs + specs versionadas en git — cualquier agente puede retomar donde otro quedo |
| Complejidad y costo operativo subestimados ("no uses esto si no vas a manejar 5+ agentes a diario") | El roadmap escala **secuencialmente** (1 laboratorio en Fase 1, no 3 en paralelo desde el inicio) — se valida el modelo con Rbot antes de anadir carga |
| Confundir "mas agentes" con "mas calidad" | La calidad la certifica explicitamente el **QA Pedagogico**, no el numero de agentes activos; mas agentes en paralelo = mas superficie de error, no menos |
| Llamar "fabrica autonoma" a algo que en realidad es un solo modelo con interfaz de chat (guia KireBot) | La red de 6 roles + `factory-state.json` + specs/ADRs queda **documentada con precision** (que agente hace que, como se coordinan, que pasa si uno falla) — no basta con "tener agentes corriendo" para llamarlo fabrica |

## 8. Metodologias — mapeo final a la red de agentes

| Metodologia | Definicion operativa en la fabrica | Responsable principal |
|---|---|---|
| **TDD** (Test-Driven Development) | Para codigo tecnico de alto riesgo (logica core del simulador): test de caracterizacion antes de modernizar, test nuevo antes de feature nueva | Ingeniero de Laboratorio |
| **SDD** (Spec-Driven Development) | Spec-anchored para labs nuevos, spec de comportamiento-observado para legado; constitution + spec + plan + ADRs antes de implementar | Arquitecto Heuristico (autor), todos (consumidores) |
| **EDD** (Education/Evaluation-Driven Development — definicion propia de la fabrica) | Antes de dar por completo un laboratorio, se ejecuta la "rubrica pedagogica ejecutable" (seccion 2): el lab debe demostrar que cumple sus criterios de aprendizaje declarados, igual que un test demuestra que el codigo cumple su contrato | QA Pedagogico |
| **Sensores para auditoria/aprendizaje automatico** | Instrumentacion que registra: tiempo por tarea, tasa de retrabajo, decisiones ADR generadas, resultados de "garbage collection" periodico — alimenta la metrica de autonomia (`HEURISTICA.md`) y permite que el Agente Director ajuste prioridades con datos reales, no solo intuicion | Reportero (recoleccion), Director (consumo) |
| **Loops** | Ciclo semanal fijo (roadmap) + loop de "garbage collection" periodico (harness) + loop RED-GREEN-REFACTOR dentro de TDD para el Ingeniero | Director (ciclo semanal), Ingeniero (TDD) |
| **Hooks** | Puntos de verificacion automaticos no opcionales: hook pre-merge (constitution + ADR requerido si hay decision arquitectonica), hook post-implementacion (QA Pedagogico corre antes de marcar "listo"), hook de entorno (devcontainer debe buildear limpio antes de reportar) | Harness (mecanico, no humano) |

## 9. Decisiones pendientes de validar con el profesor (anadir a Fase 0)

- Si la "rubrica pedagogica ejecutable" (EDD) debe disenarse junto con el, dado que es el puente
  mas directo entre esta investigacion y su heuristica doctoral.
- Si el concepto de "constitution" por laboratorio debe reflejar explicitamente los 4 ejes de su
  heuristica (didactico/sistemico/3D/agentes) como secciones fijas, no solo reglas tecnicas sueltas.
