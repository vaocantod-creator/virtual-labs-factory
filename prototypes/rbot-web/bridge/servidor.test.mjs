// Pruebas del servidor de laboratorio (HTTP estatico + salas WebSocket). Sin navegador; usa un directorio temporal como raiz.
// Uso: node bridge/servidor.test.mjs
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { crearServidor } from './servidor.mjs';

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let total = 0, fallos = 0;
const ok = (n, c, x = '') => { total++; if (!c) { fallos++; console.log(`  FALLA ${n} ${x}`); } };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbot-srv-'));
const raiz = path.join(tmp, 'dist'); fs.mkdirSync(path.join(raiz, 'assets'), { recursive: true }); fs.mkdirSync(path.join(raiz, 'models'));
fs.writeFileSync(path.join(raiz, 'index.html'), '<!doctype html><title>t</title>');
fs.writeFileSync(path.join(raiz, 'assets', 'index-ABCDEFGH12.js'), 'console.log(1)');
fs.writeFileSync(path.join(raiz, 'models', 'Cuerpo Robot.3DS'), Buffer.from([1, 2, 3]));
fs.writeFileSync(path.join(tmp, 'secreto.txt'), 'NO DEBE SALIR'); // fuera de la raiz

const CLAVE = 'lab-2026';
const s = crearServidor({ raiz, clave: CLAVE, host: '127.0.0.1', port: 0, puente: { 'max-por-sala': 2, 'max-salas': 3, 'max-conexiones': 12, rafaga: 30 } });
const puerto = await s.escuchar();
const base = `http://127.0.0.1:${puerto}`;

const get = (ruta, opciones = {}) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: puerto, path: ruta, method: opciones.metodo ?? 'GET', headers: opciones.headers }, (resp) => {
    const partes = []; resp.on('data', (d) => partes.push(d)); resp.on('end', () => res({ estado: resp.statusCode, cab: resp.headers, cuerpo: Buffer.concat(partes).toString() }));
  }); r.on('error', rej); r.end();
});
// peticion "cruda" para rutas que el cliente HTTP normalizaria (../)
const crudo = (linea) => new Promise((res) => {
  const c = net.connect(puerto, '127.0.0.1', () => c.write(`${linea} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`));
  let d = ''; c.on('data', (b) => (d += b)); c.on('close', () => res(d)); c.on('error', () => res(d)); setTimeout(() => { c.destroy(); res(d); }, 1500);
});

// ---------- HTTP estatico ----------
let r = await get('/');
ok('1 GET / sirve index.html', r.estado === 200 && /<title>t<\/title>/.test(r.cuerpo));
ok('1 tipo de contenido html', /text\/html/.test(r.cab['content-type']));
ok('1 cabeceras de seguridad', r.cab['x-content-type-options'] === 'nosniff' && r.cab['x-frame-options'] === 'DENY' && /default-src 'self'/.test(r.cab['content-security-policy']));
r = await get('/assets/index-ABCDEFGH12.js');
ok('2 asset con hash: cache inmutable', /immutable/.test(r.cab['cache-control']) && /javascript/.test(r.cab['content-type']));
r = await get('/index.html'); ok('2 html sin cache larga', r.cab['cache-control'] === 'no-cache');
r = await get('/models/Cuerpo%20Robot.3DS'); ok('3 modelo con espacio (url-encoded) se sirve', r.estado === 200 && r.cuerpo.length === 3);
r = await get('/no-existe.js'); ok('4 404 para inexistente', r.estado === 404);
r = await get('/models'); ok('4 un directorio no se lista', r.estado === 404 || r.estado === 200 && !/Cuerpo/.test(r.cuerpo));
r = await get('/', { metodo: 'POST' }); ok('5 POST rechazado (405)', r.estado === 405);
r = await get('/', { metodo: 'HEAD' }); ok('5 HEAD ok sin cuerpo', r.estado === 200 && r.cuerpo === '');
for (const [n, linea] of [
  ['6a ../ literal', 'GET /../secreto.txt'], ['6b %2e%2e', 'GET /%2e%2e/secreto.txt'], ['6c ..%2f', 'GET /..%2fsecreto.txt'],
  ['6d %2e%2e%2f', 'GET /%2e%2e%2fsecreto.txt'], ['6e profundo', 'GET /assets/../../secreto.txt'], ['6f doble codif.', 'GET /%252e%252e/secreto.txt'],
  ['6g ruta absoluta', 'GET //etc/passwd'], ['6h NUL', 'GET /index.html%00.png'],
]) { const d = await crudo(linea); ok(`${n}: no filtra el archivo ni /etc/passwd`, !/NO DEBE SALIR|root:/.test(d), d.slice(0, 80)); }
r = await get('/%ZZ'); ok('7 URL mal codificada = 400', r.estado === 400);
r = await get('/salud'); ok('8 /salud informa sin datos sensibles', r.estado === 200 && JSON.parse(r.cuerpo).ok === true && !/clave/i.test(r.cuerpo));

// ---------- WebSocket / salas ----------
function cliente(origen) {
  const ws = new WebSocket(`ws://127.0.0.1:${puerto}`, origen ? { headers: { Origin: origen } } : undefined);
  const msgs = []; ws.onmessage = (e) => msgs.push(JSON.parse(e.data));
  const abierto = new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws')); });
  let cerrado = null; ws.onclose = (e) => { cerrado = e.code; };
  return { ws, msgs, abierto, cerrado: () => cerrado, hola: async (o) => { await abierto; ws.send(JSON.stringify({ t: 'hola', ...o })); await esperar(120); } };
}
const ultimo = (c, t) => [...c.msgs].reverse().find((m) => m.t === t);

const A = cliente(); await A.hola({ rol: 'centro', sala: 'mesa1', clave: CLAVE });
ok('9 hola con clave correcta -> listo en sala', ultimo(A, 'listo')?.sala === 'mesa1' && ultimo(A, 'listo').pares === 0, JSON.stringify(A.msgs));
const B = cliente(); await B.hola({ rol: 'receptor', sala: 'mesa1', clave: CLAVE });
ok('9 el receptor ve que hay companero', ultimo(B, 'listo')?.pares === 1);
ok('9 el centro es avisado de que llego el receptor', ultimo(A, 'par')?.rol === 'receptor' && ultimo(A, 'par').presentes === 1);

// entrega en la misma sala
A.ws.send(JSON.stringify({ t: 'enviar', id: '1', cmd: 'g', ip: '8.8.8.8', puerto: 1 })); await esperar(150);
ok('10 el comando llega al receptor de la sala', B.msgs.some((m) => m.t === 'cmd' && m.cmd === 'g'));
ok('10 ip/puerto se ignoran en sala (no hay UDP: 8.8.8.8 no es un problema)', ultimo(A, 'ok')?.entregados === 1);
ok('10 no hay trafico UDP', s.puente.stats.udpRecibidos === 0);
// retransmision del receptor al centro
B.ws.send(JSON.stringify({ t: 'enviar', id: '2', cmd: 'i' })); await esperar(150);
ok('10 el receptor retransmite al centro de su sala', A.msgs.some((m) => m.t === 'cmd' && m.cmd === 'i'));

// aislamiento entre salas
const C = cliente(); await C.hola({ rol: 'receptor', sala: 'mesa2', clave: CLAVE });
const D = cliente(); await D.hola({ rol: 'centro', sala: 'mesa2', clave: CLAVE });
const antesC = C.msgs.filter((m) => m.t === 'cmd').length, antesB = B.msgs.filter((m) => m.t === 'cmd').length;
D.ws.send(JSON.stringify({ t: 'enviar', id: '3', cmd: 'h' })); await esperar(150);
ok('11 aislamiento: mesa2 recibe', C.msgs.filter((m) => m.t === 'cmd').length === antesC + 1);
ok('11 aislamiento: mesa1 NO recibe lo de mesa2', B.msgs.filter((m) => m.t === 'cmd').length === antesB);
// rol equivocado en la misma sala: un centro no recibe lo que envia otro centro
const A2 = cliente(); await A2.hola({ rol: 'centro', sala: 'mesa1', clave: CLAVE });
const antesA = A.msgs.filter((m) => m.t === 'cmd').length;
A2.ws.send(JSON.stringify({ t: 'enviar', id: '4', cmd: 'g' })); await esperar(150);
ok('12 dos centros: el comando de uno no llega al otro (solo al receptor)', A.msgs.filter((m) => m.t === 'cmd').length === antesA);
// tope por sala (2)
const A3 = cliente(); await A3.hola({ rol: 'centro', sala: 'mesa1', clave: CLAVE });
ok('13 tope por sala: el 3er centro es rechazado', ultimo(A3, 'error')?.motivo.includes('ya tiene 2'), JSON.stringify(A3.msgs));
// envio sin receptor
const E = cliente(); await E.hola({ rol: 'centro', sala: 'sola', clave: CLAVE });
E.ws.send(JSON.stringify({ t: 'enviar', id: '5', cmd: 'g' })); await esperar(150);
ok('14 sin receptor: entregados=0 (la interfaz avisa)', ultimo(E, 'ok')?.entregados === 0);
// tope de salas (3: mesa1, mesa2, sola) -> la 4a se rechaza
const F = cliente(); await F.hola({ rol: 'centro', sala: 'cuarta', clave: CLAVE });
ok('15 tope de salas', /Demasiadas salas/.test(ultimo(F, 'error')?.motivo ?? ''), JSON.stringify(F.msgs));

// clave
const G = cliente(); await G.hola({ rol: 'centro', sala: 'mesa1', clave: 'mala' }); await esperar(150);
ok('16 clave incorrecta -> error y cierre 1008', ultimo(G, 'error')?.motivo.includes('Clave') && G.cerrado() === 1008, `${JSON.stringify(G.msgs)} cierre=${G.cerrado()}`);
const H = cliente(); await H.hola({ rol: 'centro', sala: 'mesa1' }); await esperar(150);
ok('16 sin clave -> rechazado', H.cerrado() === 1008);
const H2 = cliente(); await H2.hola({ rol: 'centro', sala: 'mesa1', clave: ['lab-2026'] }); await esperar(150);
ok('16 clave con tipo raro (array) -> rechazada, sin excepcion', H2.cerrado() === 1008);
ok('16 el mensaje de error no revela la clave', !JSON.stringify([G.msgs, H.msgs]).includes(CLAVE));

// nombres de sala
for (const mal of ['', 'a b', '../x', 'x'.repeat(40), 'sala;DROP', '<script>', 123, null]) {
  const X = cliente(); await X.hola({ rol: 'centro', sala: mal, clave: CLAVE });
  ok(`17 sala invalida ${JSON.stringify(mal)?.slice(0, 20)} rechazada`, !!ultimo(X, 'error') && !ultimo(X, 'listo'), JSON.stringify(X.msgs));
  X.ws.close();
}
// origenes
const mal = new WebSocket(`ws://127.0.0.1:${puerto}`, { headers: { Origin: 'http://sitio-malicioso.example' } });
const resMal = await new Promise((res) => { mal.onopen = () => res('abrio'); mal.onerror = () => res('rechazado'); setTimeout(() => res('timeout'), 1500); });
ok('18 origen ajeno rechazado', resMal === 'rechazado', resMal);
const mismo = new WebSocket(`ws://127.0.0.1:${puerto}`, { headers: { Origin: base } });
const resMismo = await new Promise((res) => { mismo.onopen = () => res('abrio'); mismo.onerror = () => res('rechazado'); setTimeout(() => res('timeout'), 1500); }); mismo.close();
ok('18 mismo origen (la propia web del servidor) aceptado', resMismo === 'abrio', resMismo);

// salida y limpieza
const salasAntes = s.puente.salasActivas();
E.ws.close(); await esperar(200);
ok('19 una sala vacia se elimina', s.puente.salasActivas() === salasAntes - 1);
B.ws.close(); await esperar(200);
ok('19 el centro es avisado al irse el receptor', ultimo(A, 'par')?.presentes === 0);

// frecuencia (30/s)
const J = cliente(); await J.hola({ rol: 'centro', sala: 'rafaga', clave: CLAVE }); J.msgs.length = 0;
for (let i = 0; i < 80; i++) J.ws.send(JSON.stringify({ t: 'enviar', id: 'r' + i, cmd: 'g' }));
await esperar(400);
ok('20 limite de frecuencia en sala', J.msgs.filter((m) => m.t === 'error' && /por segundo/.test(m.motivo)).length >= 40, `${J.msgs.filter((m) => m.t === 'error').length}`);

// tope de conexiones (12): abrir muchas
const muchas = []; for (let i = 0; i < 20; i++) { const c = cliente(); muchas.push(c); }
await esperar(500);
const cerradas = muchas.filter((c) => c.cerrado() === 1013).length;
ok('21 tope de conexiones: las excedentes se cierran con 1013', cerradas > 0, `cerradas=${cerradas}`);
for (const c of muchas) c.ws.close();

// tipos de mensaje malos
const K = cliente(); await K.hola({ rol: 'centro', sala: 'tipos', clave: CLAVE });
for (const m of [{ t: 'enviar', cmd: { x: 1 } }, { t: 'enviar', cmd: 'gg' }, { t: 'enviar', cmd: null }, { t: 'otro' }, 5, null]) K.ws.send(JSON.stringify(m));
await esperar(250);
ok('22 mensajes malformados no tumban el servidor', (await get('/salud')).estado === 200);

for (const c of [A, A2, A3, B, C, D, E, F, G, H, H2, J, K]) try { c.ws.close(); } catch {}
await esperar(200);
await s.cerrar(); fs.rmSync(tmp, { recursive: true, force: true });
console.log(`SERVIDOR: ${total} comprobaciones | FALLOS: ${fallos}`);
process.exit(fallos ? 1 : 0);
