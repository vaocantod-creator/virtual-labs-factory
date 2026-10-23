#!/usr/bin/env bash
# Arranca el servidor de laboratorio de Rbot Web (ADR-0004) y muestra los enlaces para estudiantes.
#   scripts/laboratorio.sh [--puerto 8080] [--clave X] [--solo-local]
# Requiere Node.js >= 20 y los modelos en public/models (scripts/copiar-modelos.sh).
# ESTADO: escrito pero NO ejecutado todavia (ver docs/14). Los componentes que invoca si estan probados.
set -euo pipefail
cd "$(dirname "$0")/.."
PUERTO=8080; CLAVE="${RBOT_CLAVE:-}"; HOST="0.0.0.0"
while [ $# -gt 0 ]; do case "$1" in
  --puerto) PUERTO="$2"; shift 2;; --clave) CLAVE="$2"; shift 2;; --solo-local) HOST="127.0.0.1"; shift;;
  -h|--help) sed -n 2,5p "$0"; exit 0;; *) echo "Opcion desconocida: $1" >&2; exit 2;; esac; done
command -v node >/dev/null || { echo "Falta Node.js (>= 20)." >&2; exit 1; }
[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] || { echo "Se requiere Node.js >= 20 (hay $(node -v))." >&2; exit 1; }
[ -d public/models ] && [ "$(ls public/models | wc -l)" -ge 9 ] || { echo "Faltan los modelos .3ds en public/models. Ejecuta scripts/copiar-modelos.sh" >&2; exit 1; }
[ -d node_modules ] || npm ci --no-audit --no-fund
if [ ! -f dist/index.html ] || [ -n "$(find src index.html public -newer dist/index.html -type f 2>/dev/null | head -1)" ]; then npm run build; fi
if [ -z "$CLAVE" ]; then
  CLAVE="$(node -p 'require("crypto").randomBytes(6).toString("base64url")')"
  echo "Clave generada para esta sesion: $CLAVE"
fi
IP="$(hostname -I 2>/dev/null | awk '{print $1}')"; IP="${IP:-127.0.0.1}"; [ "$HOST" = "127.0.0.1" ] && IP="127.0.0.1"
echo
echo "Enlaces por pareja (cambiar mesa1 por mesa2, mesa3...):"
echo "  Centro de Mando:       http://$IP:$PUERTO/?rol=centro&sala=mesa1&clave=$CLAVE"
echo "  Entorno Experimental:  http://$IP:$PUERTO/?rol=receptor&sala=mesa1&clave=$CLAVE"
echo
RBOT_CLAVE="$CLAVE" exec node bridge/servidor.mjs --host "$HOST" --port "$PUERTO"
