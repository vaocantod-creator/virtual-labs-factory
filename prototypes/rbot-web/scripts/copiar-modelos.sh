#!/usr/bin/env bash
# Copia las 19 piezas .3ds desde el repo de Victor (vdiquez/Rbot, carpeta piezas/).
# Los modelos no se versionan aqui: pertenecen al repo original.
set -euo pipefail
RBOT_DIR="${1:-/tmp/rbot}"
[ -d "$RBOT_DIR/piezas" ] || git clone --depth 1 https://github.com/vdiquez/Rbot "$RBOT_DIR"
mkdir -p public/models && cp "$RBOT_DIR"/piezas/* public/models/
echo "Modelos copiados: $(ls public/models | wc -l)"
