# Evidencia en video: Rbot (Java3D) funcionando

> Fuente: grabacion de pantalla enviada por Victor (`2026-10-22 12-28-56.mp4`, 1 min 49 s, 1920x1080, Windows 11,
> 22/10/2026 12:29-12:30). Procesada con extraccion de fotogramas y vision. El video **no se publica**
> (34 MB, pertenece a Victor); se incluyen 2 fotogramas como referencia en `docs/lab-rbot/img/`.
> Es la **referencia visual de paridad** que pedia el ADR-0001 y el informe del prototipo.

## Lo que se ve (verificado en los fotogramas)

Dos ventanas Java Swing:

1. **"Receptor"** (menus: *Puntos de Vista*, *Comunicacion*, *Controles*): una ventana con **4 vistas 3D** en cuadricula 2x2.
   - Arriba izquierda: vista en perspectiva de una esquina de la habitacion, con pared de baldosas (cuadricula).
   - Arriba derecha: **vista superior** de la habitacion; el robot se ve pequeno.
   - Abajo izquierda: **vista en primera persona** (lo que ve la camara del robot).
   - Abajo derecha: **vista cercana del robot**: dos orugas laterales, chasis blanco, panel azul, torre de camara
     con engranaje y la cabeza de la camara.
2. **"Control a Distancia"** (menu: *Comunicaciones*): panel "Vista Primera Persona" y un cuadro "Controles" con tres
   campos numericos (*Movimiento Vertical*, *Azimut*, *Elevacion*).

El aspecto de la escena: paredes de colores pasteles lisos (rosado, verde, azul, amarillo), suelo gris, sin texturas
de imagen, sombreado plano. **Coincide con el hallazgo del prototipo** (0 texturas; colores desde los `.3ds`).

## Lo que cambia durante el video

- Entre los fotogramas de ~8 s y ~70 s **el robot se desplaza y gira** en las vistas superior y de perspectiva; la
  vista en primera persona pasa de una pared (rosa y verde) a otra zona (rosa, verde claro y un suelo blanco).
- En la ventana de control, el campo *Azimut* pasa a un valor distinto de cero a ~70 s (parece "30"; **no se pudo
  leer con certeza**).
- En el fotograma de ~70 s la torre de camara aparece orientada de otra manera y la vista cercana se ve con una
  inclinacion distinta: la camara se giro.
- En el recorrido completo, la vista en primera persona recorre varias zonas (baldosas, paredes de colores,
  objetos grises) y termina mirando una superficie gris con una **estructura circular de pequenos puntos**
  (probablemente una oruga o rueda desde adentro) [interpretacion; no verificada].

## Lo que NO se pudo establecer

- **El audio no tiene voz**: la transcripcion devolvio 0 segmentos. No hay narracion del autor.
- No se pudieron leer con exactitud los valores de *Movimiento Vertical*, *Azimut* y *Elevacion* durante el video
  (el recorte de los mosaicos quedo desplazado y los valores salen ilegibles). No hay una tabla "comando -> estado".
- No se ve **que comando UDP se envio**, ni los puertos, ni la ventana de "Comunicacion" (los menus no se abren en el video).
- No hay referencia de tiempos de respuesta ni de fotogramas por segundo.
- Los nombres de las vistas (isometrica, superior, punto de vista 3) vienen del codigo; la correspondencia exacta de
  cada panel con cada clase no fue verificada.
- El video no muestra los 10 comandos `a`..`j`: no sirve por si solo como test dorado.

## Que cambia en la especificacion

1. El **Receptor** (Entorno Experimental) tiene 4 vistas: la spec decia 3 (primera persona, isometrica, superior); la cuarta,
   la vista cercana del robot, hay que identificarla en el codigo.
2. La paridad visual tiene ahora referencia: colores pasteles lisos, sombreado plano, sin texturas.
3. Los dos controles visibles (*Movimiento Vertical*, *Azimut*, *Elevacion*) son los spinners del Centro de Mando: coinciden con los rangos
   de `ViewFinder.java` (-18..58 y los demas).
4. **Actualizacion:** el test dorado numerico se construyo ejecutando el codigo real de Rbot (`ensamblado-y-paridad.md`); la lectura de la captura posterior de Victor corrige: Movimiento Vertical **58**, Azimut **76**, Elevacion **-50**, y los dos dialogos de red (Receptor 127.0.0.1:5555 -> 127.0.0.1:8080; Control a Distancia 192.168.1.13:8080 -> 127.0.0.1:5555). Un video seria util solo para comparar el dibujado: hace falta un segundo video, mas corto, con la **secuencia de comandos conocida**
   y los valores de los controles visibles a resolucion legible (p. ej. `g g g i i c e a`, con captura al final de cada paso).

## Siguiente paso

Ensamblar el robot completo en el prototipo web (cuerpo, 4 ruedas, orugas, estructura de camara) y comparar visualmente
contra el fotograma de la vista cercana (`img/rbot-java-inicio.jpg`, abajo derecha).
