import { Command, type Codigo } from '../robot/Entorno';

/**
 * Logica del Centro de Mando (puerto de `Transmitter.java` + `ViewFinder.java`), sin interfaz ni red: facil de probar.
 *
 * En Java, los spinners emitian un comando SOLO si el valor cambiaba exactamente un paso (`mov == 1`, `mov == 2`...). Si se saltaba un valor
 * (p. ej. escribir 40 de golpe), no se enviaba nada y el estado de la camara quedaba desincronizado respecto a lo que mostraba el spinner.
 * Aqui, ante un salto, se emiten TODOS los comandos intermedios, de modo que el valor mostrado y el estado del robot siempre coinciden
 * (consecuencia directa de ADR-0002: cada comando es un incremento fijo).
 */
export interface EspecControl {
  nombre: 'movVertical' | 'azimut' | 'elevacion';
  min: number;
  max: number;
  paso: number;
  arriba: Codigo;
  abajo: Codigo;
}

export const CONTROLES: readonly EspecControl[] = [
  { nombre: 'movVertical', min: -18, max: 58, paso: 1, arriba: Command.CAMERA_VERTICAL_UP, abajo: Command.CAMERA_VERTICAL_DOWN },
  { nombre: 'azimut', min: -90, max: 90, paso: 2, arriba: Command.CAMERA_AZIMUTH_LEFT, abajo: Command.CAMERA_AZIMUTH_RIGHT },
  { nombre: 'elevacion', min: -50, max: 50, paso: 2, arriba: Command.CAMERA_ELEVATION_UP, abajo: Command.CAMERA_ELEVATION_DOWN },
];

/** Teclas del Centro de Mando (Transmitter.keyPressed): flechas direccionales. */
export const TECLAS: Readonly<Record<string, Codigo>> = {
  ArrowUp: Command.MOVE_FORWARD,
  ArrowDown: Command.MOVE_BACKWARD,
  ArrowRight: Command.TURN_RIGHT,
  ArrowLeft: Command.TURN_LEFT,
};

/** Comandos necesarios para pasar del valor `desde` al valor `hasta` (ambos ajustados al rango y a la rejilla del control). */
export function comandosPara(c: EspecControl, desde: number, hasta: number): Codigo[] {
  const aRejilla = (v: number): number => {
    const acotado = Math.min(c.max, Math.max(c.min, v));
    return Math.round(acotado / c.paso) * c.paso;
  };
  const d = aRejilla(desde);
  const h = aRejilla(hasta);
  const pasos = Math.round((h - d) / c.paso);
  return Array.from({ length: Math.abs(pasos) }, () => (pasos > 0 ? c.arriba : c.abajo));
}

export class ModeloControl {
  valor = 0;
  constructor(readonly espec: EspecControl) {}

  /** Cambia el valor y devuelve los comandos a enviar. El valor guardado es el ya ajustado a rango y rejilla. */
  cambiar(nuevo: number): Codigo[] {
    if (!Number.isFinite(nuevo)) return [];
    const cmds = comandosPara(this.espec, this.valor, nuevo);
    const ajustado = Math.min(this.espec.max, Math.max(this.espec.min, Math.round(nuevo / this.espec.paso) * this.espec.paso));
    this.valor = ajustado;
    return cmds;
  }
}
