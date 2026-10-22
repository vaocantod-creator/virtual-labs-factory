# Constitution — Rbot (Robot Virtual Controlado a Distancia)

> Estado: PROPUESTA, pendiente de revision del CEO. Basada en la plantilla `templates/constitution.md`.
> Principios inmutables e invariantes del sistema original. **No selecciona stack nuevo**: eso lo hace
> `docs/lab-rbot/decisions/0001-seleccion-de-stack.md`. Rbot es un laboratorio legado: esta constitution
> PUEDE fijar invariantes existentes (docs/07, seccion 12).
> Fuente de los hechos: repo `vdiquez/Rbot` (clon de oct 2026).

## Eje Didactico (reglas inmutables)
- El estudiante opera un robot remoto a traves de un **Centro de Mando** y observa el resultado en un
  **Entorno Experimental** separado; esa separacion operador/entorno es parte de la experiencia. 
- La vista del Centro de Mando debe permanecer **sincronizada** con el Entorno (el Entorno retransmite
  cada comando ejecutado).
- [A CONFIRMAR con Victor, autor de la tesis] Objetivo de aprendizaje, nivel y errores conceptuales a
  prevenir: el repo no los documenta. No se inventan hasta que se confirmen.

## Eje Sistemico (reglas inmutables)
- Arquitectura de dos extremos que se comunican por **UDP**: Centro de Mando recibe en el puerto **8080**,
  Entorno Experimental en **5555**. El protocolo UDP **no se reemplaza sin un ADR aprobado**.
- El protocolo es de **10 comandos de una letra, `a`..`j`**, con esta semantica (enum `Command`):
  `a`/`b` camara vertical arriba/abajo; `c`/`d` azimut izquierda/derecha; `e`/`f` elevacion arriba/abajo;
  `g`/`h` avanzar/retroceder; `i`/`j` girar derecha/izquierda. Un comando desconocido se rechaza y se registra.
- El estado de la camara se **acumula** por paso fijo (vertical 0,1; azimut y elevacion 2): ese
  comportamiento es parte del sistema original y debe conservarse hasta que un ADR lo cambie.
- El movimiento es **cinematico**, sin motor de fisica; el desplazamiento del robot se expresa por pasos
  discretos de orugas/ruedas (15 posiciones de rueda, 24 grados por paso).
- Host y puertos por defecto estan **centralizados en un unico lugar** (`RbotRuntimeConfig`): 0.0.0.0
  local, 127.0.0.1 destino. Los errores de IP/puerto deben ser visibles, nunca silenciosos.

## Eje 3D (reglas inmutables)
- El robot esta compuesto por piezas modeladas (19 archivos `.3ds`): cuerpo, orugas (eslabones y
  ruedas), estructura de camara con cremallera, engranajes y camara. La **fidelidad visual y la
  articulacion de esas piezas** se preserva; no se simplifican sin un ADR.
- Hay **multiples vistas** del entorno (primera persona, isometrica, superior); la migracion no
  elimina vistas.
- Los recursos 3D se resuelven por una capa comun (`AssetResolver`), no por rutas sueltas.

## Eje Agentes (reglas inmutables — constructores vs. operadores)
- Constructores: los agentes de la fabrica modernizan Rbot siguiendo el Definition of Done del repo:
  implementar -> validar -> `./gradlew check` -> commit -> push. Un cambio no se da por terminado sin
  `check` en verde (hoy: 50 tests, Quality Gate de Sonar OK).
- Operadores (dentro del laboratorio): no hay agentes de IA operando en Rbot hoy. Agregarlos requiere
  una especificacion y un ADR; no se asume.
- Cambios de logica core (protocolo, cinematica) pasan por ADR aprobado antes de merge.

## Metodo Castillo — programacion sistemica
> Rbot nacio tutorado por el profesor Castillo y es Java3D: el mismo patron deberia verse en el codigo.
- Subsistemas independientes: Centro de Mando, Entorno Experimental, escena virtual, comunicaciones,
  configuracion. Cada uno es probable de forma aislada.
- Todo elemento grafico se construye por pasos separados (crear, ajustar capacidades, articular,
  ajustes finales). Verificado: el codigo de Rbot **no** usa los 5 metodos del patron (ninguna clase define
  `ajustesIniciales`, `crearElementos`, `ajustarCapacidades`, `articularElementos` ni `ajustesFinales`); sus
  clases (`Cuerpo`, `EstructuraCamara`, `WheelMovement`...) extienden `BranchGroup` directamente y no
  heredan de una clase base de 5 metodos; es un hallazgo, no un incumplimiento: Rbot (2007) es anterior al metodo.
- Componentes reutilizables (rueda parametrica, eslabon, engranaje) se registran en la Component
  Library del lab.
- Test de comportamiento dorado: secuencia de comandos -> estado de transformaciones (ver especificacion).

## Reglas de calidad (heredadas del repo)
- Sin comparaciones de `String` con `==`, sin `catch` vacios, sin hilos huerfanos, sockets cerrados.
- Cobertura y duplicacion no empeoran (hoy: ~72,9% de cobertura, 0 bugs, 0 code smells reportados por Sonar).
