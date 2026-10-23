# ADR-0004: Modo laboratorio: un servidor, salas por pareja, sin instalar nada en el equipo del estudiante

- **Estado:** ACEPTADA por instruccion del CEO (Victor) el 2026-10-23 ("prepara el modo de despliegue para el laboratorio").
- **Laboratorio:** Rbot. **Desarrolla** ADR-0003. El protocolo (una letra `a`..`j`) **no cambia**.

## Contexto
ADR-0003 exige Node.js y un puente en cada equipo, y abre puertos UDP 5555/8080: con varias parejas en una misma red colisionarian, y ADR-0001 dejaba pendiente
donde ejecutar Node.js. Un laboratorio necesita: abrir una URL y trabajar.

## Decision
1. **Un solo servidor** (`bridge/servidor.mjs`) sirve la aplicacion compilada y el WebSocket en **un puerto HTTP**. El estudiante solo necesita un navegador.
2. **Salas**: `?rol=centro|receptor&sala=mesa1&clave=...`. Cada pareja comparte una sala; el servidor entrega en memoria el comando al extremo opuesto **de esa sala**. No se abren puertos UDP.
   Sin `sala`, el modo UDP de ADR-0003 sigue igual (interoperar con Rbot Java).
3. **Clave de laboratorio** (comparacion en tiempo constante), generada al arrancar si no se da. Se quita de la URL tras leerla.
4. **Topes**: 300 conexiones, 100 salas, 8 por rol y sala, 200 msg/s por cliente, mensajes de 1 KB.
5. **Seguridad HTTP**: solo GET/HEAD, contencion de rutas dentro de `dist/`, cabeceras (CSP `default-src 'self'`, nosniff, X-Frame-Options DENY), cache inmutable solo para assets con hash.
6. **Arranque**: `bash scripts/laboratorio.sh` (imprime los enlaces por pareja) o Docker (`Dockerfile`). Por defecto solo `127.0.0.1`; exponerlo a la red es explicito (`--host 0.0.0.0`) y avisa si falta clave.

## Verificacion (ejecutada)
- **Servidor y salas: 52 comprobaciones, 0 fallos** (`bridge/servidor.test.mjs`): estaticos y cabeceras; 8 intentos de recorrido de rutas (`../`, `%2e%2e`, doble codificacion, NUL, ruta absoluta); aislamiento entre salas; dos centros en una sala;
  topes de sala, salas y conexiones; clave incorrecta, ausente y de tipo raro; 8 nombres de sala invalidos; origen ajeno; limpieza de salas; limite de frecuencia; mensajes malformados.
- **Control negativo:** al romper a proposito la contencion de rutas, la clave y el aislamiento de salas, **11 comprobaciones fallan**; restauradas, vuelven a 52/52.
  (Esto destapo ademas un mensaje de error con mal plural, "2 centroes"; corregido.)
- **Extremo a extremo con dos Chromium: 14 comprobaciones, 0 fallos** (`tools/e2e-lab.mjs`): la app compilada se sirve, el modelo 3D carga, las flechas del Centro mueven al Receptor por la sala con estado identico al de referencia, un Centro de otra
  sala no lo mueve, clave incorrecta no puede mover, el Centro es avisado cuando el Receptor se va, y no hay errores de consola.
- **Carga** (`tools/carga.mjs`, 4 nucleos, mismo equipo): 15 parejas a 20 cmd/s: 3000/3000 entregados, latencia p95 3,9 ms. 100 parejas a 20 cmd/s: 10000/10000, p95 5,4 ms, 114 MB. Rafaga sin pausa de 100 parejas: 20000/20000, 0 perdidos, p95 585 ms.

## Lo que NO se verifico
- **`scripts/laboratorio.sh` no se ejecuto.** Su primer intento fue bloqueado por falta de aprobacion. Sus piezas (build, servidor, enlaces) estan probadas por separado; el guion en si, no.
- **`Dockerfile` no se construyo:** el demonio de Docker no esta disponible en este servidor. Se corrigio un error de lectura (`vite.config.*` no existe) pero la imagen no se ha construido nunca.
- **La carga se midio en el mismo equipo** que el servidor, sin red real ni navegadores; no mide Wi-Fi del aula, ni el coste de dibujar 4 vistas 3D en equipos de estudiantes (que es probablemente el limite real).
- **HTTP sin cifrar:** la clave viaja en claro por la red local. Para redes no confiables o WebXR fuera de localhost hace falta HTTPS con un proxy; no se configuro.
- **La clave en la URL** es comoda pero queda en el historial de cada navegador hasta que se limpie y en los registros de un proxy; se quita de la barra de direcciones, no de ahi.
- No se probo el modo sala con **estudiantes reales**, ni la reconexion tras una caida de red (el cliente no reconecta solo).
- Los modelos `.3ds` siguen sin versionarse; hay que copiarlos en el servidor (`scripts/copiar-modelos.sh`).
- El modo sala **no interopera con Rbot Java** (no hay UDP): es para parejas web-web.

## Consecuencias
- El profesor decide donde corre (servidor de la universidad, un PC del aula o un contenedor): ya no se instala nada en cada equipo.
- Se pierde la interoperabilidad Java en el modo sala; se conserva en el modo UDP.
- Hay una clave compartida por laboratorio, no cuentas por estudiante.
