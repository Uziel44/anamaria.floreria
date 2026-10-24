# Backend del panel de Ana María Florería (login, tarjetas, fotos).
#
# Se construye desde el docker-compose de plexipedidos (servicio "floreria",
# build: /home/deploy/floreria). La imagen lleva SOLO server/: la landing
# estática (index.html, admin.html, css/, js/, img/) la sirve Caddy directo
# desde el clon del repo y solo le manda a este contenedor /api/* y /uploads/*.
FROM node:20-alpine

WORKDIR /app/server

# Primero solo el manifest, para que Docker cachee `npm ci` mientras no cambien las dependencias.
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/ ./

# data/ (productos.json + uploads/) se monta como volumen: sin él, cada deploy
# borraría las tarjetas y las fotos que Ana María cargó. Se crea con dueño
# "node" para que el volumen nuevo herede ese permiso y el proceso pueda escribir.
RUN mkdir -p data && chown node:node data
USER node

ENV NODE_ENV=production PORT=3002
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/productos').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
