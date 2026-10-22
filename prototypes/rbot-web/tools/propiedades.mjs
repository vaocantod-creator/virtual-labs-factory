// Propiedades del comportamiento MEJORADO (ADR-0002). Se ejecutan en el navegador sin pantalla.
// Uso: node tools/propiedades.mjs     (requiere el servidor dev en 127.0.0.1:5173)
import { spawn } from 'node:child_process';

const CHROME = '/opt/data/tools/chromium-1208/chrome-linux64/chrome';
const URL = 'http://127.0.0.1:5173/';
const PUERTO = 9666;
const TOL = 1e-6;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn(CHROME, ['--headless=new', '--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${PUERTO}`, '--user-data-dir=/tmp/rbot-chrome-props', 'about:blank'], { stdio: 'ignore' });
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

const cache = new Map();
async function est(sec, modo = 'mejorado') {
  const k = modo + '|' + sec;
  if (!cache.has(k)) cache.set(k, JSON.parse(await ev(`JSON.stringify(window.__rbot.probar(${JSON.stringify(sec)}, ${JSON.stringify(modo)}))`)));
  return cache.get(k);
}
function aplanar(e) {
  const v = [];
  for (const k of ['cuerpo', 'ecmBase', 'cremallera', 'camara', 'elevador', 'engranajeBase', 'vistaCercana']) v.push(...e[k]);
  for (const k of ['g6', 'g2', 'g3', 'g4']) v.push(...e.vistaPrimera[k]);
  return v;
}
function dif(a, b) {
  let d = 0; const x = aplanar(a), y = aplanar(b);
  for (let i = 0; i < x.length; i++) d = Math.max(d, Math.abs(x[i] - y[i]));
  const disc = ['eslabonesDer', 'eslabonesIzq', 'ruedas'].every((k) => JSON.stringify(a[k]) === JSON.stringify(b[k]));
  return disc ? d : Infinity;
}
const inv = { g: 'h', h: 'g', i: 'j', j: 'i', a: 'b', b: 'a', c: 'd', d: 'c', e: 'f', f: 'e' };
const contrario = (s) => [...s].reverse().map((c) => inv[c]).join('');

function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry32(777);
const azar = (letras, n) => Array.from({ length: n }, () => letras[Math.floor(rnd() * letras.length)]).join('');

let total = 0, fallos = 0;
function chequear(nombre, ok, detalle = '') {
  total++;
  if (!ok) { fallos++; console.log(`  FALLA ${nombre} ${detalle}`); }
}
const vacio = await est('');

// P1: un comando contrario deshace exactamente al anterior (estado inicial)
for (const [a, b] of [['g', 'h'], ['h', 'g'], ['i', 'j'], ['j', 'i'], ['a', 'b'], ['b', 'a'], ['c', 'd'], ['d', 'c'], ['e', 'f'], ['f', 'e']]) {
  const d = dif(await est(a + b), vacio);
  chequear(`P1 ${a}${b} vuelve al inicio`, d < TOL, `dif=${d}`);
}
// P2: el efecto de un comando no depende del historial: prefijo + par contrario == prefijo
for (let n = 0; n < 30; n++) {
  const pref = azar('ghijabcdef', 3 + Math.floor(rnd() * 14));
  const par = ['gh', 'hg', 'ij', 'ji', 'ab', 'ba', 'cd', 'dc', 'ef', 'fe'][n % 10];
  const d = dif(await est(pref + par), await est(pref));
  chequear(`P2 "${pref}"+${par} == "${pref}"`, d < TOL, `dif=${d}`);
}
// P3: secuencia cualquiera de movimiento (sin saturar la camara) seguida de su inversa en orden inverso vuelve al inicio
for (let n = 0; n < 30; n++) {
  const s = azar('ghijabcdef', 4 + Math.floor(rnd() * 14));
  const d = dif(await est(s + contrario(s)), vacio);
  chequear(`P3 "${s}"+inversa vuelve al inicio`, d < TOL, `dif=${d}`);
}
// P4: magnitud fija por comando (lineal): n avances desplazan n*4 y no dependen del primero
for (const n of [1, 2, 3, 10]) {
  const e = await est('g'.repeat(n));
  chequear(`P4 ${n}x g desplaza ${-4 * n} en X`, Math.abs(e.cuerpo[3] - (-4 * n)) < TOL, `tx=${e.cuerpo[3]}`);
  const r = await est('h'.repeat(n));
  chequear(`P4 ${n}x h desplaza ${4 * n} en X`, Math.abs(r.cuerpo[3] - 4 * n) < TOL, `tx=${r.cuerpo[3]}`);
}
const giro = (m) => (Math.atan2(m[4], m[0]) * 180) / Math.PI;
for (const n of [1, 3, 10]) {
  const e = await est('i'.repeat(n));
  chequear(`P4 ${n}x i gira ${-4 * n} grados`, Math.abs(giro(e.cuerpo) - (-4 * n)) < 1e-6, `giro=${giro(e.cuerpo)}`);
  const f = await est('j'.repeat(n));
  chequear(`P4 ${n}x j gira ${4 * n} grados`, Math.abs(giro(f.cuerpo) - 4 * n) < 1e-6, `giro=${giro(f.cuerpo)}`);
}
// P5: la camara reacciona al PRIMER comando (sin retraso de un paso)
{
  const a1 = await est('a'); chequear('P5 un solo "a" sube la cremallera 0.1', Math.abs(a1.cremallera[11] - 17.1) < 1e-6, `z=${a1.cremallera[11]}`);
  const c1 = await est('c'); chequear('P5 un solo "c" gira la base de camara 2 grados', Math.abs(giro(c1.ecmBase) - (-108)) < 1e-4, `giro=${giro(c1.ecmBase)}`);
  const e1 = await est('e'); chequear('P5 un solo "e" mueve la camara', dif(e1, vacio) > 1e-3, `dif=${dif(e1, vacio)}`);
}
// P6: sentido consistente (c y d son opuestos; a y b; e y f)
{
  const c2 = giro((await est('cc')).ecmBase), d2 = giro((await est('dd')).ecmBase);
  chequear('P6 c y d giran en sentidos opuestos', Math.sign(c2 + 110) === -Math.sign(d2 + 110) && c2 !== d2, `c=${c2} d=${d2}`);
  const a2 = (await est('aa')).cremallera[11], b2 = (await est('bb')).cremallera[11];
  chequear('P6 a y b mueven la cremallera en sentidos opuestos', (a2 - 17) * (b2 - 17) < 0, `a=${a2} b=${b2}`);
}
// P7: la camara y el movimiento del cuerpo son independientes (conmutan)
for (const [x, y] of [['gga', 'agg'], ['iic', 'cii'], ['ghe', 'egh'], ['jjf', 'fjj']]) {
  const d = dif(await est(x), await est(y));
  chequear(`P7 ${x} == ${y}`, d < TOL, `dif=${d}`);
}
// P8: limites del Centro de Mando: saturan y siguen siendo reversibles desde el limite
{
  const s90 = await est('c'.repeat(45)), s200 = await est('c'.repeat(200));
  chequear('P8 azimut satura en +90 (200x c == 45x c)', dif(s90, s200) < TOL, `dif=${dif(s90, s200)}`);
  const v = await est('a'.repeat(58)), v2 = await est('a'.repeat(300));
  chequear('P8 vertical satura en 5.8 (300x a == 58x a)', dif(v, v2) < TOL);
  const e1 = await est('e'.repeat(25)), e2 = await est('e'.repeat(90));
  chequear('P8 elevacion satura en +50 (90x e == 25x e)', dif(e1, e2) < TOL);
  chequear('P8 tras saturar (45 pasos), un "d" revierte UN paso real (44), no 155', dif(await est('c'.repeat(200) + 'd'), await est('c'.repeat(44))) < TOL);
  chequear('P8 tras saturar, "dd" deja 43 pasos', dif(await est('c'.repeat(200) + 'dd'), await est('c'.repeat(43))) < TOL);
}
// P8b: sin deriva de redondeo: ir hasta el limite y volver pasa EXACTAMENTE por el mismo estado
{
  const ida = await est('a'.repeat(58)), vuelta = await est('a'.repeat(58) + 'b'.repeat(58));
  chequear('P8b 58x a + 58x b == inicio (sin deriva float)', dif(vuelta, vacio) < 1e-12, `dif=${dif(vuelta, vacio)}`);
  chequear('P8b 58x a llega exactamente a 5.8 (un valor f32)', Math.abs(ida.cremallera[11] - 22.8) < 1e-5, `z=${ida.cremallera[11]}`);
  const largo = 'ab'.repeat(500);
  chequear('P8b 1000 comandos alternados a/b vuelven al inicio', dif(await est(largo), vacio) < 1e-12, `dif=${dif(await est(largo), vacio)}`);
}
// P9: el modo legado conserva el comportamiento original (sirve de control negativo: debe FALLAR las propiedades de reversion)
{
  const gh = await est('gh', 'legado');
  chequear('P9 (control) modo legado: "gh" NO vuelve al inicio', dif(gh, vacio) > 1, `tx=${gh.cuerpo[3]}`);
  const c1 = await est('c', 'legado');
  chequear('P9 (control) modo legado: un solo "c" no mueve la camara', dif(c1, vacio) < 1e-9);
}

console.log(`PROPIEDADES: ${total} | FALLOS: ${fallos} | tolerancia ${TOL}`);
ws.close(); proc.kill();
process.exit(fallos ? 1 : 0);
