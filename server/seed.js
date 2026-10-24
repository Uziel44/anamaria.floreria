'use strict';
/* Genera data/productos.json con las 8 tarjetas iniciales.
 *
 * Fuente de los textos:
 *   - es / ru: diccionario DICT de ../js/i18n.js (claves pN.name/desc/long/alt)
 *   - en:      el HTML de ../index.html (el ingles vive ahi: data-i18n="pN.name", etc.)
 * Si el sitio ya no contiene esas tarjetas escritas a mano (porque ahora salen de la API),
 * se usa seed-data.json, que es una copia de esos mismos textos.
 *
 * Uso:  npm run seed            (no pisa datos existentes)
 *       node seed.js --force    (los reemplaza; borra los cambios hechos desde el panel)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const ARCHIVO = path.join(DATA_DIR, 'productos.json');
const RESPALDO = path.join(__dirname, 'seed-data.json');
const N = 8;

function decodificar(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// Lee el objeto DICT de i18n.js evaluando solo ese literal en un sandbox vacio.
function leerDict(src) {
  const ini = src.indexOf('const DICT = ');
  const fin = src.indexOf('\n  };', ini);
  if (ini < 0 || fin < 0) throw new Error('No se encontro DICT en js/i18n.js');
  return vm.runInNewContext('(' + src.slice(ini + 'const DICT = '.length, fin + 4) + ')', Object.create(null), { timeout: 1000 });
}

function leerIngles(html, i) {
  const campo = (tag, clave) => {
    const m = html.match(new RegExp('<' + tag + '[^>]*data-i18n="p' + i + '\\.' + clave + '"[^>]*>([\\s\\S]*?)</' + tag + '>'));
    return m ? decodificar(m[1].trim()) : '';
  };
  const alt = html.match(new RegExp('alt="([^"]*)"[^>]*data-i18n-attr="alt:p' + i + '\\.alt"'));
  return { nombre: campo('h3', 'name'), desc: campo('p', 'desc'), largo: campo('p', 'long'), alt: alt ? decodificar(alt[1]) : '' };
}

function desdeSitio(src = fs.readFileSync(path.join(RAIZ, 'js', 'i18n.js'), 'utf8'), html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8')) {
  const dict = leerDict(src);
  const out = [];
  for (let i = 1; i <= N; i++) {
    const t = (d) => ({ nombre: d[`p${i}.name`] || '', desc: d[`p${i}.desc`] || '', largo: d[`p${i}.long`] || '', alt: d[`p${i}.alt`] || '' });
    out.push({ id: 'p' + i, orden: i, visible: true, precio: null, imagen: `img/flores/arreglo-${i}.jpg`,
      es: t(dict.es), en: leerIngles(html, i), ru: t(dict.ru) });
  }
  return out;
}

function completo(lista) {
  return lista.length === N && lista.every((p) => ['es', 'en', 'ru'].every((l) =>
    ['nombre', 'desc', 'largo', 'alt'].every((c) => typeof p[l][c] === 'string' && p[l][c].length > 0)));
}

function crearSeed() {
  try {
    const lista = desdeSitio();
    if (completo(lista)) return lista;
  } catch (_) { /* cae al respaldo */ }
  const lista = JSON.parse(fs.readFileSync(RESPALDO, 'utf8'));
  if (!completo(lista)) throw new Error('seed-data.json incompleto');
  return lista;
}

// Escritura atomica: se escribe a .tmp y se renombra (nunca queda un JSON a medias).
function escribirAtomico(archivo, datos) {
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  const tmp = archivo + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(datos, null, 2));
  fs.renameSync(tmp, archivo);
}

function sembrar({ force = false } = {}) {
  if (fs.existsSync(ARCHIVO) && !force) return false;
  escribirAtomico(ARCHIVO, crearSeed());
  return true;
}

module.exports = { desdeSitio, ARCHIVO, DATA_DIR, crearSeed, escribirAtomico, sembrar };

if (require.main === module) {
  const force = process.argv.includes('--force');
  if (sembrar({ force })) console.log(`Creado ${ARCHIVO} con ${N} productos.`);
  else console.log(`${ARCHIVO} ya existe; no se toca. Usa "node seed.js --force" para reemplazarlo.`);
}
