# 13. Analisis de los JARs del Laboratorio Virtual (Version 5) — profesor Castillo

> Fuente: `Programa_Laboratorio_Virtual_V5.zip` (4 partes, 70,8 MB, 477 entradas, integridad verificada).
> Metodo: lectura estatica de los archivos `.class` (parser propio de la tabla de constantes y firmas;
> no hay `javap` en el servidor). **No se ejecuto ningun codigo del laboratorio.** No hay fuentes
> `.java`: solo binarios y modelos 3D (`.3DS`). Lo aqui descrito sale de nombres de clases, jerarquia
> de herencia y firmas de metodos; el comportamiento interno no fue leido.

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
formula teorica (AM, FM, FSK). Los valores iniciales (100 MHz, 10 V, etc.) estan en `configuracionCero` y
`configuracionDeInicio`, cuyo contenido **no he leido** (solo los nombres): hay que confirmarlos
leyendo el bytecode de esos metodos o ejecutando una prueba en entorno aislado.

## 5. Deuda tecnica y riesgos (para la modernizacion)

- **Sin fuentes**: solo `.class`; modernizar requiere decompilacion (CFR/Fernflower) o que el profesor
  entregue el codigo.
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
- No lei el bytecode de los metodos (solo firmas y nombres); lo que digo sobre comportamiento viene de
  los nombres y de los videos, no de la logica interna.
- Los binarios (zip y JARs) **no se suben a GitHub**; quedan en `/opt/data/projects/vlf-media/jar/`
  fuera del repo, por tamano y por pendientes de licencia.
