# Red Agentica de la Fabrica de Laboratorios Virtuales

## Principio de diseno

La fabrica se organiza como una **organizacion de software jerarquica con equipos funcionales**,
inspirada en como trabajaria un estudio real de desarrollo de simuladores educativos: direccion,
arquitectura, produccion de contenido 3D, ingenieria de software, QA pedagogico y comunicacion con
el CEO.

Cada agente es un **rol**, no necesariamente un unico proceso: puede materializarse como una sesion
de Claude Code, Codex CLI, o un sub-agente delegado via Hermes (`delegate_task`), segun la tarea.
Hermes actua como **orquestador central**: programa cuando corre cada agente (cron), reparte trabajo,
agrega resultados y habla con el CEO.

## Niveles

```
                        ┌─────────────────────┐
                        │   CEO (Victor)       │  <- humano, revisa semanalmente
                        └──────────┬───────────┘
                                   │
                        ┌──────────▼───────────┐
                        │  Agente Director      │  orquesta, prioriza, reporta
                        │  (Hermes, persistente)│
                        └──────────┬───────────┘
          ┌────────────┬───────────┼───────────┬─────────────┐
          ▼            ▼           ▼           ▼             ▼
   ┌───────────┐ ┌───────────┐ ┌─────────┐ ┌──────────┐ ┌───────────┐
   │ Arquitecto │ │ Agente 3D │ │Ingeniero │ │   QA /   │ │ Reportero │
   │ Heuristico │ │/Contenido │ │ de Lab   │ │Pedagogico│ │(Comunicac.)│
   └───────────┘ └───────────┘ └─────────┘ └──────────┘ └───────────┘
```

## Roles detallados

### 1. Agente Director (orquestador — Hermes persistente)

- Mantiene el **backlog de laboratorios** (que se esta construyendo, que sigue, que esta bloqueado).
- Cada ciclo (diario o segun cron) revisa el estado de cada laboratorio activo y decide que agente
  debe trabajar a continuacion.
- Es quien **invoca** a los demas agentes (via `delegate_task` o lanzando sesiones de Claude
  Code/Codex CLI en modo no interactivo contra el repo del laboratorio correspondiente).
- Nunca escribe codigo el mismo; coordina.
- Expone su estado interno (que agente esta activo, que tarea corre) al **dashboard pixel-art**
  mediante un archivo de estado compartido (`factory-state.json`) o una cola de eventos.

### 2. Arquitecto Heuristico

- Es el puente formal con la heuristica del profesor Andres Castillo.
- Antes de iniciar o continuar cualquier laboratorio, consulta `HEURISTICA.md` y determina:
  - Que principio didactico aplica (ej. aprendizaje por descubrimiento, simulacion de error real).
  - Que principio sistemico aplica (ej. separacion entrada/proceso/salida igual que el equipo real).
  - Que decisiones 3D son necesarias (nivel de fidelidad visual requerido).
  - Que rol tendran los agentes en la operacion final del laboratorio (no solo en construirlo).
- Produce un **documento de especificacion por laboratorio** (`docs/lab-<nombre>/especificacion.md`)
  que los demas agentes ejecutan.
- Es el unico agente que puede proponer cambios a `HEURISTICA.md` (sujeto a aprobacion del CEO),
  porque la fabrica tambien debe retroalimentar la tesis doctoral con hallazgos empiricos.

### 3. Agente de Contenido 3D

- Encargado de todo lo relacionado a modelos, escenas, assets visuales.
- Para casos legados como Rbot: audita modelos `.3ds` existentes, decide que conservar/refactorizar.
- Para laboratorios nuevos (radiacion, satelites): decide el motor 3D mas adecuado segun el caso
  (Three.js/WebGL para accesibilidad web, Godot si se requiere mas control de fisica, Unity si el
  profesor/universidad ya tiene flujo asociado).
- Trabaja con Codex CLI o Claude Code segun el lenguaje objetivo del laboratorio.

### 4. Ingeniero de Laboratorio (desarrollo/backend/integracion)

- Implementa la logica de simulacion: comunicacion, control, persistencia de datos de sesion,
  medicion simulada equivalente al instrumento real.
- Para Rbot: continua el trabajo ya iniciado en `BACKLOG_EJECUCION.md` (estabilizacion, build
  reproducible, desacoplamiento UI/red/escena).
- Sigue siempre un ciclo: implementar -> validar -> pruebas -> commit -> push (igual que la
  convencion ya definida en `CLAUDE.md` del repo Rbot).

### 5. QA Pedagogico

- No es QA de software tradicional unicamente: valida que el laboratorio **cumple el objetivo
  didactico**, no solo que "funciona".
- Checklist tipo:
  - ¿El estudiante puede fallar de forma realista (como con el instrumento real)?
  - ¿La interfaz comunica correctamente el fenomeno fisico/tecnico simulado?
  - ¿Es accesible para el contexto tecnico probable de un estudiante (ej. sin GPU dedicada)?
- Genera un **informe de validacion por laboratorio**, que alimenta tanto al CEO como de vuelta al
  Arquitecto Heuristico (para refinar la heuristica con evidencia real).

### 6. Agente Reportero (comunicacion con el CEO)

- Cada semana, genera `reports/semana-NN.md`: resumen ejecutivo de avances, bloqueos, decisiones
  pendientes de aprobacion del CEO.
- Es quien entrega el resumen por el canal que el CEO prefiera (Telegram, via Hermes).
- Tambien actualiza el **estado visible en el dashboard pixel-art** (que agente trabajo en que,
  cuanto tiempo, que entrego).

## Protocolo de comunicacion entre agentes

Todos los agentes comparten estado via archivos versionados en cada repo de laboratorio, mas un
archivo de **estado de fabrica** centralizado:

```json
// factory-state.json (vive en virtual-labs-factory, actualizado por el Director)
{
  "ciclo_actual": "2026-W43",
  "laboratorios": [
    {
      "id": "rbot",
      "repo": "https://github.com/vdiquez/Rbot",
      "fase": "Fase B - Estandarizacion tecnica",
      "agente_activo": "Ingeniero de Laboratorio",
      "ultima_actividad": "2026-10-20T14:00:00Z",
      "bloqueado_por": null
    }
  ],
  "agentes": [
    {"rol": "Director", "estado": "orquestando", "ultima_accion": "..."},
    {"rol": "Ingeniero de Laboratorio", "estado": "trabajando", "lab": "rbot", "tarea": "..."}
  ]
}
```

El dashboard pixel-art **lee este archivo** (polling o webhook) para animar a los agentes como
personajes moviendose entre "estaciones" (arquitectura, 3D, codigo, QA, reporte).

## Por que esta estructura sirve como prueba de la heuristica

- Separa explicitamente lo **didactico** (QA Pedagogico), lo **sistemico** (Arquitecto Heuristico +
  Director), lo **3D** (Agente de Contenido 3D) y los **agentes** (toda la red), que son exactamente
  los 4 ejes que el profesor busca integrar en su heuristica.
- Cada laboratorio construido queda documentado end-to-end: que decisiones se tomaron y por que,
  lo cual es el insumo que la tesis doctoral necesita como evidencia.
