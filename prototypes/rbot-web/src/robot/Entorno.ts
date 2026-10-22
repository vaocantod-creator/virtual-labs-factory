import { Group } from 'three';
import { Cuerpo } from './Cuerpo';
import { Vistas } from './vistas';
import { type Piezas } from './ObjetoGrafico';
import { f32 } from '../java3d';
import {
  PASO_CAMARA_AZIMUT, PASO_CAMARA_ELEVACION, PASO_CAMARA_VERTICAL, type Modo,
} from './constantes';

/**
 * Rangos del Centro de Mando (ViewFinder.java) EXPRESADOS EN PASOS ENTEROS: vertical -18..58 (pasos de 0,1), azimut +-45 pasos
 * (= +-90 grados, de 2 en 2) y elevacion +-25 pasos (= +-50 grados). Contar pasos enteros evita la deriva de redondeo `float`
 * de sumar 0,1 muchas veces: ir y volver siempre llega exactamente al mismo estado.
 */
export const LIMITES_PASOS = {
  vertical: [-18, 58],
  azimut: [-45, 45],
  elevacion: [-25, 25],
} as const;
const acotar = (v: number, [min, max]: readonly [number, number]): number => Math.min(max, Math.max(min, v));

/** Protocolo UDP de una letra (enum `Command` de Rbot). Es un invariante de la constitution. */
export const Command = {
  CAMERA_VERTICAL_UP: 'a',
  CAMERA_VERTICAL_DOWN: 'b',
  CAMERA_AZIMUTH_LEFT: 'c',
  CAMERA_AZIMUTH_RIGHT: 'd',
  CAMERA_ELEVATION_UP: 'e',
  CAMERA_ELEVATION_DOWN: 'f',
  MOVE_FORWARD: 'g',
  MOVE_BACKWARD: 'h',
  TURN_RIGHT: 'i',
  TURN_LEFT: 'j',
} as const;
export type Codigo = (typeof Command)[keyof typeof Command];

export function comandoDesdeCodigo(code: string): Codigo {
  for (const v of Object.values(Command)) if (v === code) return v;
  throw new RangeError(`Comando desconocido: ${code}`);
}

/**
 * Entorno Experimental (puerto de `EnvironmentReceiver.dispatch` + `VirtualScenary`).
 *
 * Dos modos (ADR-0002):
 * - 'mejorado' (por defecto): cada comando es un incremento FIJO y relativo; su efecto no depende de los comandos anteriores y
 *   un comando contrario lo revierte (`g` luego `h` vuelve al origen; `c` luego `d`, tambien). La camara aplica el valor NUEVO,
 *   sin retraso, y se acota al rango del Centro de Mando.
 * - 'legado': reproduce el comportamiento del codigo Java original (estado compartido, retraso de un paso, sin limites).
 *   Existe solo para la prueba de paridad con el oraculo Java.
 */
export class Entorno {
  readonly raiz = new Group();
  readonly cuerpo: Cuerpo;
  readonly vistas: Vistas;
  private refVertical = 0; // float
  private refAzimut = 0; // float
  private refElevacion = 0; // float
  // Modo mejorado: el estado es el numero de pasos (entero); el valor se deriva de ahi.
  private nVertical = 0;
  private nAzimut = 0;
  private nElevacion = 0;
  /** Orden en que se ejecutaron los comandos (para volcados de depuracion). */
  readonly historial: Codigo[] = [];

  constructor(
    piezas: Piezas,
    habitacion?: Group,
    readonly modo: Modo = 'mejorado',
  ) {
    this.cuerpo = new Cuerpo(piezas, modo);
    this.vistas = new Vistas(modo);
    // `VirtualRoom`: Cuarto.3DS trasladado a (100, 0, -10) dentro de tgContenido.
    if (habitacion) {
      habitacion.position.set(100, 0, -10);
      this.raiz.add(habitacion);
    }
    this.raiz.add(this.cuerpo);
    this.raiz.add(this.vistas.raiz);
  }

  ejecutar(cmd: Codigo): void {
    this.historial.push(cmd);
    if (this.modo === 'mejorado') return this.ejecutarMejorado(cmd);
    const c = this.cuerpo;
    const cam = c.ecm;
    switch (cmd) {
      case Command.CAMERA_VERTICAL_UP:
        cam.cremallera.rotarEjeZ(this.refVertical);
        cam.elevador.girarEjeY(this.refVertical);
        this.vistas.subirBajar(this.refVertical);
        this.refVertical = f32(this.refVertical + f32(0.1));
        break;
      case Command.CAMERA_VERTICAL_DOWN:
        cam.cremallera.rotarEjeZ(this.refVertical);
        cam.elevador.girarEjeY(this.refVertical);
        this.vistas.subirBajar(this.refVertical);
        this.refVertical = f32(this.refVertical - f32(0.1));
        break;
      case Command.CAMERA_AZIMUTH_LEFT:
        cam.rotarEjeZ(this.refAzimut);
        c.ebm.girarEjeZ(f32(-this.refAzimut));
        this.vistas.girar(this.refAzimut);
        this.refAzimut = f32(this.refAzimut + 2);
        break;
      case Command.CAMERA_AZIMUTH_RIGHT:
        cam.rotarEjeZ(this.refAzimut);
        c.ebm.girarEjeZ(f32(-this.refAzimut));
        this.vistas.girar(this.refAzimut);
        this.refAzimut = f32(this.refAzimut - 2);
        break;
      case Command.CAMERA_ELEVATION_UP:
        cam.cremallera.camara.rotarEjeY(this.refElevacion);
        this.vistas.elevar(this.refElevacion);
        this.refElevacion = f32(this.refElevacion + 2);
        break;
      case Command.CAMERA_ELEVATION_DOWN:
        cam.cremallera.camara.rotarEjeY(this.refElevacion);
        this.vistas.elevar(this.refElevacion);
        this.refElevacion = f32(this.refElevacion - 2);
        break;
      case Command.MOVE_FORWARD:
        c.moverOrugaDerecha();
        c.avanzar();
        this.vistas.avanzar();
        this.vistas.avanzarCanvas3();
        break;
      case Command.MOVE_BACKWARD:
        c.moverOrugaIzquierda();
        c.retroceder();
        this.vistas.retroceder();
        this.vistas.retrocederCanvas3();
        break;
      case Command.TURN_RIGHT:
        c.moverDerecha();
        c.derecha();
        this.vistas.derecha();
        this.vistas.derechaCanvas3();
        break;
      case Command.TURN_LEFT:
        c.moverIzquierda();
        c.izquierda();
        this.vistas.izquierda();
        this.vistas.izquierdaCanvas3();
        break;
    }
  }

  /** Comportamiento mejorado: posicion objetivo = anterior +/- paso, acotada, y se aplica de inmediato. */
  private ejecutarMejorado(cmd: Codigo): void {
    const c = this.cuerpo;
    const cam = c.ecm;
    const ajustarVertical = (pasos: number): void => {
      this.nVertical = acotar(this.nVertical + pasos, LIMITES_PASOS.vertical);
      this.refVertical = f32(this.nVertical * PASO_CAMARA_VERTICAL);
      cam.cremallera.rotarEjeZ(this.refVertical);
      cam.elevador.girarEjeY(this.refVertical);
      this.vistas.subirBajar(this.refVertical);
    };
    const ajustarAzimut = (pasos: number): void => {
      this.nAzimut = acotar(this.nAzimut + pasos, LIMITES_PASOS.azimut);
      this.refAzimut = this.nAzimut * PASO_CAMARA_AZIMUT;
      cam.rotarEjeZ(this.refAzimut);
      c.ebm.girarEjeZ(f32(-this.refAzimut));
      this.vistas.girar(this.refAzimut);
    };
    const ajustarElevacion = (pasos: number): void => {
      this.nElevacion = acotar(this.nElevacion + pasos, LIMITES_PASOS.elevacion);
      this.refElevacion = this.nElevacion * PASO_CAMARA_ELEVACION;
      cam.cremallera.camara.rotarEjeY(this.refElevacion);
      this.vistas.elevar(this.refElevacion);
    };
    switch (cmd) {
      case Command.CAMERA_VERTICAL_UP: return ajustarVertical(1);
      case Command.CAMERA_VERTICAL_DOWN: return ajustarVertical(-1);
      case Command.CAMERA_AZIMUTH_LEFT: return ajustarAzimut(1);
      case Command.CAMERA_AZIMUTH_RIGHT: return ajustarAzimut(-1);
      case Command.CAMERA_ELEVATION_UP: return ajustarElevacion(1);
      case Command.CAMERA_ELEVATION_DOWN: return ajustarElevacion(-1);
      case Command.MOVE_FORWARD:
        c.moverOrugaDerecha(); c.avanzar(); this.vistas.avanzar(); this.vistas.avanzarCanvas3(); return;
      case Command.MOVE_BACKWARD:
        c.moverOrugaIzquierda(); c.retroceder(); this.vistas.retroceder(); this.vistas.retrocederCanvas3(); return;
      case Command.TURN_RIGHT:
        c.moverDerecha(); c.derecha(); this.vistas.derecha(); this.vistas.derechaCanvas3(); return;
      case Command.TURN_LEFT:
        c.moverIzquierda(); c.izquierda(); this.vistas.izquierda(); this.vistas.izquierdaCanvas3(); return;
    }
  }

  /** Ejecuta una secuencia, por ejemplo "gggiic" (cada letra es un comando). */
  secuencia(letras: string): void {
    for (const l of letras) this.ejecutar(comandoDesdeCodigo(l));
  }

  /**
   * Volcado del estado para comparar con Java: matriz 4x4 (filas) de los nodos que Rbot muta,
   * mas el estado discreto (posiciones de eslabones y ruedas) y los acumuladores.
   */
  estado(): Estado {
    const c = this.cuerpo;
    const m = (g: Group): number[] => {
      const e = g.matrix.elements;
      return [e[0], e[4], e[8], e[12], e[1], e[5], e[9], e[13], e[2], e[6], e[10], e[14], e[3], e[7], e[11], e[15]];
    };
    const v = this.vistas.nodos();
    return {
      cuerpo: m(c.tg),
      ecmBase: m(c.ecm.tg),
      cremallera: m(c.ecm.cremallera.tg),
      camara: m(c.ecm.cremallera.camara.tg),
      elevador: m(c.ecm.elevador.tg),
      engranajeBase: m(c.ebm.tg),
      vistaPrimera: { g6: m(v.g6), g2: m(v.g2), g3: m(v.g3), g4: m(v.g4) },
      vistaCercana: m(v.g7),
      eslabonesDer: c.od.eslabones.map((e) => e.slotActual),
      eslabonesIzq: c.od1.eslabones.map((e) => e.slotActual),
      ruedas: c.ruedas.map((w) => w.posicionActual),
    };
  }
}

export interface Estado {
  cuerpo: number[];
  ecmBase: number[];
  cremallera: number[];
  camara: number[];
  elevador: number[];
  engranajeBase: number[];
  vistaPrimera: { g6: number[]; g2: number[]; g3: number[]; g4: number[] };
  vistaCercana: number[];
  eslabonesDer: number[];
  eslabonesIzq: number[];
  ruedas: number[];
}
