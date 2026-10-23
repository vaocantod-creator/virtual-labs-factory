# Rbot Web - servidor de laboratorio (ADR-0004). Construir:  docker build -t rbot-web .
# Los modelos .3ds NO estan en el repo: copiarlos antes (scripts/copiar-modelos.sh) o montar un volumen en /app/dist/models.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json index.html piezas.html ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force
COPY bridge ./bridge
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/salud || exit 1
# RBOT_CLAVE se pasa como variable de entorno (no en la linea de comandos: no queda en `ps`)
CMD ["node", "bridge/servidor.mjs", "--host", "0.0.0.0", "--port", "8080"]
