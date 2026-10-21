# Casos de Prueba (Laboratorios Candidatos)

Ficha de cada laboratorio candidato a ser construido/modernizado por la fabrica, con su estado y
proposito como evidencia de la heuristica.

## 1. Rbot — Robot Virtual Controlado a Distancia (Java3D)

- **Repo:** https://github.com/vdiquez/Rbot
- **Origen:** Tesis de grado, Victor Ocanto y Ronald Verenzuela, 2007, IUTLV (hoy UPTA).
  Tutores: Ing. Andres Castillo, Ing. Felipe Pacheco.
- **Stack actual:** Java 8 (requerido para `run*`; el entorno puede tener JDK mas nuevo), Java3D 1.5.1,
  Swing, Gradle, UDP (puertos 5555 ExperimentalEnvironment y 8080 CommandCenter, comandos de una
  letra; verificado contra el repo, oct 2026).
- **Estado:** Codigo funcional legado, con plan de modernizacion ya iniciado (ver
  `PLAN_EJECUTIVO.md`, `PLAN_TECNICO.md`, `BACKLOG_EJECUCION.md`, `CLAUDE.md` en ese repo). Ya tiene
  convenciones de commit y Definition of Done definidas. Documentos adicionales en el repo:
  `PLAN_MEJORA.md`, `EJECUCION_LOCAL.md`, `SONARQUBE_LOCAL.md`, `RESUMEN_EJECUTIVO_SESION.md`.
  Estado de calidad reportado en su backlog: `./gradlew check` con 50 tests, SonarQube Quality Gate OK.
- **Rol en la fabrica:** Laboratorio piloto (Fase 1 del roadmap). Es el caso ideal para arrancar
  porque ya existe documentacion tecnica, historia y trabajo previo que reduce el riesgo de empezar
  de cero.
- **Relacion con la heuristica:** Caso de **modernizacion de un lab virtual existente**, no de
  construccion desde cero. Util para probar la heuristica en el escenario de "rescatar experiencia y
  productos ya logrados" que el profesor menciono explicitamente.

## 2. Patrones de Radiacion (Telecomunicaciones)

- **Repo:** pendiente — Victor lo compartira.
- **Dominio esperado:** visualizacion 3D de patrones de radiacion de antenas (diagramas de
  radiacion, lobulos, ganancia direccional).
- **Rol en la fabrica:** Segundo laboratorio (Fase 3). Dominio distinto a Rbot (electromagnetismo
  aplicado vs. robotica/control), util para probar que el proceso generaliza.
- **Preguntas a resolver cuando se comparta el repo:**
  - ¿Que tan parametrizable es el modelo (permite cambiar tipo de antena, frecuencia, etc. en vivo)?
  - ¿Que equivalente real (equipo de medicion de laboratorio de telecomunicaciones) busca reemplazar
    o complementar?

## 3. Satelites

- **Repo:** pendiente — Victor lo compartira.
- **Dominio esperado:** simulacion de orbitas/sistemas satelitales.
- **Rol en la fabrica:** Tercer laboratorio (Fase 4). Dominio con mayor complejidad fisica (mecanica
  orbital), buen caso de estres para el QA Pedagogico y el Agente de Contenido 3D.
- **Preguntas a resolver cuando se comparta el repo:**
  - ¿Es simulacion educativa conceptual o requiere precision orbital real (SGP4, TLE, etc.)?
  - ¿Que nivel de interaccion tiene el estudiante (observador pasivo vs. control de parametros)?

## 4. Laboratorio de Instrumentacion Electronica (PROPUESTO — requiere aprobacion del CEO)

- **Repo:** pendiente (prototipo del profesor Castillo; confirmar si lo comparte).
- **Origen:** Melo Q., Castillo R. et al., ICAETT 2022 (ver `docs/10-insumo-articulo-castillo.md`).
- **Stack actual:** Java 15, Java3D 1.5.1, Blender, UML.
- **Estado:** prototipo (generador de funciones x2 + osciloscopio; analizador de espectro con FFT previsto).
- **Rol en la fabrica:** candidato a laboratorio de referencia del metodo del profesor (Component
  Library, fidelidad al equipo real). NO entra al backlog hasta decision explicita del CEO.
- **Relacion con la heuristica:** prueba mejor los ejes Sistemico y 3D; valida el Metodo Castillo
  y la metrica de reutilizacion de componentes.

## Antecedentes del profesor relevantes a los casos 2 y 3
- Ecuaciones de Maxwell 3D (Tiberio, 2017) -> caso 2 (radiacion).
- Sateliton II (Castillo, 2014): visualizacion 3D de satelites venezolanos -> caso 3 (satelites).
- Objetos Java de equipos de telecomunicaciones que interoperan (Castillo, 2011) -> Component Library.

## Plantilla para nuevos casos

```md
## N. <Nombre del laboratorio>

- **Repo:** <url>
- **Origen:** <contexto historico/academico>
- **Stack actual:** <tecnologias>
- **Estado:** <legado funcional / prototipo / idea>
- **Rol en la fabrica:** <fase del roadmap, por que este orden>
- **Relacion con la heuristica:** <que eje(s) de la heuristica prueba mejor este caso>
```
