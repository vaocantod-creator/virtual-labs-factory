import { Group, PerspectiveCamera } from 'three';
import { Transform3D, f32, rad, setTransform } from '../java3d';
import { PASO_AVANCE, PASO_GIRO_GRADOS, type Modo } from './constantes';

/**
 * Plataformas de vista de `VirtualScenary.java`: 4 vistas del Entorno Experimental (panel del "Receptor", 2x2).
 *   iso      -> fondo3D  (arriba izquierda)   perspectiva de la habitacion
 *   superior -> canvas1  (arriba derecha)     vista desde arriba
 *   primera  -> canvas2  (abajo izquierda)    primera persona (camara del robot)
 *   cercana  -> canvas3  (abajo derecha)      vista de seguimiento del robot
 * Cada camara cuelga de una cadena de TransformGroups con la MISMA aritmetica acumulativa de Java.
 */
export class Vistas {
  readonly iso = new PerspectiveCamera();
  readonly superior = new PerspectiveCamera();
  readonly primera = new PerspectiveCamera();
  readonly cercana = new PerspectiveCamera();
  readonly raiz = new Group();

  // Primera persona: tgGrafico6 -> sistVista -> tgGrafico2 -> tgGrafico3 -> tgGrafico4 -> tgGrafico5 -> camara
  private readonly g6 = new Group();
  private readonly sist = new Group();
  private readonly g2 = new Group();
  private readonly g3 = new Group();
  private readonly g4 = new Group();
  private readonly g5 = new Group();
  private readonly util13 = new Transform3D();
  private readonly util12 = new Transform3D();
  private readonly util14 = new Transform3D();
  private readonly util5 = new Transform3D();
  private readonly util4 = new Transform3D();
  private readonly util7 = new Transform3D();
  private readonly util6 = new Transform3D();
  private readonly util9 = new Transform3D();
  private readonly util8 = new Transform3D();
  private alejarAcercarZ = 1; // float
  private refAva = 0; // float
  private der = 0.1; // double
  private refIZ = 0; // double
  private refZ = 0; // float
  private refY = 0; // double
  private refX = 0; // double

  // Vista cercana: tgGrafico7 (se mueve) -> tgGrafico8 (fija)
  private readonly g7 = new Group();
  private readonly g8 = new Group();
  private readonly util30 = new Transform3D();
  private readonly util28 = new Transform3D();
  private readonly util26 = new Transform3D();
  private alejarAcercarZCanvas3 = 0; // float
  private refAvaCanvas3 = 0; // float
  private derCanvas3 = 0; // float
  private refIZCanvas3 = 0; // float

  constructor(private readonly modo: Modo = 'mejorado') {
    for (const c of [this.iso, this.superior, this.primera, this.cercana]) {
      c.near = 0.1;
      c.far = 100000; // Java: setBackClipDistance(1000.0) en unidades fisicas; aqui se amplia (ver nota en docs)
    }
    this.armarIso();
    this.armarSuperior();
    this.armarPrimera();
    this.armarCercana();
  }

  private armarIso(): void {
    const util18 = new Transform3D();
    const util17 = new Transform3D();
    const util19 = new Transform3D();
    const util20 = new Transform3D();
    util20.setTranslation(f32(580), f32(-695), f32(300));
    util18.mul(util20);
    util17.rotZ(rad(45));
    util18.mul(util17);
    util19.rotX(rad(60));
    util18.mul(util19);
    const g = new Group();
    setTransform(g, util18);
    g.add(this.iso);
    this.raiz.add(g);
  }

  private armarSuperior(): void {
    const t = new Transform3D();
    t.setTranslation(f32(190), f32(-180), f32(1000));
    const g = new Group();
    setTransform(g, t);
    g.add(this.superior);
    this.raiz.add(g);
  }

  private armarPrimera(): void {
    const util1 = new Transform3D();
    const util2 = new Transform3D();
    const util3 = new Transform3D();
    util1.setTranslation(f32(-7.27), f32(0.125), f32(18.2));
    util2.rotX(rad(90));
    util1.mul(util2);
    util3.rotY(rad(90));
    util1.mul(util3);
    setTransform(this.sist, util1);
    const util10 = new Transform3D();
    const util11 = new Transform3D();
    util10.setTranslation(0, f32(4.9), f32(-1.2));
    util11.mul(util10);
    setTransform(this.g5, util11);
    this.g5.add(this.primera);
    this.g4.add(this.g5);
    this.g3.add(this.g4);
    this.g2.add(this.g3);
    this.sist.add(this.g2);
    this.g6.add(this.sist);
    this.raiz.add(this.g6);
  }

  private armarCercana(): void {
    const util24 = new Transform3D();
    const util23 = new Transform3D();
    const util25 = new Transform3D();
    const util27 = new Transform3D();
    util23.setTranslation(f32(-70), 0, f32(70));
    util24.mul(util23);
    util25.rotZ(rad(-90));
    util24.mul(util25);
    util27.rotX(rad(45));
    util24.mul(util27);
    setTransform(this.g8, util24);
    this.g8.add(this.cercana);
    this.g7.add(this.g8);
    this.raiz.add(this.g7);
  }

  /** Modo mejorado: traslacion relativa fija sobre el nodo `nodo`, acumulada en `acum`. */
  private mover(nodo: Group, acum: Transform3D, tmp: Transform3D, dx: number): void {
    tmp.setTranslation(dx, 0, 0);
    acum.mul(tmp);
    setTransform(nodo, acum);
  }

  /** Modo mejorado: giro relativo fijo en Z. */
  private girar_(nodo: Group, acum: Transform3D, tmp: Transform3D, grados: number): void {
    tmp.rotZ(rad(grados));
    acum.mul(tmp);
    setTransform(nodo, acum);
  }

  // --- movimientos de `VirtualScenary` ---
  subirBajar(subirBajarY: number): void {
    this.util4.setTranslation(0, f32(subirBajarY - this.refZ), 0);
    this.util5.mul(this.util4);
    setTransform(this.g2, this.util5);
    this.refZ = subirBajarY;
  }
  girar(giroEjeY: number): void {
    this.util6.rotY(rad(giroEjeY - this.refY));
    this.util7.mul(this.util6);
    setTransform(this.g3, this.util7);
    this.refY = giroEjeY;
  }
  elevar(elevarX: number): void {
    this.util8.rotX(rad(elevarX - this.refX));
    this.util9.mul(this.util8);
    setTransform(this.g4, this.util9);
    this.refX = elevarX;
  }
  avanzar(): void {
    if (this.modo === 'mejorado') return this.mover(this.g6, this.util13, this.util12, -PASO_AVANCE);
    this.util12.setTranslation(f32(this.alejarAcercarZ - this.refAva), 0, 0);
    this.util13.mul(this.util12);
    setTransform(this.g6, this.util13);
    this.refAva = this.alejarAcercarZ;
    this.alejarAcercarZ = f32(this.alejarAcercarZ - 4);
  }
  retroceder(): void {
    if (this.modo === 'mejorado') return this.mover(this.g6, this.util13, this.util12, PASO_AVANCE);
    this.util12.setTranslation(f32(this.alejarAcercarZ - this.refAva), 0, 0);
    this.util13.mul(this.util12);
    setTransform(this.g6, this.util13);
    this.refAva = this.alejarAcercarZ;
    this.alejarAcercarZ = f32(this.alejarAcercarZ + 4);
  }
  derecha(): void {
    if (this.modo === 'mejorado') return this.girar_(this.g6, this.util13, this.util14, -PASO_GIRO_GRADOS);
    this.util14.rotZ(rad(this.der - this.refIZ));
    this.util13.mul(this.util14);
    setTransform(this.g6, this.util13);
    this.refIZ = this.der;
    this.der -= 4;
  }
  izquierda(): void {
    if (this.modo === 'mejorado') return this.girar_(this.g6, this.util13, this.util14, PASO_GIRO_GRADOS);
    this.util14.rotZ(rad(this.der - this.refIZ));
    this.util13.mul(this.util14);
    setTransform(this.g6, this.util13);
    this.refIZ = this.der;
    this.der += 4;
  }
  avanzarCanvas3(): void {
    if (this.modo === 'mejorado') return this.mover(this.g7, this.util30, this.util28, -PASO_AVANCE);
    this.util28.setTranslation(f32(this.alejarAcercarZCanvas3 - this.refAvaCanvas3), 0, 0);
    this.util30.mul(this.util28);
    setTransform(this.g7, this.util30);
    this.refAvaCanvas3 = this.alejarAcercarZCanvas3;
    this.alejarAcercarZCanvas3 = f32(this.alejarAcercarZCanvas3 - 4);
  }
  retrocederCanvas3(): void {
    if (this.modo === 'mejorado') return this.mover(this.g7, this.util30, this.util28, PASO_AVANCE);
    this.util28.setTranslation(f32(this.alejarAcercarZCanvas3 - this.refAvaCanvas3), 0, 0);
    this.util30.mul(this.util28);
    setTransform(this.g7, this.util30);
    this.refAvaCanvas3 = this.alejarAcercarZCanvas3;
    this.alejarAcercarZCanvas3 = f32(this.alejarAcercarZCanvas3 + 4);
  }
  derechaCanvas3(): void {
    if (this.modo === 'mejorado') return this.girar_(this.g7, this.util30, this.util26, -PASO_GIRO_GRADOS);
    this.util26.rotZ(rad(f32(this.derCanvas3 - this.refIZCanvas3)));
    this.util30.mul(this.util26);
    setTransform(this.g7, this.util30);
    this.refIZCanvas3 = this.derCanvas3;
    this.derCanvas3 = f32(this.derCanvas3 - 4);
  }
  izquierdaCanvas3(): void {
    if (this.modo === 'mejorado') return this.girar_(this.g7, this.util30, this.util26, PASO_GIRO_GRADOS);
    this.util26.rotZ(rad(f32(this.derCanvas3 - this.refIZCanvas3)));
    this.util30.mul(this.util26);
    setTransform(this.g7, this.util30);
    this.refIZCanvas3 = this.derCanvas3;
    this.derCanvas3 = f32(this.derCanvas3 + 4);
  }

  /** Nodos de la cadena de primera persona, para el volcado de estado. */
  nodos(): Record<string, Group> {
    return { g6: this.g6, g2: this.g2, g3: this.g3, g4: this.g4, g7: this.g7 };
  }
}
