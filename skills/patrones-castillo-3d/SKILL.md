---
name: patrones-castillo-3d
description: "Use when disenando un lab 3D. Metodo del prof. Castillo."
version: 0.1.0
---

# Patrones Castillo 3D (metodo de programacion sistemica)

Fuente: Melo Q., Castillo R. et al., ICAETT 2022, LNNS 619, pp. 483-496 (ver
`docs/10-insumo-articulo-castillo.md`). Estado: **borrador v0.1**. Los patrones se describen en el
articulo solo a nivel de nombre y funcion; el detalle completo sera publicado por el profesor en un
articulo futuro. Todo lo marcado [A CONFIRMAR] debe validarse con el, no inventarse.

## Cuando usar
- Arquitecto Heuristico: al escribir spec/plan de un lab (instrumento, equipo o sistema).
- Agente 3D / Ingeniero: al estructurar o portar codigo de escena (incluye Rbot, Sateliton, etc.).
- QA Pedagogico: al auditar fidelidad al equipo real (ver `references/fidelidad-y-validacion.md`).

## Ley dura
1. **Todo lab es un sistema con subsistemas independientes.** Subsistemas minimos del articulo:
   iluminacion, visualizacion, mobiliario, gestion de equipos. **Cada equipo es a su vez un
   subsistema**, desarrollado y probado solo antes de integrarse.
2. **Diseno top-down, implementacion bottom-up.** Se especifica de lo conceptual al detalle; se
   construye de los objetos pequenos hacia la integracion.
3. **Cada subsistema sigue los 7 pasos** (abajo) y NO se codifica sin su grafo de escena.
4. **Orden estrategico de construccion**: de lo basico a lo sofisticado, para que cada equipo aporte a
   la Component Library que usara el siguiente. Registrar lo aportado en `component-library.md` del lab.
5. **Diseno propio**: sin replicar marcas comerciales; incluir los controles necesarios para el
   manejo basico.

## Los 7 pasos de diseno por subsistema
1. Escenarios de cada situacion usuario-sistema.
2. Diagramas de casos de uso.
3. Diagramas de clases.
4. Diagramas de comunicacion (de ahi salen los metodos de cada clase).
5. Diagramas de estado (donde haya cambios de estado).
6. **Grafos de escena** (articulacion, independencia y movilidad de los elementos graficos).
7. Codificacion de los elementos graficos a partir del grafo de escena.
Complemento declarado: patron **MVC**. Herramienta del articulo: UML con IBM Rational Rose; en la
fabrica se reemplaza por UML en texto (PlantUML/Mermaid) conservando los mismos diagramas.

## Patrones (nombre y funcion segun el articulo)
- **Object Mobility**: da a los elementos del lab la propiedad de poder moverse.
- **Event Controller**: junto con Object Mobility, gestiona todos los objetos del sistema.
- **Graphic Element Builder**: clase abstracta `Graphic Element Handler` con 5 metodos abstractos:
  crear objetos, ajustar capacidades, articular elementos, ajustes iniciales, ajustes finales.
  Los ajustes por defecto van en el constructor; los ajustes iniciales comunes, en el metodo de
  ajustes iniciales.
Detalle de firmas y ejemplos: `references/patrones.md`.

## Independencia de lenguaje
Los patrones son OO + eventos. En Java3D se implementan tal cual; en otro stack (decidido por ADR,
ver `docs/07` seccion 12) se **portan** a su equivalente (p. ej. grafo de escena Three.js) sin
cambiar responsabilidades. Registrar el mapeo en el ADR.

## Component Library
Reusable entre labs: perillas (rotativas/deslizantes), botones multifuncion, displays graficos,
cursores, clases abstractas (`Graphic Objects`, `Telecom Equipment`), modulos FFT (previstos para
analizador de espectro). Meta: % de reutilizacion (sensor `lab.component_reuse_pct`, docs/09).

## Validacion del modelo matematico
El articulo valida las formulas (senales, modulaciones) con hojas de calculo y graficas antes de
codificar. La fabrica lo convierte en test automatizado de salida numerica (ver referencias).

## Pitfalls
- No presentar los patrones como completos: el profesor aun no publica su especificacion detallada.
- No elegir stack aqui: eso va en el plan + ADR, no en la constitution.
