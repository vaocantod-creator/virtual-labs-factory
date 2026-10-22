import { Group } from 'three';
import { ObjetoGrafico, type Piezas } from './ObjetoGrafico';
import { Transform3D, f32, rad, setTransform } from '../java3d';

/** Camara (puerto de `Camara.java`): cabeza de la camara, gira en Y local (`rotarEjeY`, 'elevacion'). */
export class Camara extends ObjetoGrafico {
  readonly tg = new Group();
  private readonly trans = new Transform3D();
  private readonly trans1 = new Transform3D();
  private readonly utility = new Transform3D();
  private readonly utility1 = new Transform3D();
  private readonly utility2 = new Transform3D();
  private refY = 0;

  constructor(private readonly piezas: Piezas) {
    super();
    this.construir();
  }

  protected ajustesIniciales(): void {
    this.refY = 0;
    this.trans.setTranslation(0, 0, f32(1.75));
    this.utility.mul(this.trans);
    setTransform(this.tg, this.utility);
    this.utility1.rotX(rad(90));
    this.utility.mul(this.utility1);
    setTransform(this.tg, this.utility);
    this.utility2.rotY(rad(-90));
    this.utility.mul(this.utility2);
    setTransform(this.tg, this.utility);
  }
  protected crearElementos(): void {
    this.tg.add(this.piezas.clonar('Camara1.3ds'));
  }
  protected ajustarCapacidades(): void {}
  protected articularElementos(): void {
    this.add(this.tg);
  }
  protected ajustesFinales(): void {}

  rotarEjeY(giroEjeY: number): void {
    this.trans1.rotZ(rad(giroEjeY - this.refY));
    this.utility.mul(this.trans1);
    setTransform(this.tg, this.utility);
    this.refY = giroEjeY;
  }
}

/** Cremallera (puerto de `Cremallera.java`): sube y baja la camara (`rotarEjeZ` = traslacion en Z). */
export class Cremallera extends ObjetoGrafico {
  readonly tg = new Group();
  camara!: Camara;
  private readonly trans = new Transform3D();
  private readonly utility = new Transform3D();
  private readonly utility1 = new Transform3D();
  private refZ1 = 0;

  constructor(private readonly piezas: Piezas) {
    super();
    this.construir();
  }

  protected ajustesIniciales(): void {
    this.camara = new Camara(this.piezas);
  }
  protected crearElementos(): void {
    this.tg.add(this.piezas.clonar('Cremallera final.3ds'));
    this.tg.add(this.camara);
  }
  protected ajustarCapacidades(): void {}
  protected articularElementos(): void {
    this.trans.setTranslation(0, 0, f32(17));
    this.utility.mul(this.trans);
    setTransform(this.tg, this.utility);
    this.utility1.rotZ(rad(18));
    this.utility.mul(this.utility1);
    setTransform(this.tg, this.utility);
    this.add(this.tg);
  }
  protected ajustesFinales(): void {}

  rotarEjeZ(dezZ: number): void {
    this.trans.setTranslation(0, 0, f32(dezZ - this.refZ1));
    this.utility.mul(this.trans);
    setTransform(this.tg, this.utility);
    this.refZ1 = dezZ;
  }
}

/** Engranaje elevador (puerto de `EngranajeElevador.java`): gira 18 grados por unidad de `girY`. */
export class EngranajeElevador extends ObjetoGrafico {
  readonly tg = new Group();
  private readonly utility = new Transform3D();
  private readonly utility1 = new Transform3D();
  private girY1 = 0;

  constructor(private readonly piezas: Piezas) {
    super();
    this.construir();
  }

  protected ajustesIniciales(): void {
    const trans = new Transform3D();
    const trans1 = new Transform3D();
    const trans2 = new Transform3D();
    trans1.rotY(rad(90));
    this.utility.mul(trans1);
    trans2.rotX(rad(-20));
    this.utility.mul(trans2);
    trans.setTranslation(f32(-11.9), f32(-3.75), f32(-0.67));
    this.utility.mul(trans);
    setTransform(this.tg, this.utility);
  }
  protected crearElementos(): void {
    this.tg.add(this.piezas.clonar('Engranaje Elevador.3DS'));
  }
  protected ajustarCapacidades(): void {}
  protected articularElementos(): void {
    this.add(this.tg);
  }
  protected ajustesFinales(): void {}

  girarEjeY(girY: number): void {
    this.utility1.rotZ(rad(f32(18 * f32(girY - this.girY1))));
    this.utility.mul(this.utility1);
    setTransform(this.tg, this.utility);
    this.girY1 = girY;
  }
}

/** Engranaje base-motor (puerto de `EngranajeBaseMotor.java`): hermano de la estructura de camara, gira en Z. */
export class EngranajeBaseMotor extends ObjetoGrafico {
  readonly tg = new Group();
  private readonly trans1 = new Transform3D();
  private readonly utility = new Transform3D();
  private girZ1 = 0;

  constructor(private readonly piezas: Piezas) {
    super();
    this.construir();
  }

  protected ajustesIniciales(): void {
    const trans = new Transform3D();
    trans.setTranslation(f32(-7.26), f32(5.19), f32(0.29));
    this.utility.mul(trans);
    setTransform(this.tg, this.utility);
  }
  protected crearElementos(): void {
    this.tg.add(this.piezas.clonar('Engranaje Base-Motor.3DS'));
  }
  protected ajustarCapacidades(): void {}
  protected articularElementos(): void {
    this.add(this.tg);
  }
  protected ajustesFinales(): void {}

  girarEjeZ(girZ: number): void {
    this.trans1.rotZ(rad(f32(girZ - this.girZ1)));
    this.utility.mul(this.trans1);
    setTransform(this.tg, this.utility);
    this.girZ1 = girZ;
  }
}

/** Estructura de camara (puerto de `EstructuraCamara.java`): base que gira en Z y porta cremallera y elevador. */
export class EstructuraCamara extends ObjetoGrafico {
  readonly tg = new Group();
  cremallera!: Cremallera;
  elevador!: EngranajeElevador;
  private readonly trans = new Transform3D();
  private readonly trans1 = new Transform3D();
  private readonly trans2 = new Transform3D();
  private readonly trans3 = new Transform3D();
  private refX = 0;

  constructor(private readonly piezas: Piezas) {
    super();
    this.construir();
  }

  protected ajustesIniciales(): void {
    this.cremallera = new Cremallera(this.piezas);
    this.elevador = new EngranajeElevador(this.piezas);
  }
  protected crearElementos(): void {
    this.tg.add(this.cremallera);
    this.tg.add(this.elevador);
    this.tg.add(this.piezas.clonar('Base final.3ds'));
  }
  protected ajustarCapacidades(): void {}
  protected articularElementos(): void {
    this.trans2.setTranslation(f32(-7.27), f32(0.07), f32(-0.5));
    this.trans1.mul(this.trans2);
    setTransform(this.tg, this.trans1);
    this.trans3.rotZ(rad(-110));
    this.trans1.mul(this.trans3);
    setTransform(this.tg, this.trans1);
    this.add(this.tg);
  }
  protected ajustesFinales(): void {}

  rotarEjeZ(giroEjeX: number): void {
    this.trans.rotZ(rad(giroEjeX - this.refX));
    this.trans1.mul(this.trans);
    setTransform(this.tg, this.trans1);
    this.refX = giroEjeX;
  }
}
