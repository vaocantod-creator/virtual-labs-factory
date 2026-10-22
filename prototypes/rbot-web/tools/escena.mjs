// Ejecuta una secuencia de comandos en el Entorno (navegador sin pantalla), guarda captura y volcado de estado.
// Uso: node tools/escena.mjs "<secuencia>" <captura.png> [estado.json]
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = '/opt/data/tools/chromium-1208/chrome-linux64/chrome';
const SEC = process.argv[2] ?? '';
const SALIDA = process.argv[3] ?? '/tmp/escena.png';
const JSON_OUT = process.argv[4];
const URL = 'http://127.0.0.1:5173/';
const PUERTO = 9444;

const proc = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist', `--remote-debugging-port=${PUERTO}`, '--window-size=1200,800',
  '--user-data-dir=/tmp/rbot-chrome-escena', 'about:blank',
], { stdio: 'ignore' });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json()).find((x) => x.type === 'page')?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await esperar(250);
}
const ws = new WebSocket(wsUrl);
let id = 0; const pend = new Map(); const consola = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); }
  if (d.method === 'Runtime.consoleAPICalled') consola.push(d.params.args.map((a) => a.value ?? a.description).join(' '));
  if (d.method === 'Runtime.exceptionThrown') consola.push('EXCEPCION: ' + (d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text));
};
await new Promise((r) => (ws.onopen = r));
const cmd = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async (expression) => (await cmd('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;

await cmd('Runtime.enable'); await cmd('Page.enable');
await cmd('Emulation.setDeviceMetricsOverride', { width: 1200, height: 800, deviceScaleFactor: 1, mobile: false });
await cmd('Page.navigate', { url: URL });
let listo = false;
for (let i = 0; i < 160; i++) { if ((await evalJs('window.__rbot && window.__rbot.listo === true')) === true) { listo = true; break; } if (await evalJs('window.__rbot && window.__rbot.error')) break; await esperar(500); }
if (!listo) { console.log('NO LISTO', await evalJs('window.__rbot && window.__rbot.error'), JSON.stringify(consola.slice(0, 8))); ws.close(); proc.kill(); process.exit(1); }
if (SEC) await evalJs(`window.__rbot.ejecutar(${JSON.stringify(SEC)})`);
await esperar(1500);
const estado = await evalJs('JSON.stringify(window.__rbot.estado())');
const shot = await cmd('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(SALIDA, Buffer.from(shot.result.data, 'base64'));
if (JSON_OUT) fs.writeFileSync(JSON_OUT, estado);
console.log('SECUENCIA:', JSON.stringify(SEC), '| captura:', SALIDA);
console.log('CONSOLA:', JSON.stringify(consola.filter((c) => !c.includes('[vite]')).slice(0, 10)));
ws.close(); proc.kill(); process.exit(0);
