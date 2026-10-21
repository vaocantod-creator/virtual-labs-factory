# Patrones del profesor Castillo — ficha de trabajo

Estado: reconstruida solo desde el articulo ICAETT 2022. Marcar [A CONFIRMAR] lo no escrito alli.

| Patron | Responsabilidad (segun articulo) | Pendiente [A CONFIRMAR] |
|---|---|---|
| Object Mobility | Dar a cada elemento del lab la capacidad de moverse | Interfaz exacta, como compone con el grafo de escena |
| Event Controller | Con Object Mobility, gestionar todos los objetos del sistema; cada subsistema tiene su manejador de eventos | Despacho de eventos, relacion con MVC |
| Graphic Element Builder / Graphic Element Handler | Clase abstracta con 5 metodos: (1) crear objetos (2) ajustar capacidades (3) articular elementos (4) ajustes iniciales (5) ajustes finales | Nombres exactos de metodos, orden de invocacion |

## Esqueleto sugerido (agnostico de lenguaje, NO normativo hasta confirmar)
```
abstract GraphicElementHandler
  createObjects()
  setCapabilities()
  articulateElements()
  initialAdjustments()
  finalAdjustments()
```
Los valores por defecto se fijan en el constructor; lo comun a todos los constructs, en
`initialAdjustments()`.

## Preguntas para el profesor
Ver `docs/11-guia-conversacion-profesor-castillo.md`.
