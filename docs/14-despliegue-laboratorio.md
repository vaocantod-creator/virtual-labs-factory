# Despliegue de Rbot Web en un laboratorio

Guia operativa (ADR-0004). Estado: **servidor y salas probados; guion de arranque y Docker sin probar** (ver al final).

## Opcion A: un PC del aula (la mas simple)
Requisitos del PC servidor: Node.js >= 20, el repo y los modelos `.3ds` (que pertenecen a `vdiquez/Rbot`).

```bash
cd prototypes/rbot-web
bash scripts/copiar-modelos.sh        # copia public/models desde el repo Rbot
bash scripts/laboratorio.sh           # instala, compila, genera una clave e imprime los enlaces
```
Para cada pareja se reparten dos enlaces, cambiando `mesa1` por `mesa2`, `mesa3`...:
- Centro de Mando: `http://<IP-del-servidor>:8080/?rol=centro&sala=mesa1&clave=<clave>`
- Entorno Experimental: `http://<IP-del-servidor>:8080/?rol=receptor&sala=mesa1&clave=<clave>`

Los estudiantes solo necesitan un navegador moderno con WebGL. Cada estudiante del par abre **uno** de los dos enlaces.

## Opcion B: Docker
```bash
bash scripts/copiar-modelos.sh
docker build -t rbot-web .
docker run -d --name rbot -p 8080:8080 -e RBOT_CLAVE='<clave>' rbot-web
```
La clave se pasa por variable de entorno, no por argumento (no aparece en `ps`).

## Opciones del servidor
`node bridge/servidor.mjs --ayuda`: `--host`, `--port`, `--clave`, `--max-conexiones`, `--max-salas`, `--max-por-sala`, `--origen`.
`GET /salud` devuelve el numero de conexiones y salas, sin datos sensibles.

## Seguridad: lo minimo
- Dejar la clave puesta siempre que no sea `127.0.0.1`. Cambiarla cada sesion.
- El servidor habla HTTP: en una red de laboratorio cerrada es razonable; en redes compartidas, ponerlo detras de HTTPS (Caddy/nginx).
- No publicar el puerto a Internet.

## Que NO esta resuelto
- Guion `laboratorio.sh` y `Dockerfile` sin ejecutar (el primero no se aprobo a tiempo; el demonio de Docker no existia en el servidor de desarrollo).
- HTTPS, cuentas por estudiante, reconexion automatica tras una caida y metricas de uso.
- Rendimiento real de los equipos de estudiantes (dibujan 4 vistas 3D) y del Wi-Fi.
- Interoperar con aplicaciones Rbot Java: usar el modo UDP de ADR-0003 (puente local), no las salas.

## Pruebas disponibles
`npm run probar:puente` (30), `npm run probar:servidor` (52), `npm run e2e` (21, con servidor dev), `npm run e2e:lab` (14, tras `npm run build`), `npm run carga -- 100 100 50`.
