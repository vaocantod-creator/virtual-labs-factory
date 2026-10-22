import { Matrix4, type Object3D } from 'three';

/**
 * Emulacion minima de javax.media.j3d.Transform3D con la misma semantica que usa Rbot.
 * Rbot acumula transformaciones con `mul` (this = this * t) y fija solo la traslacion con `setTranslation`;
 * mantener esa aritmetica es lo que permite comparar contra el comportamiento de Java.
 */
export class Transform3D {
  readonly m = new Matrix4();

  /** Rotacion antihoraria alrededor de X (reemplaza toda la matriz, como en Java3D). */
  rotX(rad: number): this {
    this.m.makeRotationX(rad);
    return this;
  }
  rotY(rad: number): this {
    this.m.makeRotationY(rad);
    return this;
  }
  rotZ(rad: number): this {
    this.m.makeRotationZ(rad);
    return this;
  }
  /** Reemplaza solo la parte traslacional; no modifica la rotacion (igual que Java3D). */
  setTranslation(x: number, y: number, z: number): this {
    const e = this.m.elements;
    e[12] = x;
    e[13] = y;
    e[14] = z;
    return this;
  }
  /** this = this * t */
  mul(t: Transform3D): this {
    this.m.multiply(t.m);
    return this;
  }
}

/** Java usa `float` para posiciones y angulos de Rbot; Math.fround reproduce ese redondeo. */
export const f32 = Math.fround;

/** Grados -> radianes con el mismo orden de operaciones que Rbot: `g * Math.PI / 180`. */
export const rad = (grados: number): number => (grados * Math.PI) / 180;

/** Equivalente de TransformGroup.setTransform: copia la matriz al nodo. */
export function setTransform(nodo: Object3D, t: Transform3D): void {
  nodo.matrixAutoUpdate = false;
  nodo.matrix.copy(t.m);
  nodo.matrixWorldNeedsUpdate = true;
}

/** Matriz 4x4 en orden de filas (como `Transform3D.get(Matrix4d)` de Java3D), para comparar con Java. */
export function filas(m: Matrix4): number[] {
  const e = m.elements;
  return [e[0], e[4], e[8], e[12], e[1], e[5], e[9], e[13], e[2], e[6], e[10], e[14], e[3], e[7], e[11], e[15]];
}
