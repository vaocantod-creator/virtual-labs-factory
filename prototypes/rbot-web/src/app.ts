import * as THREE from 'three';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { Entorno, type Codigo, type Estado } from './robot/Entorno';
import type { Piezas } from './robot/ObjetoGrafico';
import { Transporte, validarDestino, type Rol } from './red/transporte';
import { CONTROLES, ModeloControl, TECLAS } from './red/centro';

type RolApp = 'autonomo' | Rol;
const params = new URLSearchParams(location.search);
const ROL: RolApp = params.get('rol') === 'receptor' ? 'receptor' : params.get('rol') === 'centro' ? 'centro' : 'autonomo';
const URL_PUENTE = params.get('puente') ?? 'ws://127.0.0.1:8765';
const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

function mostrarEstado(txt: string, nivel: 'info' | 'aviso' | 'error' = 'info'): void {
  const e = $('estado');
  e.textContent = txt; // textContent: el texto puede venir de la red, nunca se interpreta como HTML
  e.className = nivel;
}

declare global {
  interface Window {
    __rbot?: {
      listo: boolean;
      ejecutar(l: string): void;
      estado(): Estado;
      historial(): string[];
      probar(l: string, modo?: 'legado' | 'mejorado'): Estado;
      error?: string;
    };
  }
}

const ARCHIVOS = [
  'Cuerpo Robot Pintado.3DS', 'Pieza1Oruga.3ds', 'Rueda.3ds', 'Cuarto.3DS', 'Engranaje Base-Motor.3DS',
  'Engranaje Elevador.3DS', 'Cremallera final.3ds', 'Camara1.3ds', 'Base final.3ds',
];

async function cargarPiezas(): Promise<Piezas & { cuarto: THREE.Group }> {
  const cargador = new TDSLoader();
  cargador.setResourcePath('/models/');
  const cache = new Map<string, THREE.Group>();
  for (const a of ARCHIVOS) {
    const g = await new Promise<THREE.Group>((res, rej) => cargador.load('/models/' + encodeURIComponent(a), res, undefined, rej));
    cache.set(a, g);
  }
  return {
    clonar(archivo: string): THREE.Group {
      const g = cache.get(archivo);
      if (!g) throw new Error('Pieza no cargada: ' + archivo);
      return g.clone(true);
    },
    cuarto: cache.get('Cuarto.3DS')!.clone(true),
  };
}

async function main(): Promise<void> {
  $('rolTxt').textContent = ROL === 'receptor' ? 'Entorno Experimental (Receptor)' : ROL === 'centro' ? 'Centro de Mando' : 'autonomo';
  if (ROL === 'centro') return centroDeMando();
  const contenedor = document.getElementById('app') as HTMLElement;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setScissorTest(true);
  renderer.setPixelRatio(1);
  contenedor.appendChild(renderer.domElement);

  const piezas = await cargarPiezas();
  const entorno = new Entorno(piezas, piezas.cuarto);

  // Iluminacion de VirtualScenary: 4 luces direccionales (0.45) + ambiental (0.07) + fondo (0.28, 0.5, 0.75).
  // Java3D usa intensidad lineal; Three.js (fisica) divide el difuso por PI, por eso se multiplica por PI.
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0.28, 0.5, 0.75);
  const dirs: Array<[number, number, number]> = [
    [700, 500, 900],
    [700, -500, -900],
    [-700, -500, 900],
    [-700, 500, -900],
  ];
  for (const d of dirs) {
    const l = new THREE.DirectionalLight(0xffffff, 0.45 * Math.PI);
    l.position.set(-d[0], -d[1], -d[2]); // Java: direccion en la que viaja la luz
    escena.add(l);
  }
  escena.add(new THREE.AmbientLight(0xffffff, 0.07 * Math.PI));
  escena.add(entorno.raiz);

  // Disposicion 2x2 del "Receptor" (GridLayout(2,2) con bordes de 5-10 px en Java).
  const paneles = [
    { cam: entorno.vistas.iso, x: 0, y: 1 },
    { cam: entorno.vistas.superior, x: 1, y: 1 },
    { cam: entorno.vistas.primera, x: 0, y: 0 },
    { cam: entorno.vistas.cercana, x: 1, y: 0 },
  ];
  const etiquetas = ['e1', 'e2', 'e3', 'e4'].map((id) => document.getElementById(id) as HTMLElement);

  function ajustar(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    const pw = Math.floor(w / 2);
    const ph = Math.floor(h / 2);
    for (const p of paneles) {
      p.cam.aspect = pw / ph;
      // Java3D: campo de vision de 45 grados HORIZONTAL; Three.js usa el vertical.
      p.cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(Math.PI / 8) / p.cam.aspect));
      p.cam.updateProjectionMatrix();
    }
    paneles.forEach((p, i) => {
      etiquetas[i].style.left = p.x * pw + 8 + 'px';
      etiquetas[i].style.top = (1 - p.y) * ph + 6 + 'px';
    });
  }
  window.addEventListener('resize', ajustar);
  ajustar();

  function dibujar(): void {
    const w = renderer.domElement.width;
    const h = renderer.domElement.height;
    const pw = Math.floor(w / 2);
    const ph = Math.floor(h / 2);
    escena.updateMatrixWorld(true);
    for (const p of paneles) {
      renderer.setViewport(p.x * pw, p.y * ph, pw, ph);
      renderer.setScissor(p.x * pw, p.y * ph, pw, ph);
      renderer.render(escena, p.cam);
    }
  }
  renderer.setAnimationLoop(dibujar);

  // Retransmision (EnvironmentReceiver.retransmit): tras ejecutar un comando recibido, se reenvia al destino configurado.
  let transporte: Transporte | null = null;
  const destino = () => validarDestino($<HTMLInputElement>('ipDestino').value, $<HTMLInputElement>('puertoDestino').value);

  if (ROL === 'receptor') {
    $<HTMLInputElement>('puertoDestino').value = '8080';
    $('ctl').style.display = 'none'; // el Receptor de Java no tiene controles
    transporte = new Transporte('receptor', (c) => {
      entorno.ejecutar(c);
      transporte?.enviar(c, destino()).catch((e: Error) => mostrarEstado(e.message, 'aviso'));
    }, mostrarEstado, URL_PUENTE);
    transporte.conectar().then(() => {
      $('ipLocal').textContent = transporte!.info.ipLocal;
      $('puertoLocal').textContent = String(transporte!.info.puertoLocal ?? '—');
    }).catch((e: Error) => mostrarEstado(e.message, 'error'));
  } else {
    // autonomo: los comandos se ejecutan localmente (sin red)
    const teclas = TECLAS;
    window.addEventListener('keydown', (e) => {
      const c = teclas[e.key];
      if (c) { entorno.ejecutar(c); e.preventDefault(); }
    });
    for (const spec of CONTROLES) {
      const id = spec.nombre === 'movVertical' ? 'mv' : spec.nombre === 'azimut' ? 'az' : 'el';
      const el = $<HTMLInputElement>(id);
      const modelo = new ModeloControl(spec);
      el.addEventListener('input', () => {
        for (const c of modelo.cambiar(Number(el.value))) entorno.ejecutar(c);
        el.value = String(modelo.valor);
        $(id + 'v').textContent = String(modelo.valor);
      });
    }
  }

  window.__rbot = {
    listo: true,
    ejecutar: (l) => entorno.secuencia(l),
    estado: () => entorno.estado(),
    historial: () => [...entorno.historial],
    // Estado tras una secuencia en un Entorno nuevo (sin dibujar): para la prueba de paridad con Java.
    probar: (l, modo = 'mejorado') => {
      const e = new Entorno(piezas, undefined, modo);
      e.secuencia(l);
      return e.estado();
    },
  };
}

/** Centro de Mando (Transmitter + ViewFinder): sin escena 3D; solo envia comandos por UDP al destino. */
function centroDeMando(): Promise<void> {
  $('app').style.display = 'none';
  for (const id of ['e1', 'e2', 'e3', 'e4']) $(id).style.display = 'none';
  $('red').style.left = '8px'; $('red').style.right = 'auto'; $('red').style.top = '48px';
  $('ctl').style.left = '8px'; $('ctl').style.right = 'auto'; $('ctl').style.top = '250px';
  $<HTMLInputElement>('puertoDestino').value = '5555';

  const transporte = new Transporte('centro', () => { /* el Centro de Mando de Java tampoco muestra lo que llega */ }, mostrarEstado, URL_PUENTE);
  const enviar = (c: Codigo): void => {
    let d;
    try { d = validarDestino($<HTMLInputElement>('ipDestino').value, $<HTMLInputElement>('puertoDestino').value); }
    catch (e) { $<HTMLInputElement>('puertoDestino').classList.add('mal'); return mostrarEstado((e as Error).message, 'error'); }
    $<HTMLInputElement>('puertoDestino').classList.remove('mal');
    transporte.enviar(c, d).catch((e: Error) => mostrarEstado(e.message, 'error'));
  };
  transporte.conectar().then(() => {
    $('ipLocal').textContent = transporte.info.ipLocal;
    $('puertoLocal').textContent = String(transporte.info.puertoLocal ?? '—');
  }).catch((e: Error) => mostrarEstado(e.message, 'error'));

  window.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (t instanceof HTMLInputElement && t.type === 'text') return; // no capturar flechas al editar IP/puerto
    const c = TECLAS[e.key];
    if (c) { enviar(c); e.preventDefault(); }
  });
  for (const spec of CONTROLES) {
    const id = spec.nombre === 'movVertical' ? 'mv' : spec.nombre === 'azimut' ? 'az' : 'el';
    const el = $<HTMLInputElement>(id);
    const modelo = new ModeloControl(spec);
    el.addEventListener('input', () => {
      for (const c of modelo.cambiar(Number(el.value))) enviar(c);
      el.value = String(modelo.valor);
      $(id + 'v').textContent = String(modelo.valor);
    });
  }
  window.__rbot = { listo: true, ejecutar: (l) => { for (const c of l) enviar(c as Codigo); }, estado: () => ({}) as Estado, historial: () => [], probar: () => ({}) as Estado };
  return Promise.resolve();
}

main().catch((e) => {
  console.error(e);
  window.__rbot = { listo: false, error: String(e), ejecutar() {}, estado: () => ({}) as Estado, historial: () => [], probar: () => ({}) as Estado };
});
