// Prueba de paridad: compara el estado del Entorno web (Three.js) con el del codigo REAL de Rbot (oraculo Java).
// Uso: node tools/comparar.mjs <oraculo.json> [tolerancia=1e-9]
// El navegador sin pantalla ejecuta cada secuencia en un Entorno nuevo en modo 'legado' (el comportamiento original) y devuelve el estado.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const ORACULO = process.argv[2];
const TOL = Number(process.argv[3] ?? 1e-9);
const CHROME = '/opt/data/tools/chromium-1208/chrome-linux64/chrome';
const URL = 'http://127.0.0.1:5173/';
const PUERTO = 9555;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const java = JSON.parse(fs.readFileSync(ORACULO, 'utf8'));
const proc = spawn(CHROME, ['--headless=new', '--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PUERTO}`, '--user-data-dir=/tmp/rbot-chrome-paridad', 'about:blank'], { stdio: 'ignore' });
let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PUERTO}/json`)).json()).find((x) => x.type === 'page')?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await esperar(250);
}
const ws = new WebSocket(wsUrl);
let id = 0; const pend = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
await new Promise((r) => (ws.onopen = r));
const cmd = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => (await cmd('Runtime.evaluate', { expression, returnByValue: true })).result?.result?.value;

await cmd('Runtime.enable'); await cmd('Page.enable'); await cmd('Page.navigate', { url: URL });
for (let i = 0; i < 160 && (await ev('window.__rbot && window.__rbot.listo === true')) !== true; i++) await esperar(500);
if ((await ev('window.__rbot && window.__rbot.listo === true')) !== true) { console.log('La pagina no cargo'); proc.kill(); process.exit(2); }

const CAMPOS_MAT = ['cuerpo', 'ecmBase', 'cremallera', 'camara', 'elevador', 'engranajeBase'];
let peor = { dif: 0, sec: '', campo: '' };
let fallos = 0;
const porCampo = Object.fromEntries(CAMPOS_MAT.map((c) => [c, 0]));
for (const { sec, estado: ej } of java) {
  const web = JSON.parse(await ev(`JSON.stringify(window.__rbot.probar(${JSON.stringify(sec)}, 'legado'))`));
  let ok = true;
  for (const c of CAMPOS_MAT) {
    let d = 0;
    for (let i = 0; i < 16; i++) d = Math.max(d, Math.abs(ej[c][i] - web[c][i]));
    porCampo[c] = Math.max(porCampo[c], d);
    if (d > peor.dif) peor = { dif: d, sec: sec.slice(0, 40) + (sec.length > 40 ? '…' : ''), campo: c };
    if (d > TOL) ok = false;
  }
  for (const c of ['eslabonesDer', 'eslabonesIzq', 'ruedas']) {
    if (JSON.stringify(ej[c]) !== JSON.stringify(web[c])) { ok = false; console.log(`  discreto distinto en ${c} para "${sec.slice(0, 30)}"`); }
  }
  if (!ok) fallos++;
}
console.log(`SECUENCIAS: ${java.length} | FALLOS: ${fallos} | tolerancia: ${TOL}`);
console.log('MAX DIF POR NODO:', JSON.stringify(Object.fromEntries(Object.entries(porCampo).map(([k, v]) => [k, +v.toExponential(2)]))));
console.log(`PEOR CASO: ${peor.dif.toExponential(3)} en ${peor.campo} con "${peor.sec}"`);
ws.close(); proc.kill();
process.exit(fallos ? 1 : 0);
