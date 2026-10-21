# Constitution — <nombre del laboratorio>

> Principios inmutables. NO fija stack nuevo (eso va en plan + ADR). Puede fijar invariantes de un
> sistema legado. Ver docs/07 seccion 12.

## Eje Didactico (reglas inmutables)
- ...

## Eje Sistemico (reglas inmutables)
- ...

## Eje 3D (reglas inmutables)
- ...

## Eje Agentes (reglas inmutables — distingue constructores vs. operadores)
- ...

## Metodo Castillo — programacion sistemica (aplica si el lab usa la skill `patrones-castillo-3d`)
> Seccion transversal a los ejes Sistemico y 3D. Borrador sujeto a co-diseno con el profesor.
- El lab se descompone en subsistemas independientes (iluminacion, visualizacion, mobiliario,
  gestion de equipos) y cada equipo es un subsistema; ninguno se integra sin prueba individual.
- Diseno top-down / implementacion bottom-up. Ningun subsistema se codifica sin su grafo de escena.
- Se usan los patrones Object Mobility, Event Controller y Graphic Element Builder (o su
  equivalente portado, registrado en ADR).
- Todo componente reusable se registra en `component-library.md` del lab.
- Para labs que emulan un equipo: fidelidad al equipo real (apariencia, usabilidad, modelo
  matematico), diseno propio sin marcas, validacion por experto con acta, y test de salida numerica
  contra valores de referencia.
- El lab ofrece configuraciones predefinidas de escena y manuales de practica.
