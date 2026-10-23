// Ejecuta TODAS las pruebas del prototipo y escribe los resultados en un JSON (fuente de verdad de las cifras: docs/estado.json).
// Uso (desde prototypes/rbot-web, con node_modules y public/models presentes):
//   node tools/correr-todo.mjs --salida ../../docs/.resultados.json [--sin-carga]
// Levanta su propio servidor de desarrollo (puerto 5173) cuando una prueba lo necesita y lo detiene al terminar.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const salida = args.includes('--salida') ? args[args.indexOf('--salida') + 1] : null;
const sinCarga = args.includes('--sin-carga');
const NODE = process.execPath;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const resultados = [];

const PATRONES = [
  [/^(?:PUENTE|SERVIDOR|E2E|E2E-LAB):\s*(\d+) comprobaciones \| FALLOS:\s*(\d+)/m, (m) => ({ total: +m[1], fallos: +m[2] })],
  [/^PROPIEDADES:\s*(\d+) \| FALLOS:\s*(\d+)/m, (m) => ({ total: +m[1], fallos: +m[2] })],
  [/^SECUENCIAS:\s*(\d+) \| FALLOS:\s*(\d+)/m, (m) => ({ total: +m[1], fallos: +m[2] })],
  [/comandos enviados=(\d+) \| entregados=(\d+) \| perdidos=(\d+)/m, (m) => ({ total: +m[1], fallos: +m[3], entregados: +m[2] })],
];

function correr(id, descripcion, comando, argv, extra = {}) {
  const t0 = Date.now();
  const r = spawnSync(NODE, argv, { encoding: 'utf8', timeout: 600000, maxBuffer: 20 * 1024 * 1024 });
  const texto = `${r.stdout ?? ''}\n${r.stderr ?? ''}`;
  let parsed = null;
  for (const [re, f] of PATRONES) { const m = texto.match(re); if (m) { parsed = f(m); break; } }
  const ok = r.status === 0 && (parsed ? parsed.fallos === 0 : true);
  const fila = {
    id, descripcion, comando, ...(parsed ?? { total: null, fallos: null }), ...extra,
    codigo_salida: r.status, ok, segundos: Math.round((Date.now() - t0) / 100) / 10, ejecutado: new Date().toISOString(),
    ...(ok ? {} : { cola_salida: texto.trim().split('\n').slice(-6).join('\n').slice(0, 600) }),
  };
  resultados.push(fila);
  console.log(`${ok ? 'OK ' : 'FALLA'} ${id}: ${parsed ? `${parsed.total} (fallos ${parsed.fallos})` : `sin cifras (salida ${r.status})`} [${fila.segundos}s]`);
  return fila;
}

// 1) tipos y compilacion
correr('tipos', 'TypeScript estricto sin errores', 'tsc --noEmit', ['node_modules/typescript/bin/tsc', '--noEmit']);
correr('compilacion', 'Compilacion de produccion (vite build)', 'vite build', ['node_modules/vite/bin/vite.js', 'build']);

// 2) pruebas que no necesitan servidor de desarrollo
correr('puente', 'Puente UDP<->WebSocket (comprobaciones)', 'node bridge/puente.test.mjs', ['bridge/puente.test.mjs']);
correr('servidor', 'Servidor de laboratorio y salas (comprobaciones)', 'node bridge/servidor.test.mjs', ['bridge/servidor.test.mjs']);
correr('e2e-lab', 'Modo laboratorio extremo a extremo, dos navegadores (comprobaciones)', 'node tools/e2e-lab.mjs', ['tools/e2e-lab.mjs']);

// 3) pruebas que necesitan el servidor de desarrollo
const vite = spawn(NODE, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5173', '--strictPort'], { stdio: 'ignore' });
let listo = false;
for (let i = 0; i < 40 && !listo; i++) { try { listo = (await fetch('http://127.0.0.1:5173/')).ok; } catch {} if (!listo) await esperar(500); }
if (!listo) console.log('AVISO: el servidor de desarrollo no arranco; se omiten las pruebas que lo requieren');
else {
  correr('propiedades', 'Propiedades del comportamiento de comandos (ADR-0002)', 'node tools/propiedades.mjs', ['tools/propiedades.mjs']);
  correr('paridad', 'Paridad numerica con el codigo Java real, secuencias (modo legado)', 'node tools/comparar.mjs ../rbot-oracle/oraculo-77-secuencias.json 1e-9', ['tools/comparar.mjs', '../rbot-oracle/oraculo-77-secuencias.json', '1e-9']);
  correr('e2e', 'Centro de Mando y Receptor extremo a extremo con UDP real (comprobaciones)', 'node tools/e2e.mjs', ['tools/e2e.mjs']);
}
vite.kill('SIGTERM');

// 4) carga (opcional): mide entrega, no es una prueba de comprobaciones
if (!sinCarga) correr('carga-15', 'Carga: 15 parejas, 200 comandos cada una a 20 cmd/s (comandos entregados)', 'node tools/carga.mjs 15 200 50', ['tools/carga.mjs', '15', '200', '50']);

const todoOk = resultados.every((r) => r.ok);
const doc = { generado: new Date().toISOString(), node: process.version, todo_ok: todoOk, resultados };
if (salida) { fs.mkdirSync(path.dirname(path.resolve(salida)), { recursive: true }); fs.writeFileSync(salida, JSON.stringify(doc, null, 2) + '\n'); console.log(`Resultados en ${salida}`); }
console.log(todoOk ? 'TODO OK' : 'HAY FALLOS');
process.exit(todoOk ? 0 : 1);
