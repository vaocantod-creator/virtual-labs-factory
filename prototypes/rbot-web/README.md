# rbot-web — Rbot en Three.js + TypeScript

Migracion de Rbot (`vdiquez/Rbot`) segun ADR-0001 a ADR-0004 (`docs/lab-rbot/decisions/` en `virtual-labs-factory`).
**Es una migracion funcional, aun no validada contra las aplicaciones Java reales ni desplegada con estudiantes** (ver "Estado" al final). Contiene:
- `piezas.html` / `src/piezas.ts`: carga y mide las 19 piezas `.3ds` (informe de la primera etapa).
- `index.html` / `src/app.ts` + `src/robot/`: el **Entorno Experimental** ensamblado (cuerpo, 4 ruedas, 2 orugas de 29 eslabones,
  estructura de camara) con las 4 vistas y el despacho de los 10 comandos. Flechas del teclado = mover; los controles = camara.
- `src/red/`: **Centro de Mando** web (flechas y 3 controles) y cliente del puente.
- `bridge/puente.mjs` (UDP<->WebSocket, ADR-0003) y `bridge/servidor.mjs` (servidor de laboratorio con salas, ADR-0004).
- `tools/comparar.mjs`: paridad numerica contra el codigo real de Rbot en **modo `legado`** (`../rbot-oracle/`), 77 secuencias, 0 diferencias.
- `tools/propiedades.mjs`: 103 propiedades del comportamiento **mejorado** (ADR-0002): reversibilidad, sin historial oculto, sin retraso, limites.

Modos: `mejorado` (por defecto) = comandos relativos fijos; `legado` = comportamiento exacto de Java, solo para paridad.

## Uso
```bash
./scripts/copiar-modelos.sh        # copia las piezas desde vdiquez/Rbot
npm install
npm run dev                        # http://127.0.0.1:5173
npm run build                      # tsc --noEmit + vite build
npm run probar                     # Chromium sin pantalla: informe de carga de piezas + captura (servidor dev activo; abre /piezas.html)
node tools/escena.mjs "gggiii" out.png   # ejecuta una secuencia y guarda captura de las 4 vistas
node tools/comparar.mjs ../rbot-oracle/oraculo-77-secuencias.json   # paridad con Java (modo legado)
node tools/propiedades.mjs                                          # propiedades del comportamiento mejorado
node bridge/puente.mjs                                              # puente UDP<->WebSocket (127.0.0.1:8765; --ayuda para opciones)
node bridge/puente.test.mjs                                         # 30 pruebas del puente (no necesita servidor)
node tools/e2e.mjs                                                  # 21 pruebas extremo a extremo (servidor dev activo)
node bridge/servidor.test.mjs                                       # 52 pruebas del servidor de laboratorio y las salas (no necesita servidor)
node tools/e2e-lab.mjs                                              # 14 pruebas extremo a extremo del modo laboratorio (tras `npm run build`)
node tools/carga.mjs 100 100 50                                     # prueba de carga: 100 parejas, 100 comandos cada una
```
`probar` usa Chromium con WebGL por software (SwiftShader), asi que no necesita GPU ni pantalla.
Edita la ruta de Chromium en `tools/probar.mjs` si no coincide con tu equipo.

Versiones probadas: Node 26.7, Three.js 0.186.1, Vite 6.4.5, TypeScript 5.9.3. El `Dockerfile` usa Node 22 y `laboratorio.sh` pide Node >= 20; **esas versiones no se han probado**.

## Modo en red (ADR-0003)

1. `node bridge/puente.mjs`  (solo loopback por defecto; `--ayuda` muestra las opciones y `--permitir-lan` para una red privada).
2. Receptor (Entorno Experimental): `http://127.0.0.1:5173/?rol=receptor`: escucha UDP 5555, ejecuta, y retransmite a `127.0.0.1:8080`.
3. Centro de Mando: `http://127.0.0.1:5173/?rol=centro`: flechas del teclado y 3 controles; escucha 8080 y envia a `127.0.0.1:5555`.

Sin `?rol=` la aplicacion es autonoma (sin red). El puente solo reenvia letras `a`..`j` y nunca envia a IPs publicas.

## Modo laboratorio (ADR-0004, guia completa en `docs/14-despliegue-laboratorio.md`)

`bash scripts/laboratorio.sh` sirve la aplicacion y el puente en un solo puerto, con salas por pareja y clave. El estudiante solo abre un enlace:
`http://<servidor>:8080/?rol=centro&sala=mesa1&clave=...` y `...?rol=receptor&sala=mesa1&clave=...`. Docker: `docker build -t rbot-web .`.

## Estado

Probado: paridad numerica con el codigo Java real (modo `legado`), 103 propiedades de los comandos, puente (30), extremo a extremo (21), servidor y salas (52 + 14), carga.
**No comprobado:** las aplicaciones Swing reales contra el puente, `laboratorio.sh`, la imagen Docker, el aspecto visual frente a Java con pantalla, HTTPS, reconexion automatica y estudiantes reales.
Los modelos `.3ds` no se versionan aqui: `scripts/copiar-modelos.sh` los copia desde `vdiquez/Rbot`.
