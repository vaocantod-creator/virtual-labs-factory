# rbot-web — prototipo de carga de piezas de Rbot en Three.js

Prototipo del ADR-0001 (`docs/lab-rbot/decisions/0001-seleccion-de-stack.md` en `virtual-labs-factory`):
comprueba que las 19 piezas `.3ds` del repo `vdiquez/Rbot` se cargan con `TDSLoader` de Three.js.
**No es todavia la migracion completa de Rbot** (no hay red UDP/WebSocket, ni Centro de Mando propio). Contiene:
- `piezas.html` / `src/piezas.ts`: carga y mide las 19 piezas `.3ds` (informe de la primera etapa).
- `index.html` / `src/app.ts` + `src/robot/`: el **Entorno Experimental** ensamblado (cuerpo, 4 ruedas, 2 orugas de 29 eslabones,
  estructura de camara) con las 4 vistas y el despacho de los 10 comandos. Flechas del teclado = mover; los controles = camara.
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
```
`probar` usa Chromium con WebGL por software (SwiftShader), asi que no necesita GPU ni pantalla.
Edita la ruta de Chromium en `tools/probar.mjs` si no coincide con tu equipo.

Versiones probadas: Node 26.7, Three.js 0.186.1, Vite 6.4.5, TypeScript 5.9.3.
