# ADR-0003: Puente UDP<->WebSocket y Centro de Mando web (interoperabilidad con Rbot Java)

- **Estado:** ACEPTADA por instruccion del CEO (Victor) el 2026-10-22 ("procede con la salida a" del ADR-0002).
- **Laboratorio:** Rbot. **Desarrolla** ADR-0001 (punto 3: transporte) y **resuelve la consecuencia pendiente de ADR-0002**.
- **Decide:** Arquitecto Heuristico propone; CEO aprueba. El protocolo UDP de la constitution **no cambia**.

## Contexto

ADR-0002 hizo que el Entorno web interprete cada letra como incremento relativo. Eso rompe la coincidencia con un Centro de Mando Java sin
cambios. El CEO eligio la salida (a): portar tambien el Centro de Mando a la web, sin tocar el repo Java.

## Decision

1. **Puente Node.js** (`prototypes/rbot-web/bridge/puente.mjs`) entre WebSocket y UDP, **sin cambiar el protocolo**: un datagrama de un byte, letras `a`..`j`,
   puertos **5555** (Entorno) y **8080** (Centro de Mando). Un Centro de Mando o Entorno Java existentes pueden convivir con los web.
2. **Dos roles en la misma aplicacion**, elegidos por URL: `?rol=receptor` (Entorno Experimental: 4 vistas, escucha 5555, ejecuta y **retransmite** a
   `127.0.0.1:8080` como `EnvironmentReceiver.retransmit`) y `?rol=centro` (Centro de Mando: flechas y 3 controles, escucha 8080, envia a `127.0.0.1:5555`).
   Sin `rol`, la aplicacion es autonoma (sin red), como antes.
3. **Los controles emiten todos los pasos de un salto.** En Java, un spinner enviaba un comando solo si el valor cambiaba **exactamente** un paso; si se
   escribia 40 de golpe no se enviaba nada y el robot quedaba desincronizado de lo que mostraba el control. Ahora un salto de 0 a 10 emite 10 comandos `a`.
   Es coherente con ADR-0002 (cada comando es un incremento fijo). Los valores se ajustan a rango y a la rejilla (paso 1, 2 y 2).
4. **Validacion de destino con las reglas de `NetworkDestination`** (IP no vacia, puerto entero 1..65535), aplicada en la interfaz **y** en el puente.

## Seguridad (el puente abre puertos de red)

- WebSocket y UDP escuchan **solo en 127.0.0.1** por defecto (`--udp-host 0.0.0.0` es explicito).
- Solo se envia a **loopback**; redes privadas unicamente con `--permitir-lan`; **nunca a IPs publicas**. Sin esto, cualquier pagina del navegador podria usar el
  puente para enviar UDP a Internet. El destino se resuelve una vez y se envia a la IP resuelta.
- Solo se aceptan datagramas de **exactamente una letra a..j** (`Command.fromCode`); lo demas se descarta y se informa con texto acotado y sin caracteres de control.
- Los navegadores deben venir de un **origen permitido** (`--origen`); un sitio externo no puede conectarse al puente.
- Limite de frecuencia (200 mensajes/s por cliente) y de tamano (1 KB). La interfaz muestra el texto de la red con `textContent`.
- El puerto UDP se abre al conectar el primer cliente de un rol y se **libera** al irse el ultimo; si esta ocupado (p. ej. por Rbot Java), se informa con un mensaje claro.

## Verificacion (ejecutada)

- **Puente: 30 comprobaciones, 0 fallos** (`bridge/puente.test.mjs`): UDP->WS de las 10 letras; 7 clases de datagrama invalido; WS->UDP; 12 casos de validacion de envio
  (puertos 0, 70000, no numerico; IP publica; 192.168.x.x y 10.x por defecto; host inexistente; `localhost`); limite de frecuencia; JSON invalido; envio sin `hola`;
  rol invalido; mensaje de 5000 bytes; origen malicioso rechazado y permitido aceptado; puerto ocupado; liberacion del puerto.
- **Control negativo del puente:** al desactivar a proposito el filtro de destinos y el de datagramas, **5 comprobaciones fallan** (IP publica, red privada, 10.x e invalidos): las pruebas detectan la regresion.
- **Extremo a extremo: 21 comprobaciones, 0 fallos** (`tools/e2e.mjs`): dos paginas reales en Chromium (Centro y Receptor), el puente y UDP real en los puertos **5555 y 8080**:
  flechas del Centro -> Receptor ejecuta `gggii` con el estado identico al de referencia; retransmision a 8080; salto de control = 10 comandos; limite 58; azimut -14 = 7 comandos `d`;
  UDP crudo `g` mueve al Receptor y `zz` no; destino invalido y IP publica rechazados; con un campo de texto enfocado las flechas no envian.
- **Cliente Java real (JDK 17)** enviando `"g".getBytes()` al puerto 5555, igual que `Transmitter.java`: el Receptor web lo ejecuta y **retransmite el mismo byte** a Java (`JAVA_RECIBIO:g:1`).
- Paridad (modo legado, 77 secuencias) y 103 propiedades de ADR-0002 siguen vigentes.

## Lo que NO se verifico

- **No se ejecuto el Centro de Mando ni el Entorno Java reales contra el puente**: su ventana grafica se cae en este servidor (SIGSEGV de Java3D). Lo probado es un cliente Java
  de 10 lineas que replica los datagramas, no las aplicaciones Swing. La interoperabilidad con las aplicaciones completas falta por comprobar en una maquina con pantalla.
- **Mezclar un extremo Java sin cambios con uno web sigue dando semantica distinta** (legado vs. mejorado): el puente transporta bien, pero un Entorno Java ejecutara `g` con su
  logica acumulada. Para ver coincidencia, los dos extremos deben ser web, o el Entorno web debe usar `modo: 'legado'`.
- Rendimiento con varios estudiantes a la vez: medido despues en ADR-0004 (modo sala). Para el modo UDP sigue sin medirse.
- El puente requiere Node.js en el equipo que lo ejecute (pendiente de aprobacion del profesor, ver ADR-0001).
- Un navegador solo conecta con un puente en `localhost` por defecto; el despliegue en red del laboratorio no se ha disenado.

## Consecuencias

- Aparece una pieza que mantener y asegurar (el puente). Su superficie es pequena (~200 lineas) y esta cubierta por pruebas.
- Un estudiante necesita `node bridge/puente.mjs` en marcha para el modo en red; el modo autonomo no lo necesita.
- Una version futura puede sustituir UDP por WebSocket directo (ADR-0001, punto 5) sin cambiar la interfaz.
