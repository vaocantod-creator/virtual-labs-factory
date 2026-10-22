import { Group } from 'three';
import { ObjetoGrafico, type Piezas } from './ObjetoGrafico';
import { Transform3D, f32, rad, setTransform } from '../java3d';
import { NUM_SLOTS_ORUGA, TRACK_Y, slotAt } from './constantes';

/**
 * Eslabon parametrico de la oruga (puerto de `TrackLink.java`). Ocupa uno de 29 puestos del circuito.
 * `avanzar`/`retroceder` recorren los puestos con aritmetica de DELTAS acumulados sobre una matriz, igual que Java:
 * no se asigna la pose absoluta, se multiplica por el incremento. Se conserva a proposito para reproducir
 * el estado exacto de Java (incluido el redondeo `float` de cada resta).
 */
export class TrackLink extends ObjetoGrafico {
  /** TransformGroup de posicion. */
  readonly rotacion = new Group();
  /** TransformGroup de giro en Y (hijo del anterior). */
  readonly rotacion1 = new Group();
  private readonly rot = new Transform3D();
  private readonly rot1 = new Transform3D();
  private readonly trans = new Transform3D();
  private readonly trans1 = new Transform3D();
  private desX = 0;
  private desZ = 0;
  private gY = 0;
  slotActual = 0;

  constructor(
    private readonly piezas: Piezas,
    private readonly slotInicial: number,
  ) {
    super();
    if (slotInicial < 1 || slotInicial > NUM_SLOTS_ORUGA) {
      throw new RangeError(`startingSlot debe ser 1..${NUM_SLOTS_ORUGA}, recibido: ${slotInicial}`);
    }
    this.construir();
  }

  protected ajustesIniciales(): void {
    const [x, z, g] = slotAt(this.slotInicial);
    this.trans.setTranslation(x, TRACK_Y, z);
    this.rot.mul(this.trans);
    setTransform(this.rotacion, this.rot);
    this.trans1.rotY(rad(g));
    this.rot1.mul(this.trans1);
    setTransform(this.rotacion1, this.rot1);
    this.desX = x;
    this.desZ = z;
    this.gY = g;
    this.slotActual = this.slotInicial;
  }

  protected crearElementos(): void {
    this.rotacion1.add(this.piezas.clonar('Pieza1Oruga.3ds'));
  }

  protected ajustarCapacidades(): void {
    // Three.js no tiene capacidades de nodo; setTransform ya desactiva matrixAutoUpdate.
  }

  protected articularElementos(): void {
    this.rotacion.add(this.rotacion1);
    this.add(this.rotacion);
  }

  protected ajustesFinales(): void {}

  avanzar(): void {
    this.slotActual = (this.slotActual % NUM_SLOTS_ORUGA) + 1;
    this.aplicarSlot();
  }

  retroceder(): void {
    this.slotActual = this.slotActual === 1 ? NUM_SLOTS_ORUGA : this.slotActual - 1;
    this.aplicarSlot();
  }

  private aplicarSlot(): void {
    const [nx, nz, ng] = slotAt(this.slotActual);
    this.trans.setTranslation(f32(nx - this.desX), 0, f32(nz - this.desZ));
    this.rot.mul(this.trans);
    setTransform(this.rotacion, this.rot);
    this.trans1.rotY(rad(f32(ng - this.gY)));
    this.rot1.mul(this.trans1);
    setTransform(this.rotacion1, this.rot1);
    this.desX = nx;
    this.desZ = nz;
    this.gY = ng;
  }
}

/** Conjunto de 29 eslabones (puerto de `TrackAssembly.java`). El espejo en Y lo da el padre en `Cuerpo`. */
export class TrackAssembly extends ObjetoGrafico {
  readonly eslabones: TrackLink[] = [];
  private readonly tg = new Group();

  constructor(private readonly piezas: Piezas) {
    super();
    this.construir();
  }

  protected ajustesIniciales(): void {}

  protected crearElementos(): void {
    for (let slot = 1; slot <= NUM_SLOTS_ORUGA; slot++) {
      this.eslabones.push(new TrackLink(this.piezas, slot));
    }
  }

  protected ajustarCapacidades(): void {}

  protected articularElementos(): void {
    for (const e of this.eslabones) this.tg.add(e);
    this.add(this.tg);
  }

  protected ajustesFinales(): void {}
}
