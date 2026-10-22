import * as THREE from 'three';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Las 19 piezas del repo vdiquez/Rbot (carpeta piezas/). Nombres exactos de archivo.
const PIEZAS = [
  'Base final.3ds', 'Camara1.3ds', 'Cremallera final.3ds', 'Cremallera.3ds', 'Cuarto.3DS',
  'Cuerpo Robot Pintado.3DS', 'Cuerpo.3ds', 'Engranaje Base-Motor.3DS', 'Engranaje Elevador.3DS',
  'Pieza de oruga Pintada.3DS', 'Pieza1Oruga.3ds', 'Pieza1OrugaNegra.3ds', 'PiezaOruga.3ds',
  'PiezaOrugaAutoCad.3ds', 'PiezaOrugaGris.3DS', 'PiezaOrugaNegra.3DS', 'Rueda.3ds',
  'cilindros.3DS', 'cuarto de prueba.3DS',
];

interface Informe {
  archivo: string;
  ok: boolean;
  error?: string;
  mallas: number;
  triangulos: number;
  materiales: number;
  texturas: number;
  caja: { x: number; y: number; z: number } | null;
  vacia: boolean;
}

declare global {
  interface Window {
    __rbotInforme?: Informe[];
    __rbotListo?: boolean;
  }
}

const contenedor = document.getElementById('app') as HTMLElement;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
contenedor.appendChild(renderer.domElement);

const escena = new THREE.Scene();
escena.background = new THREE.Color(0x1b1f27);
escena.add(new THREE.HemisphereLight(0xffffff, 0x333344, 1.2));
const sol = new THREE.DirectionalLight(0xffffff, 1.6);
sol.position.set(5, 10, 7);
escena.add(sol);

const camara = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 5000);
const controles = new OrbitControls(camara, renderer.domElement);

const cargador = new TDSLoader();
// Las texturas (si las hubiera) se resuelven junto a los modelos.
cargador.setResourcePath('/models/');

function medir(grupo: THREE.Object3D): Omit<Informe, 'archivo' | 'ok' | 'error'> {
  let mallas = 0;
  let triangulos = 0;
  const materiales = new Set<THREE.Material>();
  let texturas = 0;
  grupo.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      mallas++;
      const g = m.geometry;
      triangulos += g.index ? g.index.count / 3 : (g.attributes.position?.count ?? 0) / 3;
      const lista = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of lista) {
        materiales.add(mat);
        if ((mat as THREE.MeshPhongMaterial).map) texturas++;
      }
    }
  });
  const caja = new THREE.Box3().setFromObject(grupo);
  const vacia = caja.isEmpty();
  const s = new THREE.Vector3();
  if (!vacia) caja.getSize(s);
  return {
    mallas,
    triangulos: Math.round(triangulos),
    materiales: materiales.size,
    texturas,
    caja: vacia ? null : { x: +s.x.toFixed(3), y: +s.y.toFixed(3), z: +s.z.toFixed(3) },
    vacia,
  };
}

async function cargarPieza(archivo: string): Promise<{ inf: Informe; objeto?: THREE.Group }> {
  const url = '/models/' + encodeURIComponent(archivo);
  try {
    const objeto = await new Promise<THREE.Group>((res, rej) => cargador.load(url, res, undefined, rej));
    const datos = medir(objeto);
    return { inf: { archivo, ok: !datos.vacia, ...datos, error: datos.vacia ? 'cargo pero la geometria esta vacia' : undefined }, objeto };
  } catch (e) {
    return {
      inf: { archivo, ok: false, mallas: 0, triangulos: 0, materiales: 0, texturas: 0, caja: null, vacia: true, error: String(e) },
    };
  }
}

async function main(): Promise<void> {
  const informes: Informe[] = [];
  const objetos: { archivo: string; objeto: THREE.Group }[] = [];
  for (const p of PIEZAS) {
    const { inf, objeto } = await cargarPieza(p);
    informes.push(inf);
    if (objeto && inf.ok) objetos.push({ archivo: p, objeto });
  }

  // Cada pieza se coloca en una rejilla, normalizada a ~1 unidad, solo para inspeccion visual.
  const cols = 5;
  const celda = 1.6;
  objetos.forEach(({ objeto }, i) => {
    const caja = new THREE.Box3().setFromObject(objeto);
    const tam = caja.getSize(new THREE.Vector3());
    const mayor = Math.max(tam.x, tam.y, tam.z) || 1;
    const k = 1 / mayor;
    const centro = caja.getCenter(new THREE.Vector3());
    const cont = new THREE.Group();
    objeto.position.sub(centro);
    cont.add(objeto);
    cont.scale.setScalar(k);
    cont.position.set((i % cols) * celda, 0, Math.floor(i / cols) * celda);
    escena.add(cont);
  });

  const filas = Math.ceil(objetos.length / cols);
  camara.position.set((cols * celda) / 2, 3.2, filas * celda + 1.5);
  controles.target.set(((cols - 1) * celda) / 2, 0, ((filas - 1) * celda) / 2);
  controles.update();

  const panel = document.getElementById('panel') as HTMLElement;
  const okN = informes.filter((i) => i.ok).length;
  panel.innerHTML =
    `<b>${okN}/${informes.length} piezas cargadas</b><table>` +
    informes
      .map(
        (i) =>
          `<tr class="${i.ok ? 'ok' : 'bad'}"><td>${i.ok ? '✔' : '✘'}</td><td>${i.archivo}</td><td>${i.mallas} mallas</td><td>${i.triangulos} tri</td><td>${i.materiales} mat</td><td>${i.texturas} tex</td></tr>`,
      )
      .join('') +
    '</table>';

  window.__rbotInforme = informes;
  window.__rbotListo = true;
}

function bucle(): void {
  controles.update();
  renderer.render(escena, camara);
  requestAnimationFrame(bucle);
}

window.addEventListener('resize', () => {
  camara.aspect = window.innerWidth / window.innerHeight;
  camara.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

bucle();
void main();
