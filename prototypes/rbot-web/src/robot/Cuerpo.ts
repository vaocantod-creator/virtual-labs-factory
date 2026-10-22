import { Group } from 'three';
import { ObjetoGrafico, type Piezas } from './ObjetoGrafico';
import { Transform3D, f32, rad, setTransform } from '../java3d';
import { PASO_AVANCE, PASO_GIRO_GRADOS, RUEDAS, type Modo } from './constantes';
import { TrackAssembly } from './oruga';
import { WheelMovement } from './rueda';
import { EngranajeBaseMotor, EstructuraCamara } from './camara';

/**
 * Cuerpo del robot (puerto de `Cuerpo.java`). Reune chasis, 4 ruedas, 2 orugas de 29 eslabones y la estructura de camara.
 *
 * Comportamiento heredado que se CONSERVA a proposito (la paridad con Java es el criterio de aceptacion):
 * - `avanzar`/`retroceder` comparten `paso` y `refX`: el primer paso hacia delante mide +1 y los siguientes -4, y al
 *   invertir el sentido el primer paso sigue en la misma direccion. Esto viene de Java; no es un error de la migracion.
 * - `tg3` de Java se calcula pero nunca se agrega al grafo: no se porta.
 * - `Posicionamiento` de Java se instancia pero no se agrega al grafo: no se porta.
 */
export class Cuerpo extends ObjetoGrafico {
  readonly tg = new Group();
  readonly tg1 = new Group(); // oruga "derecha" (y = +25.45)
  readonly tg2 = new Group(); // oruga "izquierda" (y = -25.45)
  ruedas!: WheelMovement[];
  od!: TrackAssembly;
  od1!: TrackAssembly;
  ecm!: EstructuraCamara;
  ebm!: EngranajeBaseMotor;

  private readonly util2 = new Transform3D();
  private readonly util4 = new Transform3D();
  private readonly utility55 = new Transform3D();
  private paso = 1; // float
  private refX = 0; // float
  private der = 0.1; // double
  private refIZ = 0; // double

  constructor(
    private readonly piezas: Piezas,
    private readonly modo: Modo = 'mejorado',
  ) {
    super();
    this.construir();
  }

  protected ajustesIniciales(): void {
    this.ecm = new EstructuraCamara(this.piezas);
    this.ebm = new EngranajeBaseMotor(this.piezas);
    this.ruedas = RUEDAS.map((c) => new WheelMovement(this.piezas, c));
    this.od = new TrackAssembly(this.piezas);
    this.od1 = new TrackAssembly(this.piezas);
  }

  protected crearElementos(): void {
    this.tg.add(this.piezas.clonar('Cuerpo Robot Pintado.3DS'));
  }

  protected ajustarCapacidades(): void {}

  protected articularElementos(): void {
    const utility = new Transform3D();
    const trans = new Transform3D();
    trans.setTranslation(f32(1.45), f32(25.45), f32(-7.13));
    utility.mul(trans);
    setTransform(this.tg1, utility);
    const utility11 = new Transform3D();
    const trans1 = new Transform3D();
    trans1.setTranslation(f32(1.45), f32(-25.45), f32(-7.13));
    utility11.mul(trans1);
    setTransform(this.tg2, utility11);
    this.tg1.add(this.od);
    this.tg2.add(this.od1);
    for (const w of this.ruedas) this.tg.add(w);
    this.tg.add(this.ecm);
    this.tg.add(this.ebm);
    this.tg.add(this.tg1);
    this.tg.add(this.tg2);
    this.add(this.tg);
  }

  protected ajustesFinales(): void {
    // Eleva el robot para que las orugas despejen el suelo; util2 acumula todo el movimiento posterior.
    this.util2.setTranslation(0, 0, f32(5));
    setTransform(this.tg, this.util2);
  }

  moverOrugaDerecha(): void {
    for (const l of this.od.eslabones) l.avanzar();
    for (const w of this.ruedas) w.avanzar();
    for (const l of this.od1.eslabones) l.avanzar();
  }

  moverOrugaIzquierda(): void {
    for (const l of this.od.eslabones) l.retroceder();
    for (const w of this.ruedas) w.retroceder();
    for (const l of this.od1.eslabones) l.retroceder();
  }

  moverDerecha(): void {
    for (const l of this.od.eslabones) l.retroceder();
    for (const w of this.ruedas) {
      if (w.avanzaIncrementa) w.retroceder();
      else w.avanzar();
    }
    for (const l of this.od1.eslabones) l.avanzar();
  }

  moverIzquierda(): void {
    for (const l of this.od.eslabones) l.avanzar();
    for (const w of this.ruedas) {
      if (w.avanzaIncrementa) w.avanzar();
      else w.retroceder();
    }
    for (const l of this.od1.eslabones) l.retroceder();
  }

  /** Traslada el cuerpo `dx` en su eje X local (el frente del robot es -X). */
  private trasladarX(dx: number): void {
    this.util4.setTranslation(dx, 0, 0);
    this.util2.mul(this.util4);
    setTransform(this.tg, this.util2);
  }

  /** Gira el cuerpo `grados` alrededor de Z (positivo = antihorario visto desde arriba). */
  private girarZ(grados: number): void {
    this.utility55.rotZ(rad(grados));
    this.util2.mul(this.utility55);
    setTransform(this.tg, this.util2);
  }

  avanzar(): void {
    if (this.modo === 'mejorado') return this.trasladarX(-PASO_AVANCE);
    this.util4.setTranslation(f32(this.paso - this.refX), 0, 0);
    this.util2.mul(this.util4);
    setTransform(this.tg, this.util2);
    this.refX = this.paso;
    this.paso = f32(this.paso - 4);
  }

  retroceder(): void {
    if (this.modo === 'mejorado') return this.trasladarX(PASO_AVANCE);
    this.util4.setTranslation(f32(this.paso - this.refX), 0, 0);
    this.util2.mul(this.util4);
    setTransform(this.tg, this.util2);
    this.refX = this.paso;
    this.paso = f32(this.paso + 4);
  }

  derecha(): void {
    if (this.modo === 'mejorado') return this.girarZ(-PASO_GIRO_GRADOS);
    this.utility55.rotZ(rad(this.der - this.refIZ));
    this.util2.mul(this.utility55);
    setTransform(this.tg, this.util2);
    this.refIZ = this.der;
    this.der -= 4;
  }

  izquierda(): void {
    if (this.modo === 'mejorado') return this.girarZ(PASO_GIRO_GRADOS);
    this.utility55.rotZ(rad(this.der - this.refIZ));
    this.util2.mul(this.utility55);
    setTransform(this.tg, this.util2);
    this.refIZ = this.der;
    this.der += 4;
  }
}
