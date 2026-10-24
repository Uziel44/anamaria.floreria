# Servidor del sitio (Ana María Florería)

Un solo proceso Node/Express que sirve el sitio estático y la API del panel (`admin.html`).
Sin base de datos: las tarjetas viven en `data/productos.json` y las fotos subidas en `data/uploads/`.

## Variables de entorno (o `server/.env`, ver `.env.example`)

| Variable | Descripción |
|---|---|
| `ADMIN_PASSWORD_HASH` | Hash bcrypt de la contraseña de Ana María (recomendado). |
| `ADMIN_PASSWORD` | Alternativa en texto plano; se hashea al arrancar. Solo se usa si no hay hash. |
| `JWT_SECRET` | Secreto para firmar sesiones (12 h). Si falta se genera uno y las sesiones caducan al reiniciar. |
| `PORT` | Puerto, por defecto `3002`. |

Si no hay ni `ADMIN_PASSWORD_HASH` ni `ADMIN_PASSWORD`, el servidor **no arranca**. El usuario es siempre `anamaria`.

Generar el hash y un secreto:

```bash
node -e "console.log(require('bcryptjs').hashSync('LA_CONTRASEÑA', 12))"
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

En un shell, el hash lleva `$`: ponlo entre comillas simples (`ADMIN_PASSWORD_HASH='$2b$12$...'`). En `server/.env` va tal cual, sin comillas.

## Correr

```bash
cd server
npm install
npm start          # http://localhost:3002  (Node >= 20.12)
```

Al primer arranque, si no existe `data/productos.json`, se crea solo con las 8 tarjetas originales (`seed.js`).
`npm run seed` hace lo mismo a mano y no pisa datos existentes; `node seed.js --force` los reemplaza.

## Producción (droplet de plexipedidos)

Corre como el contenedor `floreria` del `docker-compose.yml` de plexipedidos (`build: /home/deploy/floreria`, que usa el
`Dockerfile` de la raíz de este repo). La imagen lleva **solo `server/`**: Caddy sirve la landing estática (`index.html`,
`admin.html`, `css/`, `js/`, `img/`) directo desde el clon del repo y solo le manda a este contenedor `/api/*` y `/uploads/*`
(ver el bloque `anamariaflowers.com` del `Caddyfile` de plexipedidos). Por eso, si el contenedor se cae, la página sigue en pie
con las tarjetas del HTML y solo el panel deja de funcionar.

- **Secretos:** `/home/deploy/floreria.env` en el droplet (permisos 600, fuera de cualquier repo), con `ADMIN_PASSWORD_HASH='…'`
  (¡entre comillas simples! docker compose interpreta los `$`) y `JWT_SECRET`. Lo crea `setup_backend_floreria_nyc1.py`.
- **Datos:** volumen docker `floreria_data` montado en `/app/server/data` (tarjetas + fotos). Sobrevive a los deploys; **no**
  está en el backup diario de Postgres: hay que sumarlo (ver abajo).
- **Deploys:** `deploy_floreria_nyc1.py "mensaje"` (git pull + `docker compose up -d --build floreria` + verificación).
- **Respaldo manual de las tarjetas y fotos:**
  `docker run --rm -v plexipedidos_floreria_data:/d:ro -v "$PWD":/b alpine tar czf /b/floreria-data.tgz -C /d .`
- **Solo local / sin Caddy delante:** este mismo proceso sirve todo el sitio (HTML, css/js/img, `/api/*`, `/uploads/*`), así que
  `reverse_proxy localhost:3002` alcanza.

El servidor usa `trust proxy = 1` (un solo proxy delante). Si Caddy hace `basic_auth` u otras reglas, no deben tapar `/api/*` ni `/uploads/*`.
Detrás de Cloudflare con proxy activado, el límite de intentos de login vería la IP de Cloudflare y no la del visitante.

## Qué se sirve

Solo `index.html`, `admin.html`, `css/`, `js/`, `img/` (únicamente extensiones de imagen/fuente/css/js; nunca `.md`/`.html` dentro de esas carpetas) y `/uploads`.
`server/`, `data/`, `.git`, `*.md` devuelven 404.

## Notas

- **CSP desactivada** en helmet (el sitio usa un `<script>` en línea y fuentes de Google). El resto de cabeceras de helmet sigue activo. Se puede endurecer cuando el panel esté estable.
- Rate limit del login: 10 intentos / 15 min por IP (en memoria; se reinicia con el servidor).
- Respaldo: copiar `server/data/` (JSON + uploads). Está en `.gitignore`.
- Los textos iniciales de `seed.js` salen de `js/i18n.js` + `index.html`; si ya no están ahí usa `seed-data.json`.

## API (resumen)

`GET /api/productos` (público, solo visibles) · `POST /api/login` · con `Authorization: Bearer <token>`:
`GET|POST /api/admin/productos`, `PUT|DELETE /api/admin/productos/:id`, `PUT /api/admin/orden` (`{ids}`),
`POST /api/admin/imagen` (cuerpo binario `image/jpeg|png|webp`, máx. 8 MB, devuelve `{url}`).
Errores: `{ "error": "mensaje" }`.
