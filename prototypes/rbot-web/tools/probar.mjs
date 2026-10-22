// Abre el prototipo en Chromium sin pantalla (WebGL por software), espera la carga de las piezas,
// imprime el informe real y guarda una captura. No ejecuta nada del repo Rbot (solo lee los .3ds).
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = '/opt/data/tools/chromium-1208/chrome-linux64/chrome';
const URL = process.argv[2] || 'http://127.0.0.1:5173/piezas.html';
const SALIDA = process.argv[3] || '/opt/data/projects/rbot-web/captura.png';
const PUERTO = 9333;

const proc = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', `--remote-debugging-port=${PUERTO}`,
  '--window-size=1400,900', '--user-data-dir=/tmp/rbot-chrome-profile', 'about:blank',
], { stdio: 'ignore' });

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
async function cdpTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PUERTO}/json`);
      const t = (await r.json()).find((x) => x.type === 'page');
      if (t) return t.webSocketDebuggerUrl;
    } catch {}
    await esperar(250);
  }
  throw new Error('Chromium no arranco');
}

const ws = new WebSocket(await cdpTarget());
let id = 0;
const pend = new Map();
const consola = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); }
  if (d.method === 'Runtime.consoleAPICalled') consola.push(d.params.args.map((a) => a.value ?? a.description).join(' '));
  if (d.method === 'Runtime.exceptionThrown') consola.push('EXCEPCION: ' + (d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text));
};
await new Promise((r) => (ws.onopen = r));
const cmd = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await cmd('Runtime.enable');
await cmd('Page.enable');
await cmd('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
await cmd('Page.navigate', { url: URL });

let listo = false;
for (let i = 0; i < 120; i++) {
  const r = await cmd('Runtime.evaluate', { expression: 'window.__rbotListo === true', returnByValue: true });
  if (r.result?.result?.value === true) { listo = true; break; }
  await esperar(500);
}
await esperar(1500);
const inf = await cmd('Runtime.evaluate', { expression: 'JSON.stringify(window.__rbotInforme || null)', returnByValue: true });
const gl = await cmd('Runtime.evaluate', {
  expression: `(() => { const c = document.createElement('canvas'); const g = c.getContext('webgl2') || c.getContext('webgl'); if (!g) return 'sin WebGL'; const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'WebGL ok'; })()`,
  returnByValue: true,
});
const shot = await cmd('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SALIDA, Buffer.from(shot.result.data, 'base64'));

console.log('LISTO:', listo);
console.log('RENDERER:', gl.result?.result?.value);
console.log('INFORME:', inf.result?.result?.value);
console.log('CONSOLA:', JSON.stringify(consola.slice(0, 15)));
ws.close();
proc.kill();
process.exit(0);
