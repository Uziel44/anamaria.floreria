'use strict';
/* ============================================================
   Servidor de Ana Maria Floreria
   ------------------------------------------------------------
   Sirve el sitio estatico (lista blanca) y la API del panel.

   PUBLICO
     GET  /api/productos             -> tarjetas visibles, ordenadas
     GET  /uploads/<archivo>         -> fotos subidas desde el panel
   LOGIN
     POST /api/login                 -> { token }  (un unico usuario: anamaria)
   PRIVADO (Authorization: Bearer <token>)
     GET    /api/admin/productos     -> todas (incluye ocultas)
     POST   /api/admin/productos     -> crea
     PUT    /api/admin/productos/:id -> edita
     DELETE /api/admin/productos/:id -> borra
     PUT    /api/admin/orden         -> { ids: [...] }
     POST   /api/admin/imagen        -> cuerpo binario jpeg/png/webp -> { url }

   Datos: data/productos.json (escritura atomica + cola) e imagenes en data/uploads/.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Carga server/.env si existe (Node >= 20.12). Lo que ya este en el entorno tiene prioridad.
const ENV_FILE = path.join(__dirname, '.env');
if (fs.existsSync(ENV_FILE) && typeof process.loadEnvFile === 'function') process.loadEnvFile(ENV_FILE);

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ARCHIVO, DATA_DIR, escribirAtomico, sembrar } = require('./seed');

const PORT = process.env.PORT || 3002;
const USUARIO = 'anamaria';
const JWT_EXPIRA = '12h';
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const RAIZ_WEB = path.join(__dirname, '..');

/* ------------------------------------------------------------
   Configuracion de credenciales (si falta, no arranca)
   ------------------------------------------------------------ */
let PASSWORD_HASH = (process.env.ADMIN_PASSWORD_HASH || '').trim();
if (PASSWORD_HASH) {
  if (!/^\$2[abxy]\$\d{2}\$.{53}$/.test(PASSWORD_HASH)) {
    console.error('ERROR: ADMIN_PASSWORD_HASH no parece un hash bcrypt valido (debe empezar con $2a$/$2b$ y tener 60 caracteres).');
    console.error('Si lo pones en un .env o en un shell, protege los "$" (comillas simples).');
    process.exit(1);
  }
} else if (process.env.ADMIN_PASSWORD) {
  PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  console.warn('AVISO: usando ADMIN_PASSWORD en texto plano (se hashea al arrancar). Para produccion usa ADMIN_PASSWORD_HASH (ver README).');
} else {
  console.error('ERROR: falta la contrasena del panel. Define ADMIN_PASSWORD_HASH (bcrypt, recomendado) o ADMIN_PASSWORD en el entorno o en server/.env. Ver README.md.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('AVISO: falta JWT_SECRET. Se genero uno aleatorio: las sesiones del panel caducan en cada reinicio.');
}
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(48).toString('hex');

/* ------------------------------------------------------------
   Almacen de productos (archivo JSON)
   ------------------------------------------------------------ */
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (sembrar()) console.log('data/productos.json no existia: creado con los 8 productos iniciales.');

const leer = () => JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'));
const ordenados = (lista) => [...lista].sort((a, b) => a.orden - b.orden);

// Cola: las operaciones de lectura-modificacion-escritura se ejecutan de una en una.
let cola = Promise.resolve();
function conCola(fn) {
  const p = cola.then(fn);
  cola = p.catch(() => {});
  return p;
}
const modificar = (fn) => conCola(() => {
  const lista = leer();
  const resultado = fn(lista);
  escribirAtomico(ARCHIVO, lista);
  return resultado;
});

// Borra una foto de /uploads/ si ya ningun producto la usa.
function limpiarImagen(imagen, lista) {
  const m = /^\/uploads\/([a-f0-9]{32}\.(?:jpg|png|webp))$/.exec(imagen || '');
  if (!m || lista.some((p) => p.imagen === imagen)) return;
  fs.rm(path.join(UPLOADS_DIR, m[1]), { force: true }, () => {});
}

/* ------------------------------------------------------------
   Validacion
   ------------------------------------------------------------ */
class ErrorHttp extends Error {
  constructor(status, mensaje) { super(mensaje); this.status = status; }
}
const bad = (mensaje) => new ErrorHttp(400, mensaje);
const esObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

const LIMITES = { nombre: 80, desc: 200, largo: 2000, alt: 200 };
const ETIQUETAS = { nombre: 'El nombre', desc: 'La descripción corta', largo: 'La descripción larga', alt: 'El texto alternativo' };
const IDIOMAS = { es: 'español', en: 'inglés', ru: 'ruso' };

function validarTextos(valor, lang) {
  if (valor === undefined) valor = {};
  if (!esObjeto(valor)) throw bad(`"${lang}" debe ser un objeto con nombre, desc, largo y alt.`);
  const out = {};
  for (const campo of Object.keys(LIMITES)) {
    const v = valor[campo] === undefined || valor[campo] === null ? '' : valor[campo];
    if (typeof v !== 'string') throw bad(`${ETIQUETAS[campo]} (${IDIOMAS[lang]}) debe ser texto.`);
    const t = v.trim();
    if (t.length > LIMITES[campo]) throw bad(`${ETIQUETAS[campo]} (${IDIOMAS[lang]}) no puede superar ${LIMITES[campo]} caracteres.`);
    out[campo] = t;
  }
  return out;
}

const RE_UPLOAD = /^\/uploads\/[a-f0-9]{32}\.(?:jpg|png|webp)$/;
// Fotos que ya trae el sitio (img/flores/...). No se comprueba que el archivo exista: en producción img/ no está
// dentro del contenedor (lo sirve Caddy desde el clon del repo). Solo imágenes raster: nada de .svg.
const RE_IMG_SITIO = /^img\/[\w .\-\/]+\.(?:jpe?g|png|webp)$/i;

function validarImagen(imagen) {
  if (typeof imagen !== 'string' || !imagen.trim()) throw bad('La imagen es obligatoria.');
  const img = imagen.trim();
  if (RE_UPLOAD.test(img)) {
    if (!fs.existsSync(path.join(UPLOADS_DIR, img.slice('/uploads/'.length)))) throw bad('La imagen indicada no existe en el servidor. Sube la foto de nuevo.');
    return img;
  }
  if (RE_IMG_SITIO.test(img) && !img.includes('..') && !img.includes('//')) return img;
  throw bad('La ruta de la imagen no es válida.');
}

// Devuelve los campos editables ya validados y limpios.
function validarProducto(body) {
  if (!esObjeto(body)) throw bad('El cuerpo de la petición debe ser un objeto JSON.');
  let precio = body.precio === undefined ? null : body.precio;
  if (precio !== null) {
    if (typeof precio !== 'number' || !Number.isFinite(precio)) throw bad('El precio debe ser un número o null.');
    if (precio < 0 || precio > 1000000) throw bad('El precio debe estar entre 0 y 1,000,000.');
    if (Math.abs(precio * 100 - Math.round(precio * 100)) > 1e-6) throw bad('El precio admite como máximo 2 decimales.');
    precio = Math.round(precio * 100) / 100;
  }
  const visible = body.visible === undefined ? true : body.visible;
  if (typeof visible !== 'boolean') throw bad('"visible" debe ser verdadero o falso.');
  const es = validarTextos(body.es, 'es');
  if (!es.nombre) throw bad('El nombre en español es obligatorio.');
  return {
    precio, visible,
    imagen: validarImagen(body.imagen),
    es, en: validarTextos(body.en, 'en'), ru: validarTextos(body.ru, 'ru'),
  };
}

/* ------------------------------------------------------------
   App y middlewares
   ------------------------------------------------------------ */
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Caddy delante

// CSP desactivada a proposito: el sitio usa un <script> en linea y fuentes de Google, y admin.html
// (otro equipo) puede cargar mas cosas; una CSP mal ajustada rompe el panel. El resto de cabeceras de helmet sigue activo.
app.use(helmet({ contentSecurityPolicy: false }));

const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10, // por IP
  message: { error: 'Demasiados intentos. Prueba de nuevo en unos minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Estaticos por lista blanca: nunca server/, data/, .git, *.md, etc.
const EXT_PUBLICAS = new Set(['.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.avif', '.woff', '.woff2', '.mp4', '.webm']);
const PAGINAS = ['index.html', 'admin.html'];
const sendPagina = (pagina) => (req, res, next) =>
  res.sendFile(path.join(RAIZ_WEB, pagina), { dotfiles: 'ignore' }, (e) => e && next());

app.get('/', sendPagina('index.html'));
for (const p of PAGINAS) app.get('/' + p, sendPagina(p));
for (const carpeta of ['css', 'js', 'img']) {
  app.use('/' + carpeta, (req, res, next) => {
    // Se decodifica para que %2e%2e o %2F no se cuelen; si la ruta es rara, 404.
    let ruta;
    try { ruta = decodeURIComponent(req.path); } catch (_) { return next(new ErrorHttp(404, 'No encontrado')); }
    if (!EXT_PUBLICAS.has(path.extname(ruta).toLowerCase())) return next(new ErrorHttp(404, 'No encontrado'));
    next();
  }, express.static(path.join(RAIZ_WEB, carpeta), { dotfiles: 'ignore', index: false, fallthrough: true, maxAge: carpeta === 'img' ? '1d' : 0 }));
}

// Fotos subidas: nombres aleatorios e inmutables -> cache largo.
app.use('/uploads', express.static(UPLOADS_DIR, {
  dotfiles: 'ignore', index: false, maxAge: '365d', immutable: true,
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

/* ------------------------------------------------------------
   API
   ------------------------------------------------------------ */
const api = express.Router();
api.use((req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
api.use(express.json({ limit: '64kb' })); // no afecta a la subida binaria (otro Content-Type)

api.get('/productos', (req, res) => {
  res.json(ordenados(leer()).filter((p) => p.visible));
});

api.post('/login', limitadorLogin, ah(async (req, res) => {
  const { usuario, password } = esObjeto(req.body) ? req.body : {};
  const generico = () => res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  if (typeof usuario !== 'string' || typeof password !== 'string' || password.length > 200) return generico();
  // Siempre se compara con bcrypt, aunque el usuario no coincida (tiempo de respuesta constante).
  const passOk = await bcrypt.compare(password, PASSWORD_HASH);
  const userOk = usuario.trim().toLowerCase() === USUARIO;
  if (!(userOk && passOk)) return generico();
  const token = jwt.sign({ sub: USUARIO }, JWT_SECRET, { algorithm: 'HS256', expiresIn: JWT_EXPIRA });
  res.json({ token });
}));

function requiereLogin(req, res, next) {
  const m = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  if (!m) return res.status(401).json({ error: 'Necesitas iniciar sesión.' });
  try {
    const dato = jwt.verify(m[1], JWT_SECRET, { algorithms: ['HS256'] });
    if (dato.sub !== USUARIO) throw new Error('sub');
    next();
  } catch (_) {
    res.status(401).json({ error: 'La sesión no es válida o caducó. Inicia sesión de nuevo.' });
  }
}
api.use('/admin', requiereLogin);

api.get('/admin/productos', (req, res) => res.json(ordenados(leer())));

api.post('/admin/productos', ah(async (req, res) => {
  const datos = validarProducto(req.body);
  const nuevo = await modificar((lista) => {
    const p = {
      id: crypto.randomBytes(5).toString('hex'),
      orden: lista.reduce((m, x) => Math.max(m, x.orden), 0) + 1,
      ...datos,
    };
    lista.push(p);
    return p;
  });
  res.status(201).json(nuevo);
}));

api.put('/admin/orden', ah(async (req, res) => {
  const ids = esObjeto(req.body) ? req.body.ids : null;
  if (!Array.isArray(ids) || ids.some((i) => typeof i !== 'string')) throw bad('Se espera { ids: [...] } con textos.');
  const lista = await modificar((l) => {
    const existentes = l.map((p) => p.id);
    if (new Set(ids).size !== ids.length || ids.length !== existentes.length || !ids.every((i) => existentes.includes(i))) {
      throw bad('La lista debe contener exactamente los ids de todas las tarjetas, sin repetir.');
    }
    ids.forEach((id, i) => { l.find((p) => p.id === id).orden = i + 1; });
    return ordenados(l);
  });
  res.json(lista);
}));

api.put('/admin/productos/:id', ah(async (req, res) => {
  const datos = validarProducto(req.body);
  const p = await modificar((lista) => {
    const actual = lista.find((x) => x.id === req.params.id);
    if (!actual) throw new ErrorHttp(404, 'Producto no encontrado.');
    const anterior = actual.imagen;
    Object.assign(actual, datos);
    if (anterior !== actual.imagen) setImmediate(() => limpiarImagen(anterior, leer()));
    return actual;
  });
  res.json(p);
}));

api.delete('/admin/productos/:id', ah(async (req, res) => {
  await modificar((lista) => {
    const i = lista.findIndex((x) => x.id === req.params.id);
    if (i < 0) throw new ErrorHttp(404, 'Producto no encontrado.');
    const [quitado] = lista.splice(i, 1);
    setImmediate(() => limpiarImagen(quitado.imagen, leer()));
  });
  res.json({ ok: true });
}));

// Tipo real segun los primeros bytes (el header Content-Type no es de fiar).
function tipoDeImagen(b) {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') return 'webp';
  return null;
}
api.post('/admin/imagen',
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '8mb' }),
  ah(async (req, res) => {
    if (!Buffer.isBuffer(req.body) || !req.body.length) throw bad('Envía la imagen como cuerpo binario con Content-Type image/jpeg, image/png o image/webp.');
    const ext = tipoDeImagen(req.body);
    if (!ext) throw bad('El archivo no es una imagen JPG, PNG o WebP válida.');
    const nombre = crypto.randomBytes(16).toString('hex') + '.' + ext;
    await fs.promises.writeFile(path.join(UPLOADS_DIR, nombre), req.body, { flag: 'wx' });
    res.status(201).json({ url: '/uploads/' + nombre });
  }));

app.use('/api', api);

/* ------------------------------------------------------------
   404 y manejador global de errores
   ------------------------------------------------------------ */
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Ruta no encontrada.' });
  res.status(404).type('text/plain').send('No encontrado');
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (res.headersSent) return next(err);
  let status = err.status || err.statusCode || 500;
  let mensaje = err.message;
  if (err.type === 'entity.too.large') { status = 413; mensaje = 'El archivo o los datos enviados son demasiado grandes.'; }
  else if (err.type === 'entity.parse.failed') { status = 400; mensaje = 'JSON inválido.'; }
  else if (!(err instanceof ErrorHttp) || status >= 500) {
    if (status < 500) mensaje = 'Petición no válida.';
    else { console.error(err); mensaje = 'Error interno del servidor.'; }
  }
  if (req.path.startsWith('/api/')) return res.status(status).json({ error: mensaje });
  res.status(status).type('text/plain').send(status === 404 ? 'No encontrado' : mensaje);
});

app.listen(PORT, () => console.log(`Servidor listo en http://localhost:${PORT}`));
