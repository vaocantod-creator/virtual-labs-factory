# 12. Videos del Laboratorio de Instrumentacion Electronica (insumo del profesor Castillo)

> Fuente: 29 videos (~36 min de audio) enviados por Victor, grabaciones del software del laboratorio
> virtual con narracion. Procesados con transcripcion automatica (faster-whisper `small`, espanol) y
> extraccion de fotogramas. Transcripciones completas: `docs/lab-instrumentacion/transcripciones.md`.
> **Limites:** la transcripcion tiene errores de reconocimiento (ver seccion 6). No pude interpretar
> el contenido visual de los fotogramas con fiabilidad; lo aqui descrito sale del audio. Los JARs
> aun no han llegado.

## 1. Que son los videos

Son **guias de practica narradas** sobre el laboratorio: un osciloscopio de 2 canales y hasta 2
generadores de senales, en el mismo espacio virtual. Cada video sigue un patron repetido:
**concepto -> procedimiento paso a paso -> verificacion con el osciloscopio**. Ese patron es la
materia prima natural de una rubrica PDD ejecutable (docs/07 seccion 10).

## 2. Catalogo por tema (sin duplicados)

Osciloscopio — conocimiento del equipo
- Introduccion: componentes (pantalla, panel vertical, horizontal, navegacion, encendido, entradas). `f2d230bcc3ed`
  (`b24670c9727c` y `e9c40b41ddd9` son versiones cortas/cortadas de la misma introduccion).
- Boton de encendido/apagado. `51aa6a3fe75c`
- Entradas de senal (canal 1, 2 y una tercera "aux" que no se estudia). `47c8c23c00a5`
- Controles verticales y canales (CH1 rojo, CH2 amarillo; visibilizar/invisibilizar). `6f2400a35920`, `060706692ba1`
- Control horizontal (escala de tiempo, producto escala x divisiones constante). `45a039fdc647`
- Pantalla: grilla, ejes, linea superior de mensajes, linea inferior de calibracion. `3af754162d8b`
- Grosor de grilla, senales y cursores (tres controles). `451a171aedd6`
- Cursores horizontales/verticales: visibilidad (3 botones), activo unico tipo radio (CH1, CH2, CV1,
  CV2), perilla con boton izq./der. del raton, mini-botones de incremento. `820afeb6c9c4`, `4f285eb7c328`
- Mediciones: voltaje pico a pico con cursores horizontales `84dfd5e2cf4a`; periodo con cursores
  verticales y dos escalas (10 ns) `6ad6c039fb77` (= `aeec64a297b1`, copia identica).

Generador de senales
- Funciones basicas a verificar (encendido con config. inicial, reinicio al apagar/encender, ajuste
  de parametros, validar display con osciloscopio, cambio de banda). `c1f76605cba1`
- Valores iniciales al encender (portadora 100 MHz, 10 V, 0 V DC; moduladora 10 MHz, 5 V). `8219184f738a`
- Formas de onda (seno, cuadrada, triangular, rampa). `b295375d72a4`
- Cambio de escala de frecuencia (MHz/kHz/Hz con Shift+flechas). `4c4fb3dc82f3`
- Cambio de escala de voltaje (V/mV/uV). `d950d89d2787`
- Ingreso numerico por teclado (modo "num", Enter, abortar). `6dd21e33d46a`
- Cambios de fase de la portadora (con 2do generador como referencia). `8e26fbf9b207`
- Tipos de modulacion: AM, FM, FSK; 2 generadores para comparar modulada vs. sin modular.
  `d68814145929` (`ffbae6058fe0` es solo el inicio de ese video).
- Modulacion (teoria + AM con config. 4, portadora/moduladora, teclas Single/Recall). `d3a8fd1302b1`
- Modulacion FM `c1cee915dace`; FSK `d6fc03a10298`.
- Indice de modulacion AM con cursores (formula con maximo/minimo). `e75b77df53b3`

Integracion
- Montajes basicos: menu "Configuraciones" (1, 4, 5), punto de vista "Azimuth", cable generador ->
  canal 1/2, efecto de encender/apagar cada equipo. `d2a4419d167a`

Duplicados detectados: 29 archivos = ~25 contenidos unicos (`aeec64a297b1`=`6ad6c039fb77`;
`b24670c9727c`, `e9c40b41ddd9` ⊂ `f2d230bcc3ed`; `ffbae6058fe0` ⊂ `d68814145929`).

## 3. Lo que revelan sobre el metodo del profesor (lectura para la fabrica)

1. **Valores iniciales deterministas** (100 MHz / 10 V / 0 V DC / fase 0 / seno; moduladora 10 MHz /
   5 V; osciloscopio a 2 V/div y 2 ns/div, cursores en cero y no visibles). Son oraculos de test
   automatico directos (`lab.model.numeric_deviation`).
2. **Reinicio por ciclo de encendido** (apagar/encender restaura configuracion por defecto): invariante
   para la constitution del lab.
3. **Acoplamiento entre equipos**: apagar el generador lleva la senal a cero en el osciloscopio;
   encenderlo restaura la senal con valores iniciales; cada generador alimenta un canal distinto en
   la config. 5. Es interoperabilidad (articulo, seccion 3).
4. **Principio didactico explicito**: cambiar la escala del osciloscopio no cambia la senal, solo su
   presentacion (producto escala x divisiones constante). Es un criterio PDD concreto.
5. **Patron de verificacion cruzada**: cada parametro del generador se comprueba midiendo en el
   osciloscopio (cuenta de divisiones o cursores). La practica es un test de sistema, no de un solo
   equipo.
6. **Segundo generador como referencia** (senal sin modular / moduladora replicada) para visualizar
   efecto de AM/FM/FSK/fase.
7. **Componentes reutilizables observados** (Component Library): perilla con boton izq./der. del raton
   y paso de incremento configurable, botones tipo radio (cursor activo), teclas multifuncion con
   Shift, display con linea de mensajes, controles de grosor de linea, cursores H/V con diferencia
   (CV2 - CV1, CH2 - CH1).
8. **Escala temporal de nanosegundos** (portadora de 100 MHz, 2 ns/div): el modelo opera con
   cantidades fisicas reales, no una animacion cualitativa -> alta exigencia de fidelidad matematica.
9. **Navegacion 3D**: menu de configuraciones (equipos preubicados) + punto de vista (azimuth) para
   mejorar la vista de cables. Refuerza el requisito de configuraciones predefinidas.

## 4. Mapa de practicas -> rubricas PDD candidatas

Cada fila es una rubrica ejecutable: accion del estudiante + resultado medible esperado.
- Valores iniciales: f=100 MHz, A=10 V, DC=0; moduladora 10 MHz, 5 V. (`8219184f738a`)
- Periodo de la portadora con CV1/CV2: CV2-CV1 = 10 ns, igual en 2 escalas. (`6ad6c039fb77`)
- Pico a pico: 20 V (pico 10 V), invariante al cambiar escala (2 V/div -> 5 V/div). (`84dfd5e2cf4a`)
- Cambio de escala de frecuencia: 100 MHz -> 100 kHz -> 100 Hz -> 100 MHz. (`4c4fb3dc82f3`)
- Cambio de escala de voltaje: 10 V -> 10 mV -> 10 uV -> 10 V. (`d950d89d2787`)
- Ingreso numerico: 120.00 en frecuencia; 13 -> 13 mV tras Shift+abajo; abortar restaura valor. (`6dd21e33d46a`)
- Fase: rango +-360 grados, paso 10, desplazamiento horizontal segun signo. (`8e26fbf9b207`)
- AM: indice m entre 0 y 1 desde max/min de la portadora; ejemplo con portadora 12 V a 110 MHz,
  moduladora 8 MHz y 6 V. (`e75b77df53b3`)
- FM: al subir la amplitud de la moduladora aumenta la desviacion de frecuencia; amplitud 0 elimina
  la modulacion. (`c1cee915dace`)
- FSK: amplitudes 3 V acercan las dos frecuencias, 7 V las alejan; frecuencia moduladora 5 vs 13 MHz
  cambia el tiempo en cada frecuencia. (`d6fc03a10298`)
- Conectividad: apagar un generador lleva su canal a cero; el otro permanece. (`d2a4419d167a`)

## 5. Brechas y preguntas (para `docs/11` y la conversacion con el profesor)

- **Faltan en los videos:** disparo/sincronismo (trigger), acoplamiento AC/DC, demodulacion, el
  analizador de espectro/FFT que cita el articulo, y la entrada "aux". ¿Existen en el software o solo
  estan previstos?
- **Posible imprecision en un guion** (`4c4fb3dc82f3`): pide "manipular la perilla de escala vertical"
  para ver ciclos al cambiar frecuencia; en terminos fisicos corresponde a la escala *horizontal*
  (tiempo). Confirmar si es error de la narracion o de la transcripcion.
- **Practicas de modulacion** usan config. 4 (un generador) y 5 (dos); confirmar el catalogo completo
  de las 5 configuraciones y que equipo hay en cada una.
- ¿Son estas las "practicas" y los "manuales" que cita el articulo? ¿Hay manuales escritos y banco
  de preguntas/rubricas asociados?
- ¿El software es el mismo prototipo del articulo (Java 15/Java3D) o una version posterior?
- Licencia y autoria: los videos usan el software del profesor; confirmar permiso para citarlos,
  publicarlos o derivar rubricas.

## 6. Notas de calidad de la transcripcion (terminos a confirmar con el software real)

Errores probables del reconocimiento: "Megajards" = MHz; "Entrenambu"/"Enter" para el boton de modo
numerico; "chif" = Shift; "McHawk"/"Mod" (tecla que fija la moduladora); "record" = Recall;
"Single" y "Recall" como teclas que eligen senal portadora/moduladora; "iloscopio" = osciloscopio;
Los nombres exactos de las teclas deben tomarse del software, no de
esta transcripcion.

## 7. Impacto en el repo

- `docs/05` (caso 4): ahora tiene evidencia de practicas reales (esta pagina).
- Skill `patrones-castillo-3d` y `docs/09`: los oraculos numericos de la seccion 4 alimentan
  `lab.model.numeric_deviation`.
- Pendiente cuando lleguen los JARs: inspeccion de clases/paquetes (sin ejecutar) y contraste contra
  los patrones del articulo (Object Mobility, Event Controller, Graphic Element Handler).
