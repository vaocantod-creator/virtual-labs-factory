import { Command, comandoDesdeCodigo, type Codigo } from '../robot/Entorno';

/** Mensajes del puente (ver bridge/puente.mjs). */
export type DelPuente =
  | { t: 'listo'; rol: Rol; escuchando: boolean; puertoLocal: number | null; ipLocal: string; error: string | null; sala?: string; pares?: number }
  | { t: 'par'; rol: Rol; presentes: number }
  | { t: 'cmd'; cmd: string; de: string }
  | { t: 'invalido'; texto: string; bytes: number; de: string }
  | { t: 'ok'; id?: string | number; entregados?: number }
  | { t: 'error'; id?: string | number; motivo: string };

export type Rol = 'receptor' | 'centro';

export interface Destino {
  ip: string;
  puerto: number;
}

/** Valida el destino con las mismas reglas que `NetworkDestination` de Rbot: IP no vacia y puerto entero 1..65535. */
export function validarDestino(ip: string, puerto: string | number): Destino {
  const ipLimpia = String(ip).trim();
  if (!ipLimpia) throw new RangeError('La IP de destino esta vacia');
  const txt = String(puerto).trim();
  if (!/^\d{1,5}$/.test(txt)) throw new RangeError(`Puerto invalido: "${txt.slice(0, 12)}"`);
  const p = Number(txt);
  if (p < 1 || p > 65535) throw new RangeError(`Puerto fuera de rango: ${p}`);
  return { ip: ipLimpia, puerto: p };
}

/**
 * Cliente del puente. Reemplaza al `DatagramSocket` de Java (Transmitter/Transceiver/EnvironmentReceiver):
 * recibe comandos de UDP y envia comandos a un destino, sin cambiar el protocolo.
 */
export class Transporte {
  private ws: WebSocket | null = null;
  private pendientes = new Map<string, { res: () => void; rej: (e: Error) => void }>();
  private contador = 0;
  info: { puertoLocal: number | null; ipLocal: string; error: string | null; escuchando: boolean } = {
    puertoLocal: null, ipLocal: '127.0.0.1', error: null, escuchando: false,
  };

  /** Hay al menos un extremo opuesto en la sala (solo modo sala). */
  parPresente = false;

  constructor(
    private readonly rol: Rol,
    private readonly alComando: (c: Codigo, de: string) => void,
    private readonly alEstado: (txt: string, nivel: 'info' | 'aviso' | 'error') => void,
    private readonly url = 'ws://127.0.0.1:8765',
    private readonly sala?: string,
    private readonly clave?: string,
  ) {}

  conectar(): Promise<void> {
    return new Promise((res, rej) => {
      let abierto = false;
      const ws = new WebSocket(this.url);
      this.ws = ws;
      ws.onopen = () => { abierto = true; ws.send(JSON.stringify({ t: 'hola', rol: this.rol, ...(this.sala ? { sala: this.sala } : {}), ...(this.clave ? { clave: this.clave } : {}) })); };
      ws.onerror = () => { if (!abierto) rej(new Error('No se pudo conectar con el puente (¿esta en ejecucion?)')); };
      ws.onclose = (ev) => {
        if (!abierto || ev.code === 1008) rej(new Error(ev.code === 1008 ? 'Clave del laboratorio incorrecta' : ev.code === 1013 ? 'Servidor lleno' : 'Conexion cerrada'));
        this.info.escuchando = false;
        for (const [, p] of this.pendientes) p.rej(new Error('Conexion con el puente cerrada'));
        this.pendientes.clear();
        if (abierto) this.alEstado('Conexion con el puente cerrada', 'aviso');
      };
      ws.onmessage = (ev) => {
        let m: DelPuente;
        try { m = JSON.parse(String(ev.data)) as DelPuente; } catch { return; }
        switch (m.t) {
          case 'listo':
            this.info = { puertoLocal: m.puertoLocal, ipLocal: m.ipLocal, error: m.error, escuchando: m.escuchando };
            if (m.sala !== undefined) {
              this.parPresente = (m.pares ?? 0) > 0;
              this.alEstado(`Sala "${m.sala}": ${this.parPresente ? 'companero conectado' : 'esperando al otro extremo'}`, 'info');
            } else if (m.error) this.alEstado(m.error, 'error');
            else this.alEstado(`Escuchando UDP ${m.ipLocal}:${m.puertoLocal}`, 'info');
            res();
            break;
          case 'par':
            this.parPresente = m.presentes > 0;
            this.alEstado(`${m.rol === 'centro' ? 'Centro de Mando' : 'Entorno Experimental'} ${this.parPresente ? 'conectado' : 'desconectado'}`, this.parPresente ? 'info' : 'aviso');
            break;
          case 'cmd':
            try { this.alComando(comandoDesdeCodigo(m.cmd), m.de); } catch { this.alEstado(`Comando desconocido: ${m.cmd.slice(0, 8)}`, 'aviso'); }
            break;
          case 'invalido':
            // equivale al aviso de Rbot: "Se recibio un comando UDP desconocido"
            this.alEstado(`Datagrama desconocido de ${m.de}: "${m.texto}" (${m.bytes} bytes)`, 'aviso');
            break;
          case 'ok':
            if (m.id !== undefined) { this.pendientes.get(String(m.id))?.res(); this.pendientes.delete(String(m.id)); }
            if (m.entregados === 0) this.alEstado('Nadie recibio el comando: el otro extremo no esta en la sala', 'aviso');
            break;
          case 'error':
            if (m.id !== undefined && this.pendientes.has(String(m.id))) { this.pendientes.get(String(m.id))!.rej(new Error(m.motivo)); this.pendientes.delete(String(m.id)); }
            else this.alEstado(m.motivo, 'error');
            break;
        }
      };
    });
  }

  /** Envia un comando por UDP al destino. La promesa se rechaza con el motivo si el puente lo rechaza. */
  enviar(cmd: Codigo, destino: Destino): Promise<void> {
    if (!this.ws || this.ws.readyState !== 1) return Promise.reject(new Error('Sin conexion con el puente'));
    const id = String(++this.contador);
    return new Promise((res, rej) => {
      this.pendientes.set(id, { res, rej });
      this.ws!.send(JSON.stringify({ t: 'enviar', id, cmd, ip: destino.ip, puerto: destino.puerto }));
      setTimeout(() => { if (this.pendientes.delete(id)) rej(new Error('Sin respuesta del puente')); }, 3000);
    });
  }

  cerrar(): void { this.ws?.close(); }
}

export { Command };
