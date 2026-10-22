// Pruebas del puente UDP<->WebSocket con trafico real (loopback). Usa puertos altos para no chocar con Rbot Java.
// Uso: node bridge/puente.test.mjs
import dgram from 'node:dgram';
import { crearPuente, configuracion } from './puente.mjs';

const WS_PUERTO = 18765;
const UDP_RECEPTOR = 25555; // "5555" desplazado
const UDP_CENTRO = 28080; // "8080" desplazado
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let total = 0, fallos = 0;
const ok = (nombre, cond, extra = '') => { total++; if (!cond) { fallos++; console.log(`  FALLA ${nombre} ${extra}`); } };

const puente = crearPuente(configuracion({ 'ws-port': WS_PUERTO, 'puerto-receptor': UDP_RECEPTOR, 'puerto-centro': UDP_CENTRO, silencio: true, rafaga: 20 }));
await puente.listo;

function cliente(rol, extraHeaders) {
  const ws = new WebSocket(`ws://127.0.0.1:${WS_PUERTO}`, extraHeaders ? { headers: extraHeaders } : undefined);
  const msgs = [];
  ws.onmessage = (e) => msgs.push(JSON.parse(e.data));
  const abierto = new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws error')); });
  return { ws, msgs, abierto, hola: async () => { await abierto; ws.send(JSON.stringify({ t: 'hola', rol })); await esperar(150); } };
}
const udp = dgram.createSocket('udp4');
const enviarUdp = (buf, puerto) => new Promise((res) => udp.send(buf, puerto, '127.0.0.1', res));

// 1) hola -> listo, abre el puerto UDP
const r = cliente('receptor'); await r.hola();
const listo = r.msgs.find((m) => m.t === 'listo');
ok('1 listo con puerto', listo && listo.escuchando && listo.puertoLocal === UDP_RECEPTOR, JSON.stringify(listo));

// 2) UDP -> WS: las 10 letras llegan
for (const c of 'abcdefghij') await enviarUdp(Buffer.from(c), UDP_RECEPTOR);
await esperar(200);
const cmds = r.msgs.filter((m) => m.t === 'cmd').map((m) => m.cmd).join('');
ok('2 UDP->WS recibe a..j', cmds === 'abcdefghij', cmds);

// 3) datagramas invalidos se descartan y se informan (como Command.fromCode)
r.msgs.length = 0;
for (const b of [Buffer.from('z'), Buffer.from('ab'), Buffer.from(''), Buffer.from('G'), Buffer.from([0x01]), Buffer.from('g\n'), Buffer.alloc(900, 0x61)]) await enviarUdp(b, UDP_RECEPTOR);
await esperar(250);
ok('3 invalidos: ninguno llega como cmd', r.msgs.filter((m) => m.t === 'cmd').length === 0, JSON.stringify(r.msgs.filter((m) => m.t === 'cmd')));
ok('3 invalidos: se informan', r.msgs.filter((m) => m.t === 'invalido').length >= 5, String(r.msgs.filter((m) => m.t === 'invalido').length));
ok('3 invalidos: texto acotado', r.msgs.filter((m) => m.t === 'invalido').every((m) => m.texto.length <= 24 && /^[\x20-\x7e]*$/.test(m.texto)));

// 4) WS -> UDP: el cliente 'centro' envia y un socket UDP lo recibe
const centro = cliente('centro'); await centro.hola();
const recibidos = [];
const rx = dgram.createSocket('udp4'); rx.on('message', (m) => recibidos.push(m.toString('latin1')));
await new Promise((res) => rx.bind(26001, '127.0.0.1', res));
for (const c of 'ghij') centro.ws.send(JSON.stringify({ t: 'enviar', id: c, cmd: c, ip: '127.0.0.1', puerto: 26001 }));
await esperar(250);
ok('4 WS->UDP entrega 1 byte por comando', recibidos.join('') === 'ghij' && recibidos.every((x) => x.length === 1), JSON.stringify(recibidos));
ok('4 confirmaciones ok', centro.msgs.filter((m) => m.t === 'ok').length === 4);

// 5) validaciones de envio
centro.msgs.length = 0;
const probar = async (msg) => { centro.ws.send(JSON.stringify({ t: 'enviar', id: 'x', ...msg })); await esperar(120); return centro.msgs.pop(); };
let e;
e = await probar({ cmd: 'z', ip: '127.0.0.1', puerto: 26001 }); ok('5a comando desconocido rechazado', e?.t === 'error' && /desconocido/.test(e.motivo), JSON.stringify(e));
e = await probar({ cmd: 'ab', ip: '127.0.0.1', puerto: 26001 }); ok('5b comando de 2 letras rechazado', e?.t === 'error');
e = await probar({ cmd: 'g', ip: '127.0.0.1', puerto: 0 }); ok('5c puerto 0 rechazado', e?.t === 'error' && /rango/.test(e.motivo), JSON.stringify(e));
e = await probar({ cmd: 'g', ip: '127.0.0.1', puerto: 70000 }); ok('5d puerto 70000 rechazado', e?.t === 'error');
e = await probar({ cmd: 'g', ip: '127.0.0.1', puerto: 'abc' }); ok('5e puerto no numerico rechazado', e?.t === 'error');
e = await probar({ cmd: 'g', ip: '8.8.8.8', puerto: 5555 }); ok('5f IP publica rechazada', e?.t === 'error' && /no permitido/.test(e.motivo), JSON.stringify(e));
e = await probar({ cmd: 'g', ip: '192.168.1.13', puerto: 5555 }); ok('5g red privada rechazada por defecto', e?.t === 'error' && /no permitido/.test(e.motivo), JSON.stringify(e));
e = await probar({ cmd: 'g', ip: '10.0.0.5', puerto: 5555 }); ok('5h 10.x rechazada por defecto', e?.t === 'error');
e = await probar({ cmd: 'g', ip: '', puerto: 5555 }); ok('5i IP vacia rechazada', e?.t === 'error');
e = await probar({ cmd: 'g', ip: 'no-existe.invalid', puerto: 5555 }); ok('5j host inexistente rechazado', e?.t === 'error' && /resolver/.test(e.motivo), JSON.stringify(e));
e = await probar({ cmd: 'g', ip: '127.0.0.1', puerto: 26001 }); ok('5k destino valido sigue funcionando', e?.t === 'ok', JSON.stringify(e));
e = await probar({ cmd: 'g', ip: 'localhost', puerto: 26001 }); ok('5l "localhost" se resuelve y se permite', e?.t === 'ok', JSON.stringify(e));

// 6) limite de frecuencia (rafaga=20/s)
centro.msgs.length = 0;
for (let i = 0; i < 40; i++) centro.ws.send(JSON.stringify({ t: 'enviar', id: i, cmd: 'g', ip: '127.0.0.1', puerto: 26001 }));
await esperar(500);
const oks = centro.msgs.filter((m) => m.t === 'ok').length, lim = centro.msgs.filter((m) => m.t === 'error' && /por segundo/.test(m.motivo)).length;
ok('6 limite de frecuencia: acepta <=20 y rechaza el resto', oks <= 20 && lim >= 15, `ok=${oks} limitados=${lim}`);

// 7) mensajes malformados y protocolo
const m1 = cliente('centro'); await m1.abierto;
m1.ws.send('esto no es json'); await esperar(100);
ok('7a JSON invalido -> error', m1.msgs.some((m) => m.t === 'error'));
m1.ws.send(JSON.stringify({ t: 'enviar', cmd: 'g', ip: '127.0.0.1', puerto: 26001 })); await esperar(100);
ok('7b enviar sin "hola" -> error', m1.msgs.some((m) => m.t === 'error' && /hola/.test(m.motivo)));
m1.ws.send(JSON.stringify({ t: 'hola', rol: 'admin' })); await esperar(100);
ok('7c rol invalido -> error', m1.msgs.some((m) => m.t === 'error' && /rol/.test(m.motivo)));
m1.ws.close();

// 8) mensaje demasiado grande cierra la conexion (maxPayload 1024)
const grande = cliente('centro'); await grande.abierto;
let cerrado = false; grande.ws.onclose = () => { cerrado = true; };
grande.ws.send('x'.repeat(5000)); await esperar(300);
ok('8 mensaje >1024 bytes cierra la conexion', cerrado);

// 9) origen no permitido
const mal = new WebSocket(`ws://127.0.0.1:${WS_PUERTO}`, { headers: { Origin: 'http://sitio-malicioso.example' } });
const resultadoMal = await new Promise((res) => { mal.onopen = () => res('abrio'); mal.onerror = () => res('rechazado'); mal.onclose = () => res('rechazado'); setTimeout(() => res('timeout'), 1500); });
ok('9 origen malicioso rechazado', resultadoMal === 'rechazado', resultadoMal);
const bien = new WebSocket(`ws://127.0.0.1:${WS_PUERTO}`, { headers: { Origin: 'http://127.0.0.1:5173' } });
const resultadoBien = await new Promise((res) => { bien.onopen = () => res('abrio'); bien.onerror = () => res('rechazado'); setTimeout(() => res('timeout'), 1500); });
ok('9 origen permitido acepta', resultadoBien === 'abrio', resultadoBien); bien.close();
ok('9 contador de origenes rechazados', puente.stats.wsRechazados >= 1);

// 10) puerto UDP ocupado -> error claro, no excepcion
const ocupante = dgram.createSocket('udp4'); await new Promise((res) => ocupante.bind(UDP_CENTRO + 1, '127.0.0.1', res));
const p2 = crearPuente(configuracion({ 'ws-port': WS_PUERTO + 1, 'puerto-receptor': UDP_CENTRO + 1, 'puerto-centro': UDP_CENTRO + 2, silencio: true })); await p2.listo;
const c2 = new WebSocket(`ws://127.0.0.1:${WS_PUERTO + 1}`); const m2 = []; c2.onmessage = (e) => m2.push(JSON.parse(e.data));
await new Promise((res) => (c2.onopen = res)); c2.send(JSON.stringify({ t: 'hola', rol: 'receptor' })); await esperar(250);
const l2 = m2.find((m) => m.t === 'listo');
ok('10 puerto ocupado -> listo con error legible', l2 && l2.escuchando === false && /en uso/.test(l2.error ?? ''), JSON.stringify(l2));
c2.close(); await p2.cerrar(); ocupante.close();

// 11) liberar el puerto al desconectar el ultimo cliente
r.ws.close(); await esperar(300);
ok('11 puerto UDP del receptor liberado al desconectar', puente.puertoUdp('receptor') === null);
const reabrir = dgram.createSocket('udp4');
const pudo = await new Promise((res) => { reabrir.once('error', () => res(false)); reabrir.bind(UDP_RECEPTOR, '127.0.0.1', () => res(true)); });
ok('11 el puerto se puede volver a usar', pudo); reabrir.close();

centro.ws.close(); rx.close(); udp.close();
await esperar(100); await puente.cerrar();
console.log(`PUENTE: ${total} comprobaciones | FALLOS: ${fallos} | stats ${JSON.stringify(puente.stats)}`);
process.exit(fallos ? 1 : 0);
