import { f32 } from '../java3d';

/**
 * Posiciones canonicas de los 29 eslabones del circuito de la oruga.
 * Copiado de `TrackLinkPositions.java` (vdiquez/Rbot): cada fila es {DesX, DesZ, Gy} (Gy en grados).
 * Los valores se guardan como `float` para reproducir el redondeo de Java.
 */
export const TRACK_Y = f32(0.35);

const CIRCUITO: ReadonlyArray<readonly [number, number, number]> = [
  [-10.61, 0.09, 2.19], //  1 - inicio curva inferior izquierda
  [-6.61, 0.0, 0.0], //  2
  [-2.61, 0.0, 0.0], //  3
  [1.39, 0.0, 0.0], //  4
  [5.39, 0.0, 0.0], //  5
  [9.39, 0.0, 0.0], //  6
  [13.39, 0.0, 0.0], //  7 - fin tramo recto inferior
  [17.39, -0.06, 1.57], //  8 - inicio curva derecha
  [21.46, 0.67, -22.15], //  9
  [24.89, 3.05, -48.0], // 10
  [27.11, 6.5, -70.28], // 11
  [27.72, 10.68, -93.76], // 12 - apice derecho
  [26.54, 14.68, -119.03], // 13
  [23.8, 17.83, -144.29], // 14
  [20.02, 19.62, -164.0], // 15 - fin curva derecha
  [16.0, 20.22, 180.43], // 16 - inicio tramo superior
  [12.0, 20.24, 180.0], // 17
  [8.0, 20.24, 180.0], // 18
  [4.0, 20.24, 180.0], // 19
  [0.0, 20.24, 180.0], // 20
  [-4.0, 20.24, 180.41], // 21
  [-8.0, 20.19, 180.47], // 22
  [-12.0, 19.88, 167.14], // 23 - fin tramo superior
  [-15.8, 18.41, 150.18], // 24 - inicio curva izquierda
  [-18.79, 15.43, 119.94], // 25
  [-20.19, 11.55, 98.72], // 26
  [-19.9, 7.37, 72.0], // 27
  [-17.94, 3.66, 49.68], // 28
  [-14.77, 1.14, 24.2], // 29 - fin curva izquierda
].map(([x, z, g]) => [f32(x), f32(z), f32(g)] as const);

/** Devuelve {DesX, DesZ, Gy} del eslabon `slot` (1..29). */
export function slotAt(slot: number): readonly [number, number, number] {
  return CIRCUITO[slot - 1];
}

export const NUM_SLOTS_ORUGA = CIRCUITO.length;

/** Configuracion de las 4 ruedas (de `WheelConfig.java`): derecha-delantera, izquierda-delantera, derecha-trasera, izquierda-trasera. */
export interface RuedaConfig {
  desX: number;
  desY: number;
  desZ: number;
  /** true en las ruedas izquierdas: rotacion de 180 grados en Z para espejar la malla. */
  espejoZ: boolean;
  /** true: `avanzar` recorre las posiciones 1->2->...->15; false: en sentido inverso. */
  avanzaIncrementa: boolean;
  /** Ajuste fino inicial en Y (grados) aplicado antes de la maquina de estados. */
  initGy: number;
}

export const RUEDAS: ReadonlyArray<RuedaConfig> = [
  { desX: f32(19.16), desY: f32(25.65), desZ: f32(2.76), espejoZ: false, avanzaIncrementa: true, initGy: f32(0.0) },
  { desX: f32(19.14), desY: f32(-25.27), desZ: f32(2.74), espejoZ: true, avanzaIncrementa: false, initGy: f32(-3.07) },
  { desX: f32(-8.86), desY: f32(25.79), desZ: f32(2.93), espejoZ: false, avanzaIncrementa: true, initGy: f32(0.48) },
  { desX: f32(-8.86), desY: f32(-25.12), desZ: f32(2.93), espejoZ: true, avanzaIncrementa: false, initGy: f32(-3.19) },
];

export const GRADOS_POR_POSICION_RUEDA = f32(-24.0);
export const NUM_POSICIONES_RUEDA = 15;
