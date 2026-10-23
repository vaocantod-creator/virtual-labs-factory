// Prueba de carga del servidor de laboratorio: N salas (Centro + Receptor) enviando comandos a la vez. Mide latencia extremo a extremo y perdidas.
// Uso: node tools/carga.mjs [salas=40] [comandos_por_centro=200] [intervalo_ms=50]
import { crearServidor } from '../bridge/servidor.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SALAS = Number(process.argv[2] ?? 40), N = Number(process.argv[3] ?? 200), INTERVALO = Number(process.argv[4] ?? 50);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbot-carga-')); fs.writeFileSync(path.join(tmp, 'index.html'), 'x');
const srv = crearServidor({ raiz: tmp, clave: 'k', host: '127.0.0.1', port: 0, puente: { 'max-salas': SALAS + 5, 'max-conexiones': SALAS * 2 + 10, rafaga: 1000 } });
const puerto = await srv.escuchar();
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const letras = 'abcdefghij';
const lat = []; let recibidos = 0, enviados = 0, errores = 0;
const abrir = (rol, sala) => new Promise((res, rej) => {
  const ws = new WebSocket(`ws://127.0.0.1:${puerto}`);
  const c = { ws, rol, sala, pendientes: new Map(), ok: false };
  ws.onopen = () => ws.send(JSON.stringify({ t: 'hola', rol, sala, clave: 'k' }));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.t === 'listo') { c.ok = true; res(c); }
    else if (m.t === 'cmd' && rol === 'receptor') { recibidos++; const t0 = c.pendientes.get(m.cmd + ':' + m.n); }
    else if (m.t === 'error') errores++;
  };
  ws.onerror = () => rej(new Error('ws'));
});

const t0 = performance.now();
const pares = [];
for (let i = 0; i < SALAS; i++) pares.push([await abrir('receptor', 'mesa' + i), await abrir('centro', 'mesa' + i)]);
console.log(`${SALAS * 2} conexiones abiertas en ${(performance.now() - t0).toFixed(0)} ms`);

// Latencia: cada Receptor mide con un reloj compartido (mismo proceso) usando la marca de tiempo en el campo "cmd" no es posible (1 letra);
// se mide por eco: el centro envia, el receptor (mismo proceso) registra la hora de llegada de la N-esima orden.
const llegada = pares.map(() => []);
pares.forEach(([r], i) => { r.ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.t === 'cmd') llegada[i].push(performance.now()); }); });
const salida = pares.map(() => []);

const t1 = performance.now();
await Promise.all(pares.map(async ([, c], i) => {
  for (let k = 0; k < N; k++) {
    salida[i].push(performance.now());
    c.ws.send(JSON.stringify({ t: 'enviar', id: String(k), cmd: letras[k % 10] }));
    enviados++;
    if (INTERVALO) await esperar(INTERVALO);
  }
}));
await esperar(800);
const dur = (performance.now() - t1) / 1000;
for (let i = 0; i < SALAS; i++) for (let k = 0; k < Math.min(salida[i].length, llegada[i].length); k++) lat.push(llegada[i][k] - salida[i][k]);
lat.sort((a, b) => a - b);
const pct = (q) => lat[Math.min(lat.length - 1, Math.floor(lat.length * q))].toFixed(1);
const mem = process.memoryUsage();
console.log(`salas=${SALAS} | comandos enviados=${enviados} | entregados=${llegada.flat().length} | perdidos=${enviados - llegada.flat().length} | errores=${errores}`);
console.log(`duracion=${dur.toFixed(1)} s | ${(enviados / dur).toFixed(0)} comandos/s en total`);
console.log(`latencia ms: p50=${pct(0.5)} p95=${pct(0.95)} p99=${pct(0.99)} max=${lat[lat.length - 1].toFixed(1)}`);
console.log(`memoria: rss=${(mem.rss / 1048576).toFixed(0)} MB, heap=${(mem.heapUsed / 1048576).toFixed(0)} MB`);
for (const [r, c] of pares) { r.ws.close(); c.ws.close(); }
await esperar(300);
console.log(`salas tras desconectar: ${srv.puente.salasActivas()} (debe ser 0)`);
await srv.cerrar(); fs.rmSync(tmp, { recursive: true, force: true });
process.exit(enviados === llegada.flat().length && errores === 0 && srv.puente.salasActivas() === 0 ? 0 : 1);
