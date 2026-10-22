#!/usr/bin/env node
/**
 * Puente UDP <-> WebSocket de Rbot (ADR-0003).
 *
 * El navegador no puede abrir sockets UDP. Este proceso hace de intermediario SIN cambiar el protocolo de Rbot:
 * sigue siendo UDP, una letra a..j por datagrama, en los puertos 5555 (Entorno Experimental / Receptor) y 8080 (Centro de Mando).
 * Asi un Centro de Mando Java y un Entorno web (o al reves) interoperan sin tocar el repo Java.
 *
 *   navegador (rol receptor) <--WS--> puente <--UDP:5555--> Centro de Mando Java
 *   navegador (rol centro)   <--WS--> puente <--UDP:8080--> Entorno Experimental Java
 *
 * Seguridad (el puente abre puertos de red, por eso es restrictivo por defecto):
 *  - WebSocket y UDP escuchan SOLO en 127.0.0.1 (usar --udp-host 0.0.0.0 para recibir de otras maquinas de la LAN).
 *  - Solo se aceptan datagramas de EXACTAMENTE una letra a..j (igual que Command.fromCode de Rbot); el resto se descarta y se avisa.
 *  - Solo se envia a loopback (127.0.0.0/8); redes privadas solo con --permitir-lan. Nunca a internet.
 *  - Los navegadores deben venir de un origen permitido (--origen); sin cabecera Origin (herramientas locales) se acepta.
 *  - Limite de frecuencia por cliente y de tamano de mensaje.
 */
import dgram from 'node:dgram';
import dns from 'node:dns/promises';
import net from 'node:net';
import { pathToFileURL } from 'node:url';
import { WebSocketServer } from 'ws';

export const CODIGOS = new Set('abcdefghij'.split(''));
const ORIGENES_POR_DEFECTO = ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:4173', 'http://localhost:4173'];

function parsearArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const [k, v] = a.slice(2).split('=');
    if (v !== undefined) out[k] = v;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[k] = argv[++i];
    else out[k] = true;
  }
  return out;
}

export function configuracion(args = {}) {
  return {
    host: args.host ?? '127.0.0.1',
    wsPort: Number(args['ws-port'] ?? 8765),
    udpHost: args['udp-host'] ?? '127.0.0.1',
    puertos: { receptor: Number(args['puerto-receptor'] ?? 5555), centro: Number(args['puerto-centro'] ?? 8080) },
    permitirLan: Boolean(args['permitir-lan']),
    origenes: typeof args.origen === 'string' ? args.origen.split(',') : ORIGENES_POR_DEFECTO,
    rafaga: Number(args.rafaga ?? 200), // mensajes por segundo y por cliente
    silencio: Boolean(args.silencio),
  };
}

function esLoopback(ip) {
  return net.isIPv4(ip) && ip.split('.')[0] === '127';
}
function esPrivada(ip) {
  if (!net.isIPv4(ip)) return false;
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
}

/** Valida y resuelve el destino. Devuelve la IP resuelta (se envia a ESA IP, no al nombre: evita re-resoluciones). */
export async function resolverDestino(ip, puerto, permitirLan) {
  if (typeof ip !== 'string' || !ip.trim() || ip.length > 253) throw new Error('IP de destino invalida');
  const p = Number(puerto);
  if (!Number.isInteger(p) || p < 1 || p > 65535) throw new Error(`Puerto fuera de rango: ${puerto}`); // misma regla que NetworkDestination
  let dir;
  try {
    dir = (await dns.lookup(ip.trim(), { family: 4 })).address;
  } catch {
    throw new Error(`No se pudo resolver el host de destino: ${ip.trim().slice(0, 60)}`);
  }
  if (!esLoopback(dir) && !(permitirLan && esPrivada(dir))) {
    throw new Error(`Destino no permitido (${dir}): el puente solo envia a loopback${permitirLan ? ' o red privada' : ''}`);
  }
  return { dir, puerto: p };
}

export function crearPuente(cfg = configuracion()) {
  const log = (...a) => { if (!cfg.silencio) console.log(new Date().toISOString().slice(11, 23), ...a); };
  const stats = { udpRecibidos: 0, udpInvalidos: 0, enviados: 0, rechazados: 0, wsRechazados: 0 };
  /** rol -> { socket, clientes:Set<ws>, puerto, error } */
  const roles = new Map();
  const salida = dgram.createSocket('udp4');
  salida.on('error', (e) => log('socket de salida:', e.message));

  const wss = new WebSocketServer({
    host: cfg.host,
    port: cfg.wsPort,
    maxPayload: 1024,
    verifyClient: ({ origin }) => {
      const ok = !origin || cfg.origenes.includes(origin);
      if (!ok) { stats.wsRechazados++; log('origen rechazado:', origin); }
      return ok;
    },
  });

  const difundir = (rol, obj) => {
    const r = roles.get(rol);
    if (!r) return;
    const s = JSON.stringify(obj);
    for (const c of r.clientes) if (c.readyState === 1) c.send(s);
  };

  async function asegurarSocket(rol) {
    let r = roles.get(rol);
    if (!r) { r = { socket: null, clientes: new Set(), puerto: null, error: null }; roles.set(rol, r); }
    if (r.socket) return r;
    const puerto = cfg.puertos[rol];
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: false });
    socket.on('message', (msg, rinfo) => {
      const texto = msg.toString('latin1');
      if (msg.length === 1 && CODIGOS.has(texto)) {
        stats.udpRecibidos++;
        difundir(rol, { t: 'cmd', cmd: texto, de: `${rinfo.address}:${rinfo.port}` });
      } else {
        stats.udpInvalidos++;
        // como Rbot: "Se recibio un comando UDP desconocido"; se informa a la interfaz con texto acotado y sin caracteres de control
        const vista = texto.replace(/[^\x20-\x7e]/g, '?').slice(0, 24);
        log(`[${rol}] datagrama invalido de ${rinfo.address}:${rinfo.port}: "${vista}" (${msg.length} bytes)`);
        difundir(rol, { t: 'invalido', texto: vista, bytes: msg.length, de: `${rinfo.address}:${rinfo.port}` });
      }
    });
    socket.on('error', (e) => { log(`[${rol}] error UDP:`, e.message); });
    try {
      await new Promise((res, rej) => { socket.once('error', rej); socket.bind(puerto, cfg.udpHost, () => { socket.off('error', rej); res(); }); });
      r.socket = socket; r.puerto = socket.address().port; r.error = null;
      log(`[${rol}] escuchando UDP en ${cfg.udpHost}:${r.puerto}`);
    } catch (e) {
      try { socket.close(); } catch {}
      r.error = e.code === 'EADDRINUSE' ? `Puerto UDP ${puerto} en uso (¿hay una aplicacion Rbot Java escuchando?)` : `No se pudo abrir el puerto UDP ${puerto}: ${e.message}`;
      log(`[${rol}]`, r.error);
    }
    return r;
  }

  function liberar(rol, ws) {
    const r = roles.get(rol);
    if (!r) return;
    r.clientes.delete(ws);
    if (r.clientes.size === 0 && r.socket) {
      r.socket.close(); r.socket = null; r.puerto = null;
      log(`[${rol}] sin clientes: puerto UDP liberado`);
    }
  }

  wss.on('connection', (ws) => {
    let rol = null;
    let fichas = cfg.rafaga;
    const recarga = setInterval(() => { fichas = cfg.rafaga; }, 1000);
    const responder = (o) => ws.readyState === 1 && ws.send(JSON.stringify(o));

    ws.on('message', async (data) => {
      let m;
      try { m = JSON.parse(data.toString()); } catch { return responder({ t: 'error', motivo: 'JSON invalido' }); }
      if (m?.t === 'hola') {
        if (rol) return responder({ t: 'error', motivo: 'rol ya definido' });
        if (m.rol !== 'receptor' && m.rol !== 'centro') return responder({ t: 'error', motivo: 'rol invalido' });
        rol = m.rol;
        const r = await asegurarSocket(rol);
        r.clientes.add(ws);
        return responder({ t: 'listo', rol, escuchando: Boolean(r.socket), puertoLocal: r.puerto, ipLocal: cfg.udpHost, error: r.error });
      }
      if (!rol) return responder({ t: 'error', motivo: 'enviar "hola" con el rol primero' });
      if (m?.t === 'enviar') {
        if (fichas <= 0) { stats.rechazados++; return responder({ t: 'error', id: m.id, motivo: 'demasiados comandos por segundo' }); }
        fichas--;
        if (typeof m.cmd !== 'string' || !CODIGOS.has(m.cmd)) { stats.rechazados++; return responder({ t: 'error', id: m.id, motivo: `Comando desconocido: ${String(m.cmd).slice(0, 8)}` }); }
        try {
          const d = await resolverDestino(m.ip, m.puerto, cfg.permitirLan);
          await new Promise((res, rej) => salida.send(Buffer.from(m.cmd, 'latin1'), d.puerto, d.dir, (e) => (e ? rej(e) : res())));
          stats.enviados++;
          return responder({ t: 'ok', id: m.id });
        } catch (e) {
          stats.rechazados++;
          return responder({ t: 'error', id: m.id, motivo: e.message });
        }
      }
      responder({ t: 'error', motivo: 'mensaje desconocido' });
    });
    ws.on('close', () => { clearInterval(recarga); if (rol) liberar(rol, ws); });
    ws.on('error', () => {});
  });

  const listo = new Promise((res, rej) => { wss.once('listening', res); wss.once('error', rej); });
  return {
    listo,
    stats,
    puertoWs: () => wss.address().port,
    puertoUdp: (rol) => roles.get(rol)?.puerto ?? null,
    async cerrar() {
      for (const c of wss.clients) c.terminate();
      await new Promise((r) => wss.close(r));
      for (const [, r] of roles) if (r.socket) r.socket.close();
      roles.clear();
      salida.close();
    },
  };
}

// --- ejecucion directa: node bridge/puente.mjs [--opciones] ---
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = parsearArgs(process.argv.slice(2));
  if (args.ayuda || args.h) {
    console.log(`Puente UDP<->WebSocket de Rbot
  --ws-port 8765          puerto WebSocket (127.0.0.1)
  --udp-host 127.0.0.1    interfaz UDP (0.0.0.0 para recibir de otras maquinas)
  --puerto-receptor 5555  UDP del Entorno Experimental
  --puerto-centro 8080    UDP del Centro de Mando
  --permitir-lan          permitir envio a redes privadas (10/8, 172.16/12, 192.168/16)
  --origen a,b            origenes de navegador permitidos
  --silencio              sin registro`);
    process.exit(0);
  }
  const cfg = configuracion(args);
  const p = crearPuente(cfg);
  p.listo.then(() => console.log(`Puente listo: WebSocket ws://${cfg.host}:${cfg.wsPort} | UDP receptor ${cfg.puertos.receptor}, centro ${cfg.puertos.centro} (${cfg.udpHost})${cfg.permitirLan ? ' | LAN permitida' : ''}`))
    .catch((e) => { console.error('No se pudo iniciar el puente:', e.message); process.exit(1); });
  for (const s of ['SIGINT', 'SIGTERM']) process.on(s, async () => { await p.cerrar(); process.exit(0); });
}
