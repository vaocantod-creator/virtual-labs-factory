# Ensamblado del robot en Three.js y prueba de paridad con el codigo real de Rbot

> Estado: ejecutado el 2026-10-22. Codigo en `prototypes/rbot-web/`; oraculo Java en `prototypes/rbot-oracle/`.
> Continua `prototipo-carga-3ds.md` (carga de piezas) y usa `evidencia-video-rbot.md` como referencia visual.

## Que se hizo

1. **Se leyo el codigo fuente** de Rbot que mueve el robot: `Cuerpo`, `TrackLink`, `WheelMovement`, `EstructuraCamara`,
   `Cremallera`, `Camara`, `EngranajeElevador`, `EngranajeBaseMotor`, `VirtualScenary` (las 4 vistas), `EnvironmentReceiver`
   (despacho de comandos) y `Transmitter` (UDP y teclas).
2. **Se porto a TypeScript/Three.js** con el patron del profesor: cada elemento extiende `ObjetoGrafico` (los 5 metodos de
   `docs/13`). El estado se mueve con una emulacion de `Transform3D` que usa la misma aritmetica acumulativa que Java.
3. **Se ejecuto el codigo real de Rbot** como oraculo (Java3D 1.6.0 sobre Xvfb, sin dibujar) y se comparo contra el puerto web.
4. **Se verifico que la prueba discrimina** (sabotaje: ver seccion 3).

## Como funciona Rbot (verificado en el codigo)

- **Entrada:** el Centro de Mando captura las **flechas direccionales** (`Transmitter.keyPressed`): arriba = avanzar (`g`), abajo = retroceder (`h`),
  derecha = girar derecha (`i`), izquierda = girar izquierda (`j`). Los tres spinners emiten `a`..`f` **solo cuando el valor cambia exactamente
  un paso** (vertical 1; azimut y elevacion 2): si se salta un valor, no se envia nada.
- **Red:** el Centro de Mando envia el comando como texto de una letra a `IP destino:puerto destino` (por defecto 127.0.0.1:5555); el Entorno
  escucha en 5555, ejecuta y **retransmite** el mismo texto al destino configurado (127.0.0.1:8080), donde el Centro de Mando lo vuelve a ejecutar
  en su propia escena. La captura de Victor muestra exactamente esos valores (Receptor: local 5555 / destino 8080; Control: local 8080 / destino 5555).
- **Movimiento:** cinematico, por pasos discretos: la oruga es un circuito de 29 eslabones; la rueda tiene 15 posiciones de -24 grados.

## 1. Resultado: paridad numerica con el codigo real

**77 secuencias de comandos (37 fijas + 40 aleatorias con semilla) ejecutadas en Java real y en TypeScript: 0 diferencias.**
Diferencia maxima en los 6 nodos comparados (cuerpo, base de camara, cremallera, camara, elevador, engranaje base): **0 exacto**,
con tolerancia exigida de 1e-9. Estados discretos (posicion de los 58 eslabones y de las 4 ruedas) idénticos.

Por que da exactamente 0: el puerto reproduce la aritmetica de Java, incluido el redondeo a `float` de cada resta y de cada acumulador
(`Math.fround`), la multiplicacion de matrices en el mismo orden y los mismos grados->radianes (`g * PI / 180`).

## 2. Lo que la prueba cubre y lo que NO

Cubre: las transformaciones del cuerpo, la camara y sus engranajes, y la posicion de eslabones y ruedas, ante cualquier combinacion de los 10 comandos.
Cobertura efectiva de la muestra: el cuerpo cambia respecto al inicial en 60/77 secuencias; la base de camara, en 38; la cremallera, 41; la camara, 36;
el elevador, 41; el engranaje base, 38; ruedas y eslabones, 49. Es decir, todos los nodos se ejercitan.

NO cubre:
- **Las 4 vistas** (`VirtualScenary`): su cadena de transformaciones esta portada (`vistas.ts`) pero no tiene oraculo; se valido solo a ojo (seccion 4).
- **El dibujado**: materiales, luces, sombreado, antialiasing y aspecto final no estan en la prueba numerica.
- **UDP y retransmision**: no se porto la red (eso es el puente del ADR-0001).
- **Los valores limite de los controles** (58, 76, -50 de la captura de Victor): se reprodujeron como secuencia (`a`x58 `c`x38 `f`x25) pero el
  Java real tampoco aplica esos limites en el receptor, solo la interfaz.

## 3. La prueba discrimina (control negativo)

Un resultado exacto puede significar que no se mide nada. Se alteró a proposito un valor del oraculo (`camara[3] += 1e-6` en la secuencia `c`) y
el comparador lo detecto: `FALLOS: 1`, diferencia 1.0e-6 en el nodo camara. Tambien se verifico que el oraculo produce 69 estados distintos
entre las 77 secuencias, y que las ruedas y el cuerpo alcanzan valores no triviales (p. ej. 31 retrocesos: ruedas [15,2,15,2], cuerpo tx = 121).

## 4. Comparacion visual con la captura de Victor

Con la misma secuencia (`a` x58, `c` x38, `f` x25) la escena web se ve coherente con la captura: habitacion con paredes pasteles, suelo gris liso, sin texturas,
robot con dos orugas de eslabones, chasis, panel azul y torre de camara articulada. Diferencias observadas a ojo:
- **Los controles de la captura muestran 58/76/-50 y la vista de Java se ve muy distinta a la nuestra en ese estado**, en parte porque el Receptor
  de Victor tambien ejecuto movimientos de avance/giro (sus vistas superior y de perspectiva muestran el robot desplazado) que la secuencia de prueba
  no incluye. No hay forma de saber con certeza la secuencia exacta de Victor; por eso la paridad se midio por numeros, no por captura.
- La iluminacion y los reflejos del puerto web son mas brillantes (Three.js usa un modelo fisico; Java3D, uno simple). Se compenso la intensidad de
  las luces (x PI) pero **no se ajusto a ojo**: es una diferencia pendiente de decidir.
- El plano de recorte lejano de las vistas era de 1000 unidades (como Java `setBackClipDistance(1000)`); en Three.js el suelo desaparecia en la vista
  superior, asi que se amplio a 100.000. **Ese cambio no esta en Java**; es una diferencia consciente (el motor de Java3D mide la distancia de otra manera).
- El campo de vision se convirtio de horizontal (Java3D, 45 grados) a vertical (Three.js); no se verifico contra pixeles.

> **Actualizacion (mismo dia):** el CEO decidio corregir estos comportamientos. Ver `decisions/0002-comandos-relativos.md`. El modo por
> defecto de la version web es ahora `mejorado`; lo descrito abajo corresponde al modo `legado`, que se mantiene solo para la paridad.

## 5. Hallazgos de comportamiento heredado (no son errores de la migracion)

Se conservaron en la primera version porque la paridad con Java era el criterio de aceptacion; **ADR-0002 los corrige en el modo por defecto**. Cada uno se verifico con el oraculo (codigo real de Rbot) o
con la lectura del codigo, y esta marcado asi. Conviene decidir con Victor si se corrigen despues (cada uno requiere ADR).

**Medidos con el oraculo (desplazamiento X del cuerpo, `cuerpo[3]`):**
| Secuencia | tx medido | Lectura |
|---|---|---|
| `g` | +1 | el primer avance mueve +1 |
| `ggg` | -7 | luego -4 por paso (1 - 4 - 4) |
| `h` | +1 | el primer retroceso tambien mueve +1 |
| `hhh` | +9 | luego +4 por paso (1 + 4 + 4) |
| `gh` | -3 | retroceder tras avanzar **no revierte**: sigue en la misma direccion (-4) |
| `hg` | +5 | avanzar tras retroceder tampoco revierte (+4) |

1. **Estado compartido entre avanzar y retroceder** (`paso`/`refX` en `Cuerpo`): el desplazamiento de cada orden depende del estado que dejo la
   anterior, no del comando; por eso `gh` no vuelve al punto de partida. Conclusion cuidadosa: una secuencia de avances y retrocesos mezclados no se
   comporta como "adelante y atras". No he medido secuencias largas mezcladas mas alla de las 40 aleatorias de la prueba de paridad.
2. **Retraso de un paso en la camara** (medido): el primer `a`, `c` o `e` no mueve la camara; las secuencias `a` y `c` la dejan en su pose inicial.
   Cada comando aplica el valor de referencia ANTES de actualizarlo.
3. **Acumuladores sin limite en el receptor** (por lectura del codigo): `refVertical`, `refAzimut` y `refElevacion` crecen sin tope; solo los spinners del
   Centro de Mando limitan los rangos (-18..58, -90..90, -50..50).
4. **Estado duplicado** (deduccion, no medido): el Entorno y el Centro de Mando mantienen cada uno sus acumuladores y podrian divergir si se pierde un paquete UDP.
5. **Nombres enganosos** (por lectura): `moverOrugaDerecha()` es "avanzar con ambas orugas" y `moverOrugaIzquierda()` es "retroceder con ambas"; no se refieren al lado.
   El giro, en cambio, es diferencial y correcto (medido: en `i` los eslabones de un lado avanzan y los del otro retroceden; en `j`, al reves).
6. **Codigo muerto en `Cuerpo`** (por lectura): `tg3` y `Posicionamiento` se crean y nunca se agregan al grafo; no se portaron.

## 6. Como se ejecuto el oraculo (reproducible)

- JDK 17 (Temurin), compilando con `--release 8`; Java3D 1.6.0-scijava + JOGL 2.3.2 (+ nativos `linux-amd64`) bajados de Maven Central; `libXtst.so.6` desde el paquete
  Debian `libxtst6` extraido a una carpeta propia (sin instalar nada en el sistema); servidor X virtual (Xvfb).
- Con el renderer real de Java3D (Mesa/llvmpipe) la JVM se cae con SIGSEGV en este servidor; con `-Dj3d.rend=noop` se construye y se mueve todo el grafo de escena
  **sin dibujar**, que es lo que la prueba numerica necesita. Por eso el oraculo no entrega capturas de pantalla de Java.
- No se modifico el repo `vdiquez/Rbot`: el arnes `Oraculo.java` vive en `prototypes/rbot-oracle/` y se compila con `-sourcepath`.
- `Oraculo` replica el despacho de `EnvironmentReceiver.dispatch` para los 10 comandos (sin las partes de vistas). Si Rbot cambia ese despacho, el oraculo debe actualizarse.

## 7. Siguiente paso propuesto

1. Extender el oraculo a las **4 vistas** (`VirtualScenary`) para cubrir tambien `vistas.ts`.
2. Comparar **imagenes**: ejecutar Rbot real con pantalla (en la maquina de Victor) con una secuencia conocida y capturar los 4 paneles, para decidir la iluminacion.
3. **Puente UDP -> WebSocket** del ADR-0001 y la prueba de interoperabilidad (Centro de Mando Java + Entorno web).
4. Decidir con Victor si se corrigen los hallazgos de la seccion 5 (cada uno requiere ADR, porque cambia comportamiento).
