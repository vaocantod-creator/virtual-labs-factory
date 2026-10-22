# rbot-web — prototipo de carga de piezas de Rbot en Three.js

Prototipo del ADR-0001 (`docs/lab-rbot/decisions/0001-seleccion-de-stack.md` en `virtual-labs-factory`):
comprueba que las 19 piezas `.3ds` del repo `vdiquez/Rbot` se cargan con `TDSLoader` de Three.js.
**No es todavia la migracion de Rbot**: no hay cinematica, ni comandos UDP, ni vistas del robot. Solo carga,
mide y muestra las piezas en una rejilla.

## Uso
```bash
./scripts/copiar-modelos.sh        # copia las piezas desde vdiquez/Rbot
npm install
npm run dev                        # http://127.0.0.1:5173
npm run build                      # tsc --noEmit + vite build
npm run probar                     # Chromium sin pantalla: informe de carga + captura (requiere el servidor dev activo)
```
`probar` usa Chromium con WebGL por software (SwiftShader), asi que no necesita GPU ni pantalla.
Edita la ruta de Chromium en `tools/probar.mjs` si no coincide con tu equipo.

Versiones probadas: Node 26.7, Three.js 0.186.1, Vite 6.4.5, TypeScript 5.9.3.
