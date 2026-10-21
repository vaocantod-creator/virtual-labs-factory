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
| **PDD** (Pedagogy-Driven Development — definicion propia de la fabrica; ver seccion 10 sobre por que no se llama EDD) | Antes de dar por completo un laboratorio, se ejecuta la "rubrica pedagogica ejecutable" (seccion 2): el lab debe demostrar que cumple sus criterios de aprendizaje declarados, igual que un test demuestra que el codigo cumple su contrato | QA Pedagogico |
| **Sensores para auditoria/aprendizaje automatico** | Instrumentacion que registra: tiempo por tarea, tasa de retrabajo, decisiones ADR generadas, resultados de "garbage collection" periodico — alimenta la metrica de autonomia (`HEURISTICA.md`) y permite que el Agente Director ajuste prioridades con datos reales, no solo intuicion | Reportero (recoleccion), Director (consumo) |
| **Loops** | Ciclo semanal fijo (roadmap) + loop de "garbage collection" periodico (harness) + loop RED-GREEN-REFACTOR dentro de TDD para el Ingeniero | Director (ciclo semanal), Ingeniero (TDD) |
| **Hooks** | Puntos de verificacion automaticos no opcionales: hook pre-merge (constitution + ADR requerido si hay decision arquitectonica), hook post-implementacion (QA Pedagogico corre antes de marcar "listo"), hook de entorno (devcontainer debe buildear limpio antes de reportar) | Harness (mecanico, no humano) |

## 9. Decisiones pendientes de validar con el profesor (anadir a Fase 0)

- Si la "rubrica pedagogica ejecutable" (EDD) debe disenarse junto con el, dado que es el puente
  mas directo entre esta investigacion y su heuristica doctoral.
- Si el concepto de "constitution" por laboratorio debe reflejar explicitamente los 4 ejes de su
  heuristica (didactico/sistemico/3D/agentes) como secciones fijas, no solo reglas tecnicas sueltas.


## 10. Desambiguacion de acronimos: EDD (Evaluation) vs. metodologia pedagogica propia

> Actualizado tras investigacion adicional sobre "Evaluation-Driven Development" y "Loop
> Engineering" (ver fuentes abajo).

**Problema detectado:** "EDD" ya es un termino consolidado en la industria desde 2024-2025 como
**Evaluation-Driven Development** — la practica de escribir el *eval* (criterio de evaluacion,
dataset, metrica, guard) ANTES de tocar un prompt/modelo/agente, aplicando la logica de TDD
(red-then-green) a sistemas no deterministicos. Esta en uso activo en MLflow, LangChain, y
formalizado academicamente como "EDDOps" (arXiv 2411.13768). Reutilizar "EDD" para nuestra
metodologia de validacion pedagogica (lo que antes llamamos "Education-Driven Development" en la
seccion 8) crearia una colision de acronimo dentro de nuestros propios documentos.

**Decision: renombrar.** La metodologia pedagogica propia de la fabrica pasa a llamarse
**PDD — Pedagogy-Driven Development**. El acronimo **EDD queda reservado para su significado
estandar de la industria: Evaluation-Driven Development**, y se adopta formalmente como metodologia
propia (ver mas abajo), distinta mas complementaria de PDD.

### EDD (Evaluation-Driven Development) — adoptada, con significado estandar de industria

Fuentes: paper EDDOps (arXiv 2411.13768), testmuai.com, engineersofai.com, MLflow docs, LangChain
blog (caso Dosu).

Principio: **el eval se escribe antes del cambio**, debe fallar en el sistema actual (si ya pasa, el
eval no describe el cambio), y el cambio solo se acepta si el eval mejora sin romper "guard metrics"
(metricas que no pueden empeorar, ej. latencia, costo, tasa de rechazo). Ciclo:

```
Escribir eval spec -> correrlo en el sistema actual (debe fallar) -> registrar baseline
  -> hacer el cambio minimo -> re-correr mismo eval/mismo juez -> comparar por segmento
  -> aceptar o bloquear segun la regla -> promover el caso a regresion permanente
```

**Aplicacion en la fabrica:** EDD aplica a los **agentes de IA mismos** (no al laboratorio 3D como
producto educativo) — es decir, a como medimos si el Arquitecto Heuristico, el Agente 3D o el
Ingeniero mejoran o empeoran con cada ajuste de su prompt/skill/modelo. Ejemplo: antes de ajustar el
skill `modernizar-java3d-legacy`, se escribe un eval ("dado este fragmento de escena Java3D, el
agente debe producir un mapeo correcto a Three.js en al menos 8/10 casos de prueba curados") que
debe fallar con el skill actual; el ajuste al skill solo se acepta si el eval mejora sin que empeore
el guard metric de costo/tiempo por tarea. Responsable: el **Director**, porque es quien ajusta y
mantiene los skills/prompts de los demas agentes.

### PDD (Pedagogy-Driven Development) — renombrada, significado propio de la fabrica

Es la metodologia que en la seccion 8 llamabamos "EDD (Education/Evaluation-Driven Development)".
Se mantiene identica en su definicion operativa, solo cambia el nombre para evitar la colision:

> Antes de dar un laboratorio por completo, el QA Pedagogico ejecuta una "rubrica pedagogica
> ejecutable" — equivalente a un test suite, pero que verifica que el estudiante puede
> observar/manipular correctamente el fenomeno declarado en la spec, no que el codigo compile.

**Diferencia clave entre EDD y PDD en la fabrica:**

| | EDD (Evaluation-Driven Development) | PDD (Pedagogy-Driven Development) |
|---|---|---|
| Que se evalua | La calidad del trabajo de los AGENTES de la fabrica (prompts/skills) | La calidad del LABORATORIO VIRTUAL como producto educativo |
| Quien lo ejecuta | Director (sobre sus propios agentes) | QA Pedagogico (sobre el output final) |
| Analogo de industria | TDD aplicado a sistemas LLM (EDDOps) | No existe equivalente en la industria — aporte original de la fabrica |
| Cuando corre | Cada vez que se ajusta un skill/prompt de un rol | Cada vez que un laboratorio llega a un milestone/entrega |

Ambas metodologias son complementarias, no sustitutas: EDD certifica que *los agentes mejoran*; PDD
certifica que *el laboratorio ensena*. Un agente puede pasar su EDD (genera codigo 3D correcto segun
su eval tecnico) y aun asi el laboratorio resultante puede fallar su PDD (el estudiante no entiende
el fenomeno) — por eso se necesitan las dos, no una sola.

## 11. Loop Engineering — adoptado como capa formal sobre Harness Engineering

Fuentes: Addy Osmani (junio 2026, ensayo fundacional "loop engineering"), kilo.ai, makefun.ai,
estudio exploratorio arXiv 2608.21884 (mineria de 36,710 repos confirmando adopcion real del
patron), arXiv 2610.15093 (TurnCost, formalizacion tecnica del termino).

### Jerarquia de abstraccion de la industria (2022-2026), ahora completa

| Era | Paradigma | Unidad de trabajo |
|---|---|---|
| 2022-2023 | Prompt Engineering | El prompt |
| 2024 | Agentic Workflows | La cadena de pasos |
| 2025 | Harness Engineering (ver seccion 5) | El harness (restricciones alrededor del modelo) |
| 2026 | **Loop Engineering** | El loop (ciclo iterativo que invoca al harness repetidamente) |

**Definicion operativa (consolidada de las fuentes):** Loop Engineering es la practica de disenar
**el sistema que invoca al agente repetidamente**, en vez de que un humano prompte paso a paso. Un
loop bien disenado tiene: trigger (horario o evento), condicion de parada verificable por maquina
(no por el mismo modelo que hizo el trabajo), estado persistente fuera de la conversacion, un
verificador separado del implementador (principio maker/checker), presupuesto de costo/tiempo, y un
punto definido de escalamiento a humano.

### Loops concretos ya existentes en el diseno de la fabrica (ahora formalizados con este marco)

| Loop | Trigger | Condicion de parada | Verificador | Estado persistido |
|---|---|---|---|---|
| **Cadencia semanal** (roadmap) | Cron semanal (lunes) | Backlog de la semana resuelto o escalado al CEO | El Director revisa contra `factory-state.json` | `factory-state.json` + reportes semanales |
| **TDD** (Ingeniero) | Nueva tarea de codigo en ruta critica | Test pasa + `./gradlew check` limpio | Suite de tests (no el mismo agente que escribio el codigo) | Commit + test suite en el repo |
| **EDD** (Director sobre sus agentes) | Ajuste de skill/prompt de un rol | Eval mejora sin romper guard metrics | Dataset de eval curado, juez separado | Regresion de evals versionada |
| **PDD** (QA Pedagogico) | Laboratorio llega a milestone | Rubrica pedagogica aprobada | QA Pedagogico (rol separado de quien construyo) | Informe de validacion en el repo |
| **Garbage collection** (harness, seccion 5) | Periodico (ej. semanal, antes del reporte) | Sin inconsistencias spec-codigo detectadas | QA Pedagogico o Reportero | ADRs + issues abiertos si hay drift |
| **Integracion/merge** (mitigacion de riesgo "Gas Town", seccion 7) | Cualquier PR de un agente especializado | Merge aprobado por el Director | Director (rol integrador fijo, nunca el agente que escribio el codigo) | Historial git |

**Implicacion de diseno:** la fabrica ya tenia estos loops disenados de forma dispersa en
`docs/01-red-agentica.md`, `docs/03-roadmap.md` y la seccion 7 de este documento. Loop Engineering
los unifica bajo un mismo vocabulario y una misma checklist de calidad (trigger + parada verificable
+ verificador separado + estado persistente + presupuesto + escalamiento) — cualquier loop nuevo que
se anada a la fabrica en el futuro debe poder completar esos 6 campos antes de implementarse.

**Advertencia adoptada (de Osmani, citada en las fuentes):** *"Dos personas pueden construir el
mismo loop y obtener resultados opuestos. Una lo usa para avanzar mas rapido en trabajo que entiende
a profundidad. La otra lo usa para evitar entender el trabajo. El loop no sabe la diferencia. Tu
si."* — Esto refuerza que el CEO (Victor) debe seguir revisando semanalmente el contenido real de lo
producido, no solo confirmar que "los loops corrieron sin error".

## 12. Donde se define el stack tecnico — NO en la constitution

Pregunta explicita del CEO: *"En la etapa de constitution vamos a definir el stack para esta
implementacion?"* Respuesta, siguiendo la separacion de responsabilidades ya adoptada de Bockeler/
Fowler y GitHub Spec Kit (seccion 1):

**No.** La constitution define **principios y restricciones inmutables**, no la seleccion de stack.
La seleccion de stack (que motor 3D, que lenguaje, que libreria de fisica) ocurre en la fase de
**plan**, a cargo del Arquitecto Heuristico, justificada mediante **ADRs** (seccion 1) — exactamente
la separacion que ya establecimos: *"la spec no debe mencionar stack tecnico"*.

**Matiz para Rbot (legado):** la constitution de Rbot SI puede fijar restricciones tecnicas, pero
como **invariantes a preservar**, no como eleccion de stack nueva. Ejemplo correcto para la
constitution de Rbot:

```
## Eje Sistemico (reglas inmutables)
- El protocolo UDP de control (puertos 5555/8080, comandos de una letra a-j) no se reemplaza
  sin ADR aprobado por el Director — es un invariante del sistema original, no una eleccion
  tecnica nueva a debatir en cada tarea.
```

Esto es distinto a decidir "usamos Three.js vs Babylon.js" — esa decision es tecnica y nueva, le
corresponde al **plan + ADR del Arquitecto Heuristico**, no a la constitution.

**Para laboratorios nuevos (radiacion, satelites):** el stack se decide explicitamente en la
primera iteracion de Fase 1/3 del roadmap, usando el skill `escribir-spec-heuristica-didactico-
sistemica-3d` (seccion 3) como paso previo de "grilling" (preguntar objetivo pedagogico, nivel,
restricciones de hardware del estudiante tipico) — y la decision final de stack queda registrada
como **ADR-0001-seleccion-de-stack** en `docs/decisions/` de ese repo especifico, no en la
constitution ni en este documento central.
