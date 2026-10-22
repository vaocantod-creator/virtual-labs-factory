// Prueba extremo a extremo: dos paginas (Centro de Mando y Receptor) + puente + UDP real + un cliente Java del JDK.
// Uso: node tools/e2e.mjs   (requiere el servidor dev en 127.0.0.1:5173; usa los puertos reales 5555 y 8080 en loopback)
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile); // NO usar execFileSync: bloquearia el bucle de eventos donde corre el puente
import dgram from 'node:dgram';
import fs from 'node:fs';
import { crearPuente, configuracion } from '../bridge/puente.mjs';

const CHROME = process.env.CHROME ?? '/opt/data/tools/chromium-1208/chrome-linux64/chrome';
const JAVA = process.env.JAVA_HOME ? `${process.env.JAVA_HOME}/bin` : '/opt/data/tools/java/jdk-17.0.21+9/bin';
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let total = 0, fallos = 0;
const ok = (n, c, x = '') => { total++; if (!c) { fallos++; console.log(`  FALLA ${n} ${x}`); } };

async function abrir(puertoDbg, url) {
  const proc = spawn(CHROME, ['--headless=new', '--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    `--remote-debugging-port=${puertoDbg}`, `--user-data-dir=/tmp/rbot-e2e-${puertoDbg}`, '--window-size=1200,800', 'about:blank'], { stdio: 'ignore' });
  let u; for (let i = 0; i < 60 && !u; i++) { try { u = (await (await fetch(`http://127.0.0.1:${puertoDbg}/json`)).json()).find((x) => x.type === 'page')?.webSocketDebuggerUrl; } catch {} if (!u) await esperar(250); }
  const ws = new WebSocket(u); let id = 0; const p = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && p.has(d.id)) { p.get(d.id)(d); p.delete(d.id); } };
  await new Promise((r) => (ws.onopen = r));
  const c = (m, pr = {}) => new Promise((r) => { const i = ++id; p.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: pr })); });
  const ev = async (e) => (await c('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;
  await c('Page.enable'); await c('Page.navigate', { url });
  for (let i = 0; i < 160 && (await ev('window.__rbot&&window.__rbot.listo===true')) !== true; i++) await esperar(500);
  const tecla = async (key, code) => { for (const type of ['keyDown', 'keyUp']) await c('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: { ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39 }[key] }); };
  return { ev, tecla, cerrar: () => { ws.close(); proc.kill(); } };
}
const estado = async (pag) => JSON.parse(await pag.ev('JSON.stringify(window.__rbot.estado())'));
const esperado = async (pag, sec) => JSON.parse(await pag.ev(`JSON.stringify(window.__rbot.probar(${JSON.stringify(sec)}))`));
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const puente = crearPuente(configuracion({ silencio: true }));
await puente.listo;

const rec = await abrir(9701, 'http://127.0.0.1:5173/?rol=receptor');
const cen = await abrir(9702, 'http://127.0.0.1:5173/?rol=centro');
await esperar(1200);

const txt = (pag, id) => pag.ev(`document.getElementById('${id}').textContent`);
ok('1 receptor escucha en 5555', (await txt(rec, 'puertoLocal')) === '5555', await txt(rec, 'puertoLocal'));
ok('1 centro escucha en 8080', (await txt(cen, 'puertoLocal')) === '8080', await txt(cen, 'puertoLocal'));
ok('1 receptor: destino por defecto 8080', (await rec.ev(`document.getElementById('puertoDestino').value`)) === '8080');
ok('1 centro: destino por defecto 5555', (await cen.ev(`document.getElementById('puertoDestino').value`)) === '5555');

// 2) Teclado en el Centro -> UDP -> puente -> Receptor ejecuta
for (const [k, n] of [['ArrowUp', 3], ['ArrowRight', 2]]) for (let i = 0; i < n; i++) await cen.tecla(k);
await esperar(600);
let e = await estado(rec), x = await esperado(rec, 'gggii');
ok('2 flechas del Centro mueven el Receptor (gggii)', igual(e, x), `hist=${await rec.ev('JSON.stringify(window.__rbot.historial())')}`);
ok('2 el Receptor no es el "Centro": su estado no es el inicial', !igual(e, await esperado(rec, '')));

// 3) Retransmision: el receptor reenvia cada comando a 8080 -> el puente lo recibe como rol "centro"
const udpAntes = puente.stats.udpRecibidos;
await cen.tecla('ArrowDown'); await esperar(500);
ok('3 el Receptor retransmite (EnvironmentReceiver.retransmit): llega al puerto 8080', puente.stats.udpRecibidos > udpAntes, `${udpAntes}->${puente.stats.udpRecibidos}`);

// 4) Salto de un control: el Centro emite TODOS los pasos intermedios, el Receptor queda sincronizado
await cen.ev(`(()=>{const el=document.getElementById('mv'); el.value='10'; el.dispatchEvent(new Event('input'));})()`);
await esperar(700);
e = await estado(rec); x = await esperado(rec, 'gggiih' + 'a'.repeat(10));
ok('4 salto 0->10 del control vertical = 10 comandos "a"', igual(e, x));
ok('4 el control muestra el valor ajustado', (await txt(cen, 'mvv')) === '10');
await cen.ev(`(()=>{const el=document.getElementById('az'); el.value='-14'; el.dispatchEvent(new Event('input'));})()`);
await esperar(700);
e = await estado(rec); x = await esperado(rec, 'gggiih' + 'a'.repeat(10) + 'd'.repeat(7));
ok('4 azimut 0 -> -14 = 7 comandos "d"', igual(e, x));
// limite: pedir 99 en vertical con max 58 -> solo llega a 58
await cen.ev(`(()=>{const el=document.getElementById('mv'); el.max='99'; el.value='99'; el.dispatchEvent(new Event('input'));})()`);
await esperar(1500);
ok('4 el control no sobrepasa el limite 58', (await txt(cen, 'mvv')) === '58', await txt(cen, 'mvv'));
e = await estado(rec); x = await esperado(rec, 'gggiih' + 'a'.repeat(58) + 'd'.repeat(7));
ok('4 el Receptor llego exactamente a 58 pasos (48 mas)', igual(e, x));

// 5) Datagrama de un tercero (no es la pagina): UDP crudo a 5555
const raw = dgram.createSocket('udp4');
const antes = await rec.ev('window.__rbot.historial().length');
await new Promise((r) => raw.send(Buffer.from('g'), 5555, '127.0.0.1', r));
await esperar(400);
ok('5 un datagrama UDP crudo "g" mueve al Receptor', (await rec.ev('window.__rbot.historial().length')) === antes + 1);
await new Promise((r) => raw.send(Buffer.from('zz'), 5555, '127.0.0.1', r));
await esperar(400);
ok('5 un datagrama invalido no cambia el estado', (await rec.ev('window.__rbot.historial().length')) === antes + 1);
ok('5 y se avisa en la interfaz', /desconocido/i.test(await txt(rec, 'estado')), await txt(rec, 'estado'));
raw.close();

// 6) Cliente Java real (JDK): envia 'g' como lo hace Rbot (String.getBytes) y escucha la retransmision en 28081
fs.mkdirSync('/tmp/rbot-e2e-java', { recursive: true });
fs.writeFileSync('/tmp/rbot-e2e-java/Eco.java', `
import java.net.*;
public class Eco { public static void main(String[] a) throws Exception {
  DatagramSocket rx = new DatagramSocket(28081, InetAddress.getByName("127.0.0.1")); rx.setSoTimeout(4000);
  DatagramSocket tx = new DatagramSocket();
  byte[] b = "g".getBytes(); // igual que Transmitter.java
  tx.send(new DatagramPacket(b, b.length, InetAddress.getByName("127.0.0.1"), 5555));
  DatagramPacket p = new DatagramPacket(new byte[64], 64); rx.receive(p);
  System.out.println("JAVA_RECIBIO:" + new String(p.getData(), 0, p.getLength()) + ":" + p.getLength());
} }`);
await rec.ev(`document.getElementById('puertoDestino').value='28081'`);
const antes6 = await rec.ev('window.__rbot.historial().length');
try {
  await execFileAsync(`${JAVA}/javac`, ['-d', '/tmp/rbot-e2e-java', '/tmp/rbot-e2e-java/Eco.java']);
  const salida = (await execFileAsync(`${JAVA}/java`, ['-cp', '/tmp/rbot-e2e-java', 'Eco'], { encoding: 'utf8', timeout: 20000 })).stdout.trim();
  ok('6 Java real: el Receptor ejecuta y RETRANSMITE el mismo byte', salida === 'JAVA_RECIBIO:g:1', salida);
} catch (err) { ok('6 cliente Java', false, String(err.message).slice(0, 200)); }
ok('6 y el comando se ejecuto en la escena', (await rec.ev('window.__rbot.historial().length')) === antes6 + 1);

// 7) Destino invalido en el Centro: se rechaza y no se envia nada
const enviadosAntes = puente.stats.enviados;
await cen.ev(`document.getElementById('puertoDestino').value='99999'`);
await cen.tecla('ArrowUp'); await esperar(300);
ok('7 puerto 99999 no se envia', puente.stats.enviados === enviadosAntes);
ok('7 y se avisa', /rango|invalido/i.test(await txt(cen, 'estado')), await txt(cen, 'estado'));
await cen.ev(`document.getElementById('puertoDestino').value='8.8.8.8'`);
await cen.ev(`document.getElementById('ipDestino').value='8.8.8.8'; document.getElementById('puertoDestino').value='5555'`);
await cen.tecla('ArrowUp'); await esperar(400);
ok('7 IP publica rechazada por el puente', puente.stats.enviados === enviadosAntes && /no permitido/i.test(await txt(cen, 'estado')), await txt(cen, 'estado'));

// 8) Teclas no deben dispararse si se edita un campo de texto
await cen.ev(`document.getElementById('ipDestino').value='127.0.0.1'; document.getElementById('puertoDestino').value='5555'; document.getElementById('ipDestino').focus()`);
const h8 = await rec.ev('window.__rbot.historial().length');
await cen.tecla('ArrowUp'); await esperar(300);
ok('8 con un campo de texto enfocado, las flechas no envian', (await rec.ev('window.__rbot.historial().length')) === h8);

rec.cerrar(); cen.cerrar(); await puente.cerrar();
console.log(`E2E: ${total} comprobaciones | FALLOS: ${fallos}`);
process.exit(fallos ? 1 : 0);
