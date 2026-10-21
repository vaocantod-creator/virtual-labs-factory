# Dashboard Pixel-Art del CEO

## Objetivo

Darle a Victor (CEO) una vista inmediata y agradable del estado de la fabrica: que agente esta
activo, en que laboratorio, hace cuanto, y que acaba de entregar. Estilo visual: pixel-art tipo
juego de gestion (simil "Stardew Valley"/"Software Inc"), una oficina 2D donde cada agente es un
personaje con animacion simple.

## Decision tecnica (segun lo conversado)

Se opta por la version **mas ambiciosa**: un mapa tipo oficina con agentes moviendose, construido
con un motor de juego 2D web-friendly.

### Stack recomendado

- **Motor:** Phaser 3 (JavaScript/TypeScript) — corre en navegador, facil de hostear como sitio
  estatico (GitHub Pages, igual que el tracker de Moodle), buen soporte de sprites y tilemaps
  pixel-art, comunidad grande, no requiere instalar nada para el CEO (solo abrir un link).
  - Alternativa evaluada: Godot (exportado a HTML5) — mas potente pero mas pesado de iterar para
    un dashboard que se actualiza frecuentemente. Phaser gana por velocidad de iteracion con
    agentes de codigo (Claude Code/Codex) generando/ajustando el tilemap y sprites.
- **Assets pixel-art:** sprites de personajes isometricos/top-down estilo 16x16 o 32x32, generados
  o adaptados (ej. paquetes de assets libres tipo Kenney.nl, o encargo a un agente de generacion
  de pixel-art).
- **Fuente de datos:** el dashboard hace poll (cada 5-10s) a `factory-state.json`, publicado como
  un archivo estatico actualizado por el Agente Director (vive en el repo `virtual-labs-factory`,
  servido via GitHub Pages o un endpoint simple).
- **Hosting:** GitHub Pages del propio repo `virtual-labs-factory`, consistente con el patron ya
  usado en `unincca-tracker`.

## Diseno de la escena

```
┌──────────────────────────────────────────────────────────┐
│  OFICINA DE LA FABRICA  (pixel-art, vista top-down)        │
│                                                              │
│  [Mesa Arquitecto]   [Mesa 3D]   [Mesa Ingenieria]          │
│       🧑‍💻                🎨            🧑‍🔧                   │
│                                                              │
│  [Pizarra Director]              [Mesa QA]   [Mesa Reporte] │
│         🧑‍💼                          🧪           📣          │
│                                                              │
│  Barra lateral: lista de laboratorios activos + fase        │
│  Panel inferior: ultimo log/evento por agente                │
└──────────────────────────────────────────────────────────┘
```

- Cada agente tiene una "estacion" fija (escritorio) y una animacion idle.
- Cuando un agente recibe tarea nueva, camina (pathfinding simple en grid) hacia una "estacion de
  trabajo activo" o hacia la mesa de otro agente si estan colaborando (ej. Ingenieria entrega a QA).
- Un icono de "pensando" (💭) o "escribiendo" (⌨️) aparece sobre el agente mientras una tarea esta
  en curso segun `factory-state.json`.
- Clic sobre un agente abre un panel lateral con su ultima actividad en texto (leido del log real).

## Fases de construccion del dashboard

1. **V0 — Estatico con datos reales:** tilemap fijo, sprites estaticos por rol, panel de texto con
   el contenido de `factory-state.json`. Sin animacion de movimiento todavia. Sirve para validar el
   flujo de datos real agente -> JSON -> UI.
2. **V1 — Animacion basica:** idle animations + cambio de sprite segun estado (trabajando/esperando).
3. **V2 — Movimiento:** agentes caminan entre estaciones segun a quien le entregan trabajo.
4. **V3 — Historial navegable:** linea de tiempo para que el CEO pueda "rebobinar" la semana y ver
   que paso dia a dia, no solo el estado actual.

## Por que esto importa para la heuristica

Un lab virtual fiel a un instrumento real necesita, segun la heuristica, representacion **sistemica**
y **3D** del fenomeno. El propio dashboard es un micro-caso de ese principio aplicado a la gestion:
convierte un proceso invisible (agentes de IA trabajando) en un sistema visual comprensible — el
mismo principio que luego se aplica a, por ejemplo, convertir un patron de radiacion invisible en una
escena 3D entendible por un estudiante.
