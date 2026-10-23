// Prueba extremo a extremo del MODO LABORATORIO: servidor.mjs sirve dist/ y el puente; dos navegadores (Centro y Receptor) en una sala.
// Uso: npm run build && node tools/e2e-lab.mjs     (no necesita servidor dev; levanta el suyo en un puerto libre)
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearServidor } from '../bridge/servidor.mjs';

const CHROME = process.env.CHROME ?? '/opt/data/tools/chromium-1208/chrome-linux64/chrome';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let total = 0, fallos = 0;
const ok = (n, c, x = '') => { total++; if (!c) { fallos++; console.log(`  FALLA ${n} ${x}`); } };

async function abrir(dbg, url) {
  const proc = spawn(CHROME, ['--headless=new', '--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    `--remote-debugging-port=${dbg}`, `--user-data-dir=/tmp/rbot-lab-${dbg}`, '--window-size=1200,800', 'about:blank'], { stdio: 'ignore' });
  let u; for (let i = 0; i < 60 && !u; i++) { try { u = (await (await fetch(`http://127.0.0.1:${dbg}/json`)).json()).find((x) => x.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!u) await esperar(250); }
  const ws = new WebSocket(u); let id = 0; const p = new Map();
  const consola = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && p.has(d.id)) { p.get(d.id)(d); p.delete(d.id); } if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') consola.push(d.params.args?.[0]?.value); if (d.method === 'Runtime.exceptionThrown') consola.push(d.params.exceptionDetails?.text); };
  await new Promise((r) => (ws.onopen = r));
  const c = (m, pr = {}) => new Promise((r) => { const i = ++id; p.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: pr })); });
  const ev = async (e) => (await c('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;
  await c('Runtime.enable'); await c('Page.enable'); await c('Page.navigate', { url });
  for (let i = 0; i < 160 && (await ev('window.__rbot&&window.__rbot.listo===true')) !== true; i++) await esperar(500);
  const tecla = async (key) => { for (const type of ['keyDown', 'keyUp']) await c('Input.dispatchKeyEvent', { type, key, windowsVirtualKeyCode: { ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39 }[key] }); };
  return { ev, tecla, consola, c, cerrar: () => { ws.close(); proc.kill(); } };
}
const txt = (pag, id) => pag.ev(`document.getElementById('${id}').textContent`);
const estado = async (pag) => JSON.parse(await pag.ev('JSON.stringify(window.__rbot.estado())'));
const esperado = async (pag, sec) => JSON.parse(await pag.ev(`JSON.stringify(window.__rbot.probar(${JSON.stringify(sec)}))`));
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const CLAVE = 'clave-de-prueba';
const srv = crearServidor({ raiz: path.join(aqui, '..', 'dist'), clave: CLAVE, host: '127.0.0.1', port: 0 });
const puerto = await srv.escuchar();
const base = `http://127.0.0.1:${puerto}`;

// Receptor y Centro en la sala "mesa7", ambos desde el MISMO servidor (modo laboratorio)
const rec = await abrir(9801, `${base}/?rol=receptor&sala=mesa7&clave=${CLAVE}`);
const cen = await abrir(9802, `${base}/?rol=centro&sala=mesa7&clave=${CLAVE}`);
await esperar(1200);
ok('1 el modelo 3D carga desde el servidor (listo)', (await rec.ev('window.__rbot.listo')) === true);
ok('1 el receptor entro en la sala', /Sala "mesa7"/.test(await txt(rec, 'estado')) || /conectado/.test(await txt(rec, 'estado')), await txt(rec, 'estado'));
ok('1 el centro sabe que hay companero', /companero conectado|Entorno Experimental conectado/.test(await txt(cen, 'estado')), await txt(cen, 'estado'));
ok('1 la clave no queda en la URL', !(await rec.ev('location.href')).includes(CLAVE), await rec.ev('location.href'));
ok('1 los campos IP/puerto se deshabilitan en modo sala', (await rec.ev(`document.getElementById('ipDestino').disabled`)) === true);

for (const [k, n] of [['ArrowUp', 3], ['ArrowRight', 2], ['ArrowDown', 1]]) for (let i = 0; i < n; i++) await cen.tecla(k);
await esperar(700);
ok('2 flechas del Centro mueven al Receptor via sala (gggiih)', igual(await estado(rec), await esperado(rec, 'gggiih')));
await cen.ev(`(()=>{const el=document.getElementById('mv'); el.value='6'; el.dispatchEvent(new Event('input'));})()`);
await esperar(700);
ok('2 el control vertical (6 pasos) llega por la sala', igual(await estado(rec), await esperado(rec, 'gggiih' + 'a'.repeat(6))));
ok('3 sin UDP: el puente no abrio puertos', srv.puente.stats.udpRecibidos === 0);

// Aislamiento: un segundo Centro en OTRA sala no mueve a mesa7
const otro = await abrir(9803, `${base}/?rol=centro&sala=mesa8&clave=${CLAVE}`);
const antes = await rec.ev('window.__rbot.historial().length');
await otro.tecla('ArrowUp'); await esperar(500);
ok('4 un Centro de otra sala no mueve al Receptor', (await rec.ev('window.__rbot.historial().length')) === antes);
ok('4 y el avisa que nadie recibio', /Nadie recibio/.test(await txt(otro, 'estado')), await txt(otro, 'estado'));

// Clave incorrecta
const mala = await abrir(9804, `${base}/?rol=centro&sala=mesa7&clave=incorrecta`);
await esperar(800);
ok('5 clave incorrecta: la interfaz lo dice', /Clave/.test(await txt(mala, 'estado')), await txt(mala, 'estado'));
const antes5 = await rec.ev('window.__rbot.historial().length');
await mala.tecla('ArrowUp'); await esperar(400);
ok('5 y no puede mover el robot', (await rec.ev('window.__rbot.historial().length')) === antes5);

// Reconexion: el receptor se va y vuelve; el centro lo nota
rec.cerrar(); await esperar(500);
ok('6 al irse el receptor el centro es avisado', /desconectado/.test(await txt(cen, 'estado')), await txt(cen, 'estado'));

ok('7 sin errores en la consola del navegador (centro)', cen.consola.filter(Boolean).length === 0, JSON.stringify(cen.consola));
cen.cerrar(); otro.cerrar(); mala.cerrar(); await srv.cerrar();
console.log(`E2E-LAB: ${total} comprobaciones | FALLOS: ${fallos}`);
process.exit(fallos ? 1 : 0);
