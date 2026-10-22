# Patrones del profesor Castillo — ficha de trabajo

Estado: articulo ICAETT 2022 + contraste con los JARs de la Version 5 (`docs/13`, lectura estatica de
binarios, sin ejecutar). Marcar [A CONFIRMAR] lo no verificado.

| Patron | Responsabilidad (segun articulo) | Pendiente [A CONFIRMAR] |
|---|---|---|
| Object Mobility | Dar a cada elemento del lab la capacidad de moverse | **Visto en JARs**: metodos `desplazar*`, `rotar*`, `setTamaño` en la clase base `ObjetoGrafico`. [A CONFIRMAR] si es herencia o un patron aparte |
| Event Controller | Con Object Mobility, gestionar todos los objetos del sistema; cada subsistema tiene su manejador de eventos | **Visto en JARs** sin clase con ese nombre: `*Control` (ActionListener) + `Procesador*` + `PickMouseBehavior` para botones 3D. [A CONFIRMAR] |
| Graphic Element Builder / Graphic Element Handler | Clase abstracta con 5 metodos: (1) crear objetos (2) ajustar capacidades (3) articular elementos (4) ajustes iniciales (5) ajustes finales | **CONFIRMADO en JARs**: `ObjetoGrafico`, `ObjetoGrafico2`, `EquipoTelecom` son abstractas, extienden `BranchGroup`, con `protected abstract void ajustesIniciales/crearElementos/ajustarCapacidades/articularElementos/ajustesFinales`. Orden de invocacion: [A CONFIRMAR] |

## Esqueleto (nombres reales del codigo, ver `docs/13`; el port a otro lenguaje los traduce)
```
abstract class ObjetoGrafico extends BranchGroup   // Java3D
  protected abstract void ajustesIniciales()
  protected abstract void crearElementos()
  protected abstract void ajustarCapacidades()
  protected abstract void articularElementos()
  protected abstract void ajustesFinales()
```
Jerarquia observada: `ObjetoGrafico` -> `EquipoTelecom2` -> equipo concreto (Osciloscopio, GeneradorFunciones,
OsciloscopioHP, AnalizadorEspectroHP, SWRMeter, AtenuadorSWR, MuebleLab); cada equipo con `Modelo/Vista/Control`
y la vista dividida en `PartesFijas/PartesMoviles/PartesActivas`.
Los valores por defecto se fijan en el constructor; lo comun a todos los constructs, en
`initialAdjustments()`.

## Preguntas para el profesor
Ver `docs/11-guia-conversacion-profesor-castillo.md`.
