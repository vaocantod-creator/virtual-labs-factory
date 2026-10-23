#!/usr/bin/env node
/**
 * Servidor de laboratorio de Rbot Web (ADR-0004): sirve la aplicacion compilada (`dist/`) y el puente en UN solo puerto HTTP.
 * Los estudiantes solo abren una URL en el navegador; no instalan nada.
 *
 *   node bridge/servidor.mjs --host 0.0.0.0 --port 8080 --clave <clave>
 *
 * Por defecto: solo 127.0.0.1, salas habilitadas, sin UDP. Si se expone a la red SIN clave, avisa en el arranque.
 * TLS: este proceso habla HTTP. Para HTTPS (necesario para WebXR fuera de localhost) se pone un proxy delante (ver docs/14).
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { crearPuente, configuracion } from './puente.mjs';

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.3ds': 'application/octet-stream', '.ico': 'image/x-icon', '.map': 'application/json',
};
const CABECERAS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  // La app solo carga recursos propios y abre WebSocket al mismo servidor.
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
};

export function crearServidor({ raiz, clave = '', host = '127.0.0.1', port = 8080, puente = {}, silencio = true } = {}) {
  const base = path.resolve(raiz);
  const servidor = http.createServer((req, res) => {
    const salir = (codigo, txt, extra = {}) => { res.writeHead(codigo, { 'Content-Type': 'text/plain; charset=utf-8', ...CABECERAS, ...extra }); res.end(txt); };
    if (req.method !== 'GET' && req.method !== 'HEAD') return salir(405, 'Metodo no permitido', { Allow: 'GET, HEAD' });
    let ruta;
    try { ruta = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname); } catch { return salir(400, 'Solicitud invalida'); }
    if (ruta.includes('\0')) return salir(400, 'Solicitud invalida');
    if (ruta === '/salud') return salir(200, JSON.stringify({ ok: true, conexiones: p.conexiones(), salas: p.salasActivas() }), { 'Content-Type': 'application/json' });
    if (ruta.endsWith('/')) ruta += 'index.html';
    const archivo = path.resolve(base, '.' + path.sep + ruta.replace(/^\/+/, ''));
    // Contencion: el archivo resuelto debe estar DENTRO de la raiz (evita ../ y rutas absolutas).
    if (archivo !== base && !archivo.startsWith(base + path.sep)) return salir(403, 'Prohibido');
    fs.stat(archivo, (err, st) => {
      if (err || !st.isFile()) return salir(404, 'No encontrado');
      const ext = path.extname(archivo).toLowerCase();
      const hash = /\/assets\/.+-[A-Za-z0-9_-]{8,}\./.test(ruta);
      res.writeHead(200, {
        'Content-Type': TIPOS[ext] ?? 'application/octet-stream',
        'Content-Length': st.size,
        'Cache-Control': hash ? 'public, max-age=31536000, immutable' : 'no-cache',
        ...CABECERAS,
      });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(archivo).on('error', () => res.destroy()).pipe(res);
    });
  });
  servidor.requestTimeout = 15000;
  servidor.headersTimeout = 10000;
  const p = crearPuente(configuracion({ salas: true, silencio, clave, ...puente, host, server: servidor }));
  return {
    servidor, puente: p,
    escuchar: () => new Promise((res, rej) => { servidor.once('error', rej); servidor.listen(port, host, () => res(servidor.address().port)); }),
    cerrar: async () => { await p.cerrar(); await new Promise((r) => { servidor.close(r); servidor.closeAllConnections?.(); }); },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) { const [k, v] = argv[i].slice(2).split('='); a[k] = v ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true); }
  if (a.ayuda) {
    console.log(`Servidor de laboratorio de Rbot Web
  --host 127.0.0.1     interfaz (0.0.0.0 para toda la red del laboratorio)
  --port 8080          puerto HTTP (aplicacion + WebSocket)
  --clave X            clave del laboratorio (o variable RBOT_CLAVE); recomendada si no es 127.0.0.1
  --raiz dist          carpeta con la aplicacion compilada
  --max-conexiones 300 --max-salas 100 --max-por-sala 8
  --origen a,b         origenes adicionales permitidos (el propio servidor siempre se acepta)`);
    process.exit(0);
  }
  const aqui = path.dirname(fileURLToPath(import.meta.url));
  const raiz = path.resolve(a.raiz ?? path.join(aqui, '..', 'dist'));
  if (!fs.existsSync(path.join(raiz, 'index.html'))) { console.error(`No hay aplicacion compilada en ${raiz}. Ejecuta: npm run build`); process.exit(1); }
  const host = a.host ?? '127.0.0.1';
  const clave = typeof a.clave === 'string' ? a.clave : (process.env.RBOT_CLAVE ?? '');
  const s = crearServidor({
    raiz, clave, host, port: Number(a.port ?? 8080), silencio: false,
    puente: {
      'max-conexiones': a['max-conexiones'], 'max-salas': a['max-salas'], 'max-por-sala': a['max-por-sala'],
      ...(typeof a.origen === 'string' ? { origen: a.origen } : {}),
    },
  });
  s.escuchar().then((puerto) => {
    console.log(`Rbot Web (laboratorio): http://${host === '0.0.0.0' ? '<IP-de-este-equipo>' : host}:${puerto}/   (raiz: ${raiz})`);
    if (host !== '127.0.0.1' && host !== 'localhost' && !clave) console.warn('AVISO: expuesto a la red SIN clave: cualquiera que llegue a este puerto puede crear salas. Usa --clave.');
    if (host !== '127.0.0.1' && host !== 'localhost') console.warn('AVISO: HTTP sin cifrar (la clave viaja en claro por la red local). Para WebXR o redes no confiables, usa HTTPS con un proxy.');
  }).catch((e) => { console.error('No se pudo iniciar:', e.code === 'EADDRINUSE' ? `el puerto ${a.port ?? 8080} esta en uso` : e.message); process.exit(1); });
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { await s.cerrar(); process.exit(0); });
}
