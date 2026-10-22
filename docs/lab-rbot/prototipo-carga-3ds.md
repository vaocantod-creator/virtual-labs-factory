# Prototipo rbot-web: carga de las piezas `.3ds` de Rbot en Three.js

> Estado: prototipo ejecutado el 2026-10-22. Codigo en `prototypes/rbot-web/` (este repo). Responde a la hipotesis
> abierta del ADR-0001: *"la carga limpia de los `.3ds` con `TDSLoader` es una hipotesis"*.
> Captura: `docs/lab-rbot/img/prototipo-3ds.png`.

## Resultado

**Las 19 piezas cargan con `TDSLoader` (Three.js 0.186.1), con geometria real, sin errores ni
excepciones en consola.** Se verifico en Chromium sin pantalla con WebGL por software (SwiftShader), lo que
tambien muestra que la carga no exige GPU dedicada.

| Medida | Valor |
|---|---|
| Piezas cargadas | 19 / 19 |
| Triangulos totales | 38.422 |
| Texturas | 0 (todas las piezas usan colores de material, sin imagenes) |
| Errores de carga | 0 |
| Compilacion `tsc` estricta | sin errores |

La captura confirma a simple vista formas coherentes (engranajes dentados, orugas, rueda, camara, cajas) y
colores desde los propios archivos (rojo, verde, azul, negro, gris). Varias piezas no se distinguen bien en
la captura (algunas quedan tapadas por el panel o fuera de cuadro), por lo que el conteo y las medidas
son la evidencia principal, no solo la imagen.

## Hallazgos para la migracion

1. **Java usa 10 de las 19 piezas.** Las usadas por el codigo: `Cuerpo Robot Pintado`, `Pieza1Oruga`, `Rueda`,
   `Cuarto`, `Engranaje Base-Motor`, `Pieza de oruga Pintada`, `Engranaje Elevador`, `Cremallera final`,
   `Camara1`, `Base final`. Las otras 9 estan en la carpeta pero ningun `loader.load` las referencia:
   `Cuerpo`, `Cremallera`, `PiezaOruga`, `PiezaOrugaAutoCad`, `PiezaOrugaGris`, `PiezaOrugaNegra`,
   `Pieza1OrugaNegra`, `cilindros`, `cuarto de prueba`. Son candidatas a no migrarse (confirmar con Victor).
2. **Variantes casi identicas.** Las orugas aparecen en 7 variantes (476 o 1.544 triangulos); `Cuerpo` y
   `Cuerpo Robot Pintado` tienen la misma geometria (3.472 triangulos, mismas dimensiones) y solo cambian los
   materiales (4 vs 5). Es oportunidad de consolidar en un componente parametrico (como ya hizo `WheelMovement`).
3. **Los colores vienen de los `.3ds`.** El codigo Java de Rbot no define `Appearance` ni `Material`
   (0 ocurrencias), asi que el aspecto es el del archivo. `TDSLoader` lo reproduce con materiales Phong.
4. **Unidades heterogeneas.** El cuerpo mide ~40 unidades, la rueda ~20, las piezas de oruga ~5-6, pero
   `Cuarto` mide ~1.450 x 1.390 x 450 y `cuarto de prueba` ~500. Rbot no aplica ninguna escala en Java, asi
   que toda la cinematica trabaja en esas unidades crudas. Para WebXR (1 unidad = 1 metro) habra que decidir
   un factor de escala unico (propuesta en ADR-0001, regla 2).
5. **Orientacion de ejes sin verificar.** `TDSLoader` no reorienta ejes; no se ha comprobado si el eje
   vertical de los modelos coincide con el que usa Rbot en Java3D. Hay que verificarlo con el primer
   ensamblaje (cuerpo + orugas + camara).

## Lo que NO prueba este prototipo

- **No hay paridad visual con Java.** No ejecute Rbot (necesita pantalla). Victor envio despues una grabacion
  (`evidencia-video-rbot.md`), que ya sirve de referencia visual, pero la comparacion pieza por pieza aun no se hizo.
- No mide rendimiento ni fotogramas por segundo; SwiftShader (software) no es representativo.
- No cubre iluminacion, sombras, texturas de entorno ni la camara de Rbot.
- No toca la cinematica, el protocolo UDP ni el puente WebSocket.
- Con 0 texturas, no se valido la carga de imagenes (no hacen falta para estas piezas).

## Siguiente paso propuesto

Ensamblar el **robot completo** (cuerpo, 4 ruedas, orugas, estructura de camara) con las posiciones que usa
`Cuerpo.java` y compararlo con la vista cercana del video (`img/rbot-java-inicio.jpg`, abajo derecha).
