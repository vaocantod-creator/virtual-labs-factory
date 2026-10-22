# 13. Analisis de los JARs del Laboratorio Virtual (Version 5) — profesor Castillo

> Fuente: `Programa_Laboratorio_Virtual_V5.zip` (4 partes, 70,8 MB, 477 entradas, integridad verificada).
> Metodo: lectura estatica de los archivos `.class` (parser propio de la tabla de constantes y firmas;
> no hay `javap` en el servidor) y, en una segunda pasada, **decompilacion con CFR 0.152** de 28 clases
> clave (modelo y control del generador y del osciloscopio, clases base y configuraciones; ~7152 lineas).
> **No se ejecuto ningun codigo del laboratorio.** No hay fuentes `.java` originales: solo binarios y
> modelos 3D (`.3DS`). La decompilacion se limita a esas clases (no a todo el JAR); el resto de lo descrito
> sale de nombres, herencia y firmas. El codigo decompilado queda **solo en local** (no se publica).

## 1. Contenido

- `Programa_Laboratorio_Virtual02.jar` (81,5 MB; 132 clases; 397 modelos `.3ds`). Main-Class:
  `AccionarLabVirtual`. Compilado con JDK 1.8. Java3D (`javax.media.j3d`): 45 clases extienden `BranchGroup`/j3d.
- `lib/` (6 JARs): `AECR_OsciloscopioHP`, `AECR_AnalizadorEspectroHP`, `AECR_MedidorSWR`,
  `AECR_AtenuadorSWR`, `MuebleLaboratorio`, `SistemasMobiliario`.
- El manifest del JAR principal referencia ademas `VisualizadorEquiposTelecom.jar`, `NGeneradorFunciones.jar`,
  `NOsciloscopio.jar`, `ComponentesLabTel.jar` y `SistemasMarcadorPosiciones.jar`, que **no estan en `lib/`**
  (su codigo si esta embebido en el JAR principal; `ComponentesLabTel.jar` tambien es dependencia declarada
  de los JARs de `lib/`). Hay entradas duplicadas en el Class-Path.
- `src/`: modelos `.3DS` e imagenes por equipo (`Partes Fijas/Moviles/Activas`), no codigo.
- Dentro del JAR principal hay un `.rar` (`NuevoGeneradorSeñales Miguel.rar`) y clases `Prueba`: residuos de desarrollo.

## 2. Mapa de equipos y sistemas

| Equipo / sistema | Ubicacion | Estado |
|---|---|---|
| Generador de funciones (`NGeneradorFunciones`) | JAR principal | Los videos lo cubren a fondo |
| Osciloscopio (`NOsciloscopio`) | JAR principal | Los videos lo cubren a fondo |
| **Osciloscopio HP** (`OsciloscopioHP`) | `lib/AECR_OsciloscopioHP` | **No aparece en los videos** |
| **Analizador de espectro HP** (`AnalizadoEspectroHP`) | `lib/AECR_AnalizadorEspectroHP` | **No aparece en los videos**; clase `GraficaVectorcopio` |
| **Medidor SWR** (`SWRMeter`) con `ModeloMatematicoLr` | `lib/AECR_MedidorSWR` | **No aparece en los videos** |
| **Atenuador SWR** (`AtenuadorSWR`) | `lib/AECR_AtenuadorSWR` | **No aparece en los videos** |
| Mobiliario / mesa (`MuebleLab`, `SistemaMobiliario`, `Marcador`) | `lib/` + JAR principal | Soporte del banco |
| Visualizacion e iluminacion (`UniversoVirtual`, `SistemaVisualizacionEquiposLaboratoriosVirtual`, `ControlIluminacion`, `Luminarias`) | JAR principal | Camara, luz, fondo, ejes |
| Componentes (`ComponentesLaboratorioVirtual.*`) | JAR principal | Biblioteca compartida |

**Consecuencia:** el laboratorio real es mas amplio que el del articulo (ahi: osciloscopio + 2 generadores).
Incluye **instrumentacion de RF** (SWR, atenuador, analizador de espectro). Esto corrige el supuesto de
`docs/12` de que el analizador de espectro solo estaba "previsto": **ya existe** como equipo 3D con su
MVC (aunque con menos clases que otros: su modelo no tiene metodos propios en el JAR).

## 3. Confirmacion del Metodo Castillo en el codigo

1. **Graphic Element Handler / Builder: CONFIRMADO.** `ObjetoGrafico`, `ObjetoGrafico2` y `EquipoTelecom`
   (`ComponentesLaboratorioVirtual.ObjetosGraficos`) son **clases abstractas** que extienden `BranchGroup`
   y declaran exactamente 5 metodos abstractos `protected void`: `ajustesIniciales`, `crearElementos`,
   `ajustarCapacidades`, `articularElementos`, `ajustesFinales`. Coincide con el articulo (crear objetos,
   ajustar capacidades, articular elementos, ajustes iniciales y finales). Alcance: 30 clases del JAR
   principal implementan los 5 metodos completos y 70 mas implementan al menos 3; en `lib/` lo hacen
   las clases de equipo y de vista (p. ej. 27 en el Medidor SWR).
   Variante: la jerarquia tiene tres versiones (`ObjetoGrafico`, `ObjetoGrafico2`, `EquipoTelecom`) y los
   sufijos de los metodos `*ManejadorOG` / `*EquipoTelecom` sugieren evolucion por copia, no refactor.
2. **Object Mobility: CONFIRMADO como capacidad en la clase base.** `ObjetoGrafico` incluye `desplazar`,
   `desplazamientoX/Y/Z`, `desplazamientoRelativo`, `setTamaño`, `rotarX/Y/Z` y `rotarEn{X,Y,Z}Gr`, y
   `EquipoTelecom` (Modelo) `trasladar*`/`girarEje*`/`ajustarTamaño`. El articulo habla de un patron
   separado; en el codigo la movilidad esta en la clase base (herencia), no en una clase llamada "Object
   Mobility". [A CONFIRMAR con el profesor si son el mismo concepto.]
3. **Event Controller: CONFIRMADO como patron de varias clases, nombre no literal.** No hay clase llamada
   `EventController`. Los controles de cada equipo implementan `ActionListener` (`GeneradorFuncionesControl`,
   `OsciloscopioControl`, `AnalizadorEspectroHPControl`, `SWRMeterControl`, `AtenuadorSWRControl`, ...) y
   delegan en un procesador (`ProcesadorComandos` en el osciloscopio, `Procesador` en el generador); para
   los botones 3D se usa `PickMouseBehavior` (`MecanismoBotonGiratorio`, `MecanismoBotonDeslizanteTogle`,
   `MecanismoBotonDeslizanteConRetorno`).
4. **MVC y subsistemas: CONFIRMADO.** Cada equipo tiene `Modelo/`, `Vista/` y `Control/`, y la vista se
   descompone en `PartesFijas`, `PartesMoviles`, `PartesActivas`. Los equipos extienden `EquipoTelecom2`
   (osciloscopio, generador, osciloscopio HP, analizador HP, medidor SWR, atenuador SWR, mueble).
5. **Component Library: CONFIRMADA.** `ComponentesLaboratorioVirtual.{Componentes,Modelo,ObjetosGraficos,
   Utilidades,Vista}`: `BotonGiratorio`, `BotonDeslizanteTogle`, `BotonDeslizanteConRetorno`, `Display`,
   `Display2`, `Led`, `Texto3D`, `Cargador3DS`, `MecanismoBoton*`, `EquipoTelecom`, `ControlExterno`,
   paneles de control (traslacion, rotacion, tamaño).
6. **Cinco configuraciones:** `LaboratorioVirtual02.implementarConfiguracion1..5`, `crearCableConfiguracion04/05`,
   `JMenuConfiguracion`. Coincide con los videos (configuraciones 1, 4, 5) y con el articulo (5).

## 4. Modelo matematico y oraculos de prueba

- `GeneradorSeñales` (NGeneradorFunciones.Modelo): portadora y moduladora independientes
  (`setAmplitudP/M`, `setFrecP/M`, `setFaseP`, `setNivelDCP/M`, `setFormaOndaPortadora/Moduladora`),
  `setTipoModulacion`, `setSeñalSalida`, `generarSeñalCompuesta`, `getValorSeñalModuladaAM/FM/FSK`,
  `indiceModulacionAM/FM`, `factorModulacionFSK`. Constantes `SENO`, `CUADRADA`, `TRIANGULAR`, `RAMPA`,
  `PORTADORA`, `MODULADORA`, `COMPUESTA_*`, `FSK`. `GeneradorBasico`: `valorOndaCuadrada/Triangular/Rampa`.
- `Procesador` (control del generador) maneja escalas `Hz/KHz/MHz` y `uV/mV/V` (`getDimensionEscala*`),
  modos `Num`, `Shift`, `Enter`, `configuracionDeInicio`, y los parametros a modificar (frecuencia,
  amplitud, nivel DC, fase, de portadora y moduladora). Coincide con las practicas de los videos.
- `ProcesadorComandos` (osciloscopio) define la tabla de escalas vertical: 1, 2, 5, 10, 20 V/div y los
  equivalentes en mV y uV (secuencia 1-2-5), con `configuracionInicialEquipo`. `ControlCursores` maneja
  CH1/CH2/CV1/CV2, incremento up/down, grosor, y formato con dimension.
- `GraficadorSeñal` (Runnable) captura y grafica la señal en un hilo, con `setVoltxDiv`, `setSegtxDiv`,
  `setValorUmbral`.
- `ModeloMatematicoLr` en el Medidor SWR.

Esto permite derivar tests de salida numerica **de caja negra** sin ejecutar la GUI: construir
`GeneradorSeñales`, fijar parametros y comparar `getValorPortadora/Moduladora/SeñalModulada*` contra la
formula teorica (AM, FM, FSK). Los valores iniciales fueron **verificados por decompilacion** (seccion 9).

## 5. Deuda tecnica y riesgos (para la modernizacion)

- **Sin fuentes**: solo `.class`. La decompilacion con CFR funciona (28 clases sin fallos; un solo aviso de estilo de CFR, "Lifted jumps to return sites", en `ProcesadorComandos`), asi
  que la modernizacion es viable sin el fuente, aunque los nombres de variables locales se pierden y el
  fuente original sigue siendo preferible.
- **Java3D 1.5.1 / JDK 8** (`1.8.0_112`/`1.8.0_191`) y dependencias nativas de Java3D.
- **Duplicacion**: `ObjetoGrafico` / `ObjetoGrafico2` / `EquipoTelecom` (x2: Vista y Modelo),
  `Cargador3DS` repetido (principal, OsciloscopioHP, `Cargador3DS_1` en mobiliario), `Marcador` /
  `JPanelControlTraslacion` repetidos entre JAR principal y `SistemasMobiliario`, tres versiones
  de `PartesActivas/Fijas/Moviles`.
- **Rutas y nombres con `ñ`** (`GeneradorSeñales`, `Tamaño`): codificacion fragil entre plataformas.
- Residuos: `.rar` dentro del JAR, clases `Prueba`, `PickMouseBehaviorPrueba`, `Prueba3`.
- Dependencias del Class-Path ausentes (`ComponentesLabTel.jar` etc.).
- **Licencia, autoria y permisos** no declarados en los artefactos.
- 397 modelos `.3ds` dentro de un JAR de 81 MB: tamano alto para distribucion web.

## 6. Impacto en el repo

- Skill `patrones-castillo-3d` -> subir de borrador: el Graphic Element Handler y la Component Library
  quedan **confirmados por el codigo**; Object Mobility y Event Controller, confirmados como capacidades
  pero con nombres distintos.
- `docs/05` caso 4: el laboratorio incluye RF (SWR, atenuador, analizador HP); ampliar la ficha.
- `docs/12`: corregir "analizador de espectro previsto" -> existe.
- `docs/11`: nuevas preguntas para el profesor (seccion 7).
- `docs/09`: los oraculos de `GeneradorSeñales` alimentan `lab.model.numeric_deviation`.

## 7. Preguntas para el profesor derivadas del analisis

1. ¿Los 3 niveles `ObjetoGrafico` / `ObjetoGrafico2` / `EquipoTelecom` son versiones sucesivas del mismo
   patron? ¿Cual es la vigente?
2. ¿"Object Mobility" es la movilidad heredada de la clase base, o una clase/interfaz aparte?
3. ¿"Event Controller" corresponde a los `*Control` + `Procesador*` + `PickMouseBehavior`?
4. ¿Entrega el codigo fuente (`.java`)? Sin el, la modernizacion depende de decompilar binarios.
5. ¿Licencia/permisos para analizar, derivar, y publicar fragmentos o rubricas?
6. ¿Faltan `ComponentesLabTel.jar`, `NGeneradorFunciones.jar`, `NOsciloscopio.jar`,
   `VisualizadorEquiposTelecom.jar`, `SistemasMarcadorPosiciones.jar` o estan integrados en el JAR principal?
7. ¿Hay videos y practicas del osciloscopio HP, analizador de espectro, medidor y atenuador SWR?
8. ¿`Programa_Laboratorio_Virtual02` es la version final del prototipo del articulo (Java 15) o una
   rama anterior (JDK 8)?
9. ¿Cual es la fuente de verdad del modelo del Medidor SWR (`ModeloMatematicoLr`)?

## 8. Alcance y limites de este analisis

- No ejecute el JAR, ni lo instale, ni abri su GUI.
- Decompile solo 28 clases (modelo/control del generador y del osciloscopio, clases base): la logica
  de los otros equipos (HP, analizador, SWR, atenuador, mobiliario) no fue leida, solo sus firmas.
- Lo que digo en la seccion 9 sale de **leer** codigo decompilado, no de ejecutarlo; los casos borde
  (NaN, division por cero) son deducciones por lectura y deben confirmarse con una prueba aislada.
- Los binarios (zip y JARs) **no se suben a GitHub**; quedan en `/opt/data/projects/vlf-media/jar/`
  fuera del repo, por tamano y por pendientes de licencia.

## 9. Verificacion por decompilacion (generador y osciloscopio)

### 9.1 Valores iniciales: coinciden con los videos
- **Generador** (`Procesador.configuracionDeInicio`, llamado al construir y en `ajustarEncendido`):
  portadora 10 V, 100 MHz (1e8 Hz), 0 V DC, fase 0, seno; moduladora 5 V, 10 MHz (1e7 Hz), 0 V DC, fase 0,
  seno; senal de salida = portadora; sin modulacion (tipo 8); parametro a modificar = frecuencia de la
  portadora; incremento (delta) = 1; modos Num/Shift apagados.
  `GeneradorSeñales.configuracionCero` pone todo en 0: es el estado interno previo; la configuracion
  visible la fija el `Procesador`.
- **Reinicio al apagar/encender: confirmado.** Encender invoca `configuracionDeInicio`; apagar genera
  senal 0. Es el invariante que muestran los videos (apagar el generador lleva el canal a cero).
- **Osciloscopio** (`ProcesadorComandos.configuracionInicialEquipo`): indice vertical 19 en ambos canales
  = **2 V/div**; indice horizontal 10 = **2 ns/div**. Coincide con el video de FM.
- Rangos de escala: vertical 1 uV/div a 20 V/div (23 pasos, secuencia 1-2-5); horizontal 1 ps/div a
  1 s/div (37 pasos). Muestreo del graficador: **1024 muestras en 10 divisiones** (dt = s/div x 10/1024).

### 9.2 Modelo matematico (para tests de caja negra)
- Seno: A sin(2 pi f t [+ fase de la portadora en grados]). La fase solo se aplica a la portadora; la
  moduladora no usa fase. Constante 2 pi guardada como `float` (6.28318548...), error relativo ~2.8e-8.
- Cuadrada: +A en la primera mitad del periodo, -A en la segunda. Triangular: arranca en +A, baja a -A
  en T/2 y sube (forma coseno). **Rampa: unipolar 0 -> A** (no de -A a +A).
- **AM:** m = Am/Ap (se calcula automaticamente, no es parametro independiente) y
  s(t) = (1 + m*mod(t)/Am) * portadora(t) = (1 + mod(t)/Ap) * portadora(t). Con Ap=12 V y Am=6 V, m=0,5,
  que coincide con el ejemplo del video del indice de modulacion.
- **FM:** s(t) = Ap sin(2 pi (fc + escala*k*mod(t)) t), con k = 2,5 (`indiceModulacionFM`) y
  `escala` = orden de magnitud de fc (1e6 para 100 MHz). Con los valores iniciales la desviacion de pico
  es 1e6 x 2,5 x 5 V = 12,5 MHz. **Con moduladora cuadrada, FM devuelve la portadora sin modular.**
- **FSK:** solo actua con moduladora cuadrada: f = fc +/- 10 x Am x escala (con los valores iniciales,
  +/-50 MHz, es decir 150 y 50 MHz). Con seno/triangular/rampa devuelve la portadora sin modular.
  La desviacion crece con Am, y con Am=0 desaparece la modulacion (coincide con el video de FSK).
- `generarMuestraSeñalSalida` suma el nivel DC solo a la portadora sin modular; en AM/FM/FSK y para la
  moduladora **no se suma DC** en los metodos leidos.

### 9.3 Observaciones de fidelidad (para conversar con el profesor)
1. **La "FM" no es FM canonica**: sustituye la frecuencia instantanea dentro de sin(2 pi f(t) t) en vez de
   integrar el mensaje en la fase; es una aproximacion de barrido. Pedagogicamente puede ser deliberado;
   un experto lo notaria en una validacion estricta (relevante para el criterio de fidelidad).
2. FM y FSK son mutuamente excluyentes por la forma de onda moduladora (cuadrada -> FSK, el resto -> FM).
3. La desviacion depende del orden de magnitud de fc (`escala`), no de la frecuencia moduladora.
4. `getEscala` devuelve 0 fuera de [1e-6, 1e9) Hz, por lo que FM/FSK degradan a portadora sin modular
   con fc = 0 o >= 1 GHz, sin aviso.
5. **Casos borde probables (deduccion por lectura, sin ejecutar):** en AM con Am=0 la expresion
   mod/Am es 0/0 (NaN); con Ap=0, Am/Ap divide por cero. Confirmar con una prueba aislada.
6. El limite del display (incremento/decremento) acota la mantisa a 0..1000 por escala; el rango de
   fase (+/-360, visto en el video) no fue verificado en el codigo.
7. Sin anti-aliasing: a escalas de tiempo grandes con portadoras de 100 MHz la rejilla de 1024 muestras
   submuestrea; un osciloscopio real tambien tiene limites, pero el efecto aqui es de software.
8. Quedan `System.out.println` de depuracion en el flujo de botones.

### 9.4 Oraculos de prueba derivados (alimentan `lab.model.numeric_deviation`)
| Prueba | Entrada | Salida esperada |
|---|---|---|
| Inicial | encender | Ap=10 V, fc=100 MHz, DC=0, Am=5 V, fm=10 MHz, seno, salida=portadora |
| Escalas osciloscopio | encender | 2 V/div, 2 ns/div, ambos canales |
| Periodo | portadora inicial | T = 10 ns (CV2-CV1) |
| Pico a pico | portadora inicial | Vpp = 20 V, invariante a la escala |
| AM | Ap=12, Am=6 | m = 0,5; envolvente max 18 V, min 6 V |
| FM (seno) | valores iniciales | desviacion pico 12,5 MHz |
| FSK (cuadrada) | valores iniciales | frecuencias 50 y 150 MHz |
| FSK, Am=0 | Am=0 | portadora sin modular |
| FM con cuadrada | moduladora cuadrada | portadora sin modular |
| Apagado | apagar generador | canal del osciloscopio a 0 |
