import { Group } from 'three';

/** Origen de las piezas 3D: devuelve una copia independiente de cada `.3ds` cargado. */
export interface Piezas {
  clonar(archivo: string): Group;
}

/**
 * Patron Graphic Element Handler del profesor Castillo, portado a Three.js.
 *
 * Verificado en el bytecode de `ComponentesLaboratorioVirtual.ObjetosGraficos.ObjetoGrafico` (docs/13 del repo
 * de la fabrica): cinco metodos abstractos protegidos, invocados en este orden desde el constructor.
 *
 * Diferencias con Java, por el lenguaje y la libreria:
 * - TypeScript inicializa los campos de la subclase DESPUES de `super()`, asi que la base no puede llamar a los
 *   metodos desde su constructor. Cada subclase llama a `construir()` al final de su propio constructor.
 * - Three.js no tiene "capacidades" de nodo (ALLOW_TRANSFORM_WRITE/READ de Java3D): `ajustarCapacidades` se
 *   conserva por fidelidad al patron y aqui se usa para desactivar `matrixAutoUpdate` en los nodos que se
 *   mueven con matrices explicitas.
 */
export abstract class ObjetoGrafico extends Group {
  protected construir(): void {
    this.ajustesIniciales();
    this.crearElementos();
    this.ajustarCapacidades();
    this.articularElementos();
    this.ajustesFinales();
  }

  protected abstract ajustesIniciales(): void;
  protected abstract crearElementos(): void;
  protected abstract ajustarCapacidades(): void;
  protected abstract articularElementos(): void;
  protected abstract ajustesFinales(): void;
}
