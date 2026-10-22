import { Group } from 'three';
import { ObjetoGrafico, type Piezas } from './ObjetoGrafico';
import { Transform3D, f32, rad, setTransform } from '../java3d';
import { GRADOS_POR_POSICION_RUEDA, NUM_POSICIONES_RUEDA, type RuedaConfig } from './constantes';

/** Rueda parametrica (puerto de `WheelMovement.java`): 15 posiciones angulares de -24 grados. */
export class WheelMovement extends ObjetoGrafico {
  readonly rotacion = new Group();
  readonly rotacion1 = new Group();
  private readonly rot = new Transform3D();
  private readonly rot1 = new Transform3D();
  private readonly trans = new Transform3D();
  private readonly trans1 = new Transform3D();
  private gY = 0;
  posicionActual = 1;

  constructor(
    private readonly piezas: Piezas,
    private readonly config: RuedaConfig,
  ) {
    super();
    this.construir();
  }

  get avanzaIncrementa(): boolean {
    return this.config.avanzaIncrementa;
  }

  protected ajustesIniciales(): void {
    const c = this.config;
    // Paso 1: posicion
    this.trans.setTranslation(c.desX, c.desY, c.desZ);
    this.rot.mul(this.trans);
    setTransform(this.rotacion, this.rot);
    // Paso 2: espejo en Z para las ruedas izquierdas (rotZ reemplaza toda la matriz, igual que Java)
    if (c.espejoZ) {
      this.trans.rotZ(Math.PI);
      this.rot.mul(this.trans);
      setTransform(this.rotacion, this.rot);
    }
    // Paso 3: ajuste fino inicial en Y
    this.trans1.rotY(rad(c.initGy));
    this.rot1.mul(this.trans1);
    setTransform(this.rotacion1, this.rot1);
    // La maquina de estados parte de la posicion 1 aunque la rotacion inicial sea initGy (igual que Java).
    this.gY = GRADOS_POR_POSICION_RUEDA;
    this.posicionActual = 1;
  }

  protected crearElementos(): void {
    this.rotacion1.add(this.piezas.clonar('Rueda.3ds'));
  }

  protected ajustarCapacidades(): void {}

  protected articularElementos(): void {
    this.rotacion.add(this.rotacion1);
    this.add(this.rotacion);
  }

  protected ajustesFinales(): void {}

  avanzar(): void {
    this.posicionActual = this.config.avanzaIncrementa ? siguiente(this.posicionActual) : anterior(this.posicionActual);
    this.aplicar();
  }

  retroceder(): void {
    this.posicionActual = this.config.avanzaIncrementa ? anterior(this.posicionActual) : siguiente(this.posicionActual);
    this.aplicar();
  }

  private aplicar(): void {
    const nuevoGy = f32(this.posicionActual * GRADOS_POR_POSICION_RUEDA);
    this.trans1.rotY(rad(f32(nuevoGy - this.gY)));
    this.rot1.mul(this.trans1);
    setTransform(this.rotacion1, this.rot1);
    this.gY = nuevoGy;
  }
}

const siguiente = (p: number): number => (p % NUM_POSICIONES_RUEDA) + 1;
const anterior = (p: number): number => (p === 1 ? NUM_POSICIONES_RUEDA : p - 1);
