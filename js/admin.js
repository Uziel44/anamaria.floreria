(() => {
  'use strict';

  // ---- Configuración ----
  const TOKEN_KEY = 'admin_token';
  const MAX_SIDE = 1200;          // lado largo máximo de la foto, en píxeles
  const JPEG_QUALITY = 0.85;
  const SAFE_IMG = /^(\/uploads\/|img\/)/;   // mismas rutas que acepta la página pública

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const el = (tag, className, text) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  // El token vive en sessionStorage (se borra al cerrar la pestaña); si el navegador lo bloquea, queda en memoria
  let token = '';
  try { token = sessionStorage.getItem(TOKEN_KEY) || ''; } catch (_) { /* sin almacenamiento */ }
  const saveToken = (value) => {
    token = value;
    try { value ? sessionStorage.setItem(TOKEN_KEY, value) : sessionStorage.removeItem(TOKEN_KEY); } catch (_) { /* sin almacenamiento */ }
  };

  const loginBox = $('#login');
  const loginForm = $('#login-form');
  const loginMsg = $('#login-msg');
  const logoutBtn = $('#logout');
  const panel = $('#panel');
  const list = $('#list');
  const empty = $('#empty');
  const loading = $('#loading');
  const aviso = $('#aviso');
  const editor = $('#editor');
  const editorForm = $('#editor-form');
  const editorMsg = $('#editor-msg');
  const confirmDlg = $('#confirm');
  const confirmMsg = $('#confirm-msg');

  let products = [];
  let editing = null;        // producto que se edita (null = tarjeta nueva)
  let photoUrl = '';         // foto ya guardada en el servidor
  let pendingBlob = null;    // foto nueva ya redimensionada, aún sin subir
  let previewUrl = '';       // URL temporal de la vista previa
  let deleting = null;       // producto que se va a eliminar
  let busy = false;

  // ---- Utilidades ----
  const formatPrice = (n) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
  const nameOf = (p) => (p.es && p.es.nombre) || '(sin nombre)';
  const hasPrice = (p) => typeof p.precio === 'number' && isFinite(p.precio);
  const safeImg = (src) => typeof src === 'string' && SAFE_IMG.test(src);

  const say = (text) => { aviso.textContent = text; };

  class ApiError extends Error {
    constructor(status, message) { super(message); this.status = status; }
  }
  const errorText = (status) => ({
    400: 'Revisa los datos e inténtalo de nuevo.',
    404: 'Esa tarjeta ya no existe. Actualizamos la lista.',
    413: 'La foto es demasiado grande. Prueba con otra.',
    415: 'Ese tipo de archivo no sirve. Usa una foto JPG o PNG.',
    429: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  }[status] || `Algo salió mal (código ${status}). Inténtalo de nuevo en un momento.`);

  // Llamada a la API. Si el servidor dice 401 (fuera del login) la sesión venció: vuelve al login.
  const api = async (path, { method = 'GET', json, body, type } = {}) => {
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    let payload = body;
    if (json !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(json); }
    else if (type) headers['Content-Type'] = type;

    let res;
    try { res = await fetch(path, { method, headers, body: payload }); }
    catch (_) { throw new ApiError(0, 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.'); }

    if (res.status === 401 && path !== '/api/login') {
      showLogin('Tu sesión venció. Entra de nuevo.');
      throw new ApiError(401, '');
    }
    let data = null;
    try { data = await res.json(); } catch (_) { /* respuesta sin cuerpo */ }
    if (!res.ok) {
      // Los errores de validación (400) ya vienen en español y dicen qué campo falla: se muestran tal cual
      const detail = res.status === 400 && data && typeof data.error === 'string' ? data.error : '';
      throw new ApiError(res.status, detail || errorText(res.status));
    }
    return data;
  };
  const expired = (err) => err instanceof ApiError && err.status === 401;
  const messageOf = (err) => (err instanceof ApiError ? err.message : 'Algo salió mal. Inténtalo de nuevo.');

  // ---- Entrar / salir ----
  const closeDialogs = () => {
    [editor, confirmDlg].forEach((d) => { if (d.open) d.close(); });
  };

  function showLogin(message = '') {
    saveToken('');
    products = [];
    closeDialogs();
    panel.hidden = true;
    logoutBtn.hidden = true;
    loginBox.hidden = false;
    loginMsg.textContent = message;
    $('#login-pass').value = '';
    $('#login-send').disabled = false;
    $('#login-send').textContent = 'Entrar';
    (message ? $('#login-pass') : $('#login-user')).focus();
  }

  const showPanel = () => {
    loginBox.hidden = true;
    panel.hidden = false;
    logoutBtn.hidden = false;
    say('');
    return loadList();
  };

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = $('#login-user').value.trim();
    const password = $('#login-pass').value;
    if (!usuario || !password) {
      loginMsg.textContent = 'Escribe tu usuario y tu contraseña.';
      return;
    }
    const send = $('#login-send');
    send.disabled = true;
    send.textContent = 'Entrando…';
    loginMsg.textContent = '';
    try {
      const data = await api('/api/login', { method: 'POST', json: { usuario, password } });
      if (!data || typeof data.token !== 'string' || !data.token) throw new ApiError(0, 'El servidor no respondió como esperábamos. Inténtalo de nuevo.');
      saveToken(data.token);
      $('#login-pass').value = '';
      await showPanel();
      $('#t-panel').focus();
    } catch (err) {
      loginMsg.textContent = err.status === 401 ? 'Usuario o contraseña incorrectos.' : messageOf(err);
      $('#login-pass').focus();
    } finally {
      send.disabled = false;
      send.textContent = 'Entrar';
    }
  });
  // El 401 del propio login no pasa por "sesión venció": api() lo deja salir como error normal
  logoutBtn.addEventListener('click', () => showLogin());

  // ---- Lista ----
  async function loadList() {
    loading.hidden = false;
    try {
      const data = await api('/api/admin/productos');
      products = Array.isArray(data) ? data : [];
      loading.hidden = true;
      renderList();
    } catch (err) {
      if (!expired(err)) say(messageOf(err));
    } finally {
      loading.hidden = true;
    }
  }

  const actionBtn = (label, name, act, id, cls = 'btn btn--ghost btn--sm') => {
    const b = el('button', cls, label);
    b.type = 'button';
    b.dataset.act = act;
    b.dataset.id = id;
    b.setAttribute('aria-label', `${label.replace(/^[↑↓]\s*/, '')} «${name}»`);
    return b;
  };

  function renderList(focus) {
    list.replaceChildren(...products.map((p, i) => {
      const name = nameOf(p);
      const item = el('li', 'admin-item');
      item.classList.toggle('is-hidden', p.visible === false);

      const thumb = el('div', 'admin-item__thumb');
      if (safeImg(p.imagen)) {
        const img = document.createElement('img');
        img.src = p.imagen;
        img.alt = '';
        img.width = 76; img.height = 95;
        img.loading = 'lazy';
        thumb.append(img);
      }

      const info = el('div', 'admin-item__info');
      info.append(el('p', 'admin-item__name', name));
      const meta = el('p', 'admin-item__meta');
      meta.append(el('span', `badge ${p.visible === false ? 'badge--off' : 'badge--on'}`, p.visible === false ? 'Oculta' : 'Visible'));
      meta.append(hasPrice(p) ? el('span', 'admin-item__price', formatPrice(p.precio)) : el('span', '', 'Sin precio'));
      info.append(meta);

      const actions = el('div', 'admin-item__actions');
      actions.append(
        actionBtn('Editar', name, 'edit', p.id, 'btn btn--dark btn--sm'),
        actionBtn('↑ Subir', name, 'up', p.id),
        actionBtn('↓ Bajar', name, 'down', p.id),
        actionBtn(p.visible === false ? 'Mostrar' : 'Ocultar', name, 'toggle', p.id),
        actionBtn('Eliminar', name, 'delete', p.id, 'btn btn--danger btn--sm'),
      );
      $('[data-act="up"]', actions).disabled = i === 0;
      $('[data-act="down"]', actions).disabled = i === products.length - 1;

      item.append(thumb, info, actions);
      return item;
    }));
    empty.hidden = products.length > 0 || !loading.hidden;

    // Tras una acción la lista se redibuja: devuelve el foco al mismo botón (o al vecino si quedó desactivado)
    if (focus) {
      const sel = (act) => `[data-act="${act}"][data-id="${CSS.escape(String(focus.id))}"]`;
      const target = [$(sel(focus.act), list), $(sel(focus.act === 'up' ? 'down' : 'up'), list), $('#new')]
        .find((b) => b && !b.disabled);
      if (target) target.focus();
    }
  }

  const byId = (id) => products.find((p) => String(p.id) === String(id));

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn || busy) return;
    const p = byId(btn.dataset.id);
    if (!p) return;
    const act = btn.dataset.act;
    if (act === 'edit') openEditor(p);
    else if (act === 'delete') openConfirm(p);
    else if (act === 'toggle') toggleVisible(p);
    else move(p, act === 'up' ? -1 : 1);
  });

  async function move(p, dir) {
    const from = products.indexOf(p);
    const to = from + dir;
    if (to < 0 || to >= products.length) return;
    const before = products.slice();
    products.splice(to, 0, products.splice(from, 1)[0]);
    renderList({ id: p.id, act: dir < 0 ? 'up' : 'down' });
    busy = true;
    try {
      await api('/api/admin/orden', { method: 'PUT', json: { ids: products.map((x) => x.id) } });
      say(`«${nameOf(p)}» se movió. Ya se ve así en la página.`);
    } catch (err) {
      products = before;
      renderList();
      if (!expired(err)) say(`No se pudo cambiar el orden. ${messageOf(err)}`);
    } finally { busy = false; }
  }

  async function toggleVisible(p) {
    const show = p.visible === false;
    busy = true;
    try {
      const saved = await api(`/api/admin/productos/${encodeURIComponent(p.id)}`, { method: 'PUT', json: { ...p, visible: show } });
      products[products.indexOf(p)] = saved && typeof saved === 'object' && saved.id !== undefined ? saved : { ...p, visible: show };
      renderList({ id: p.id, act: 'toggle' });
      say(show ? `«${nameOf(p)}» ahora se ve en la página.` : `«${nameOf(p)}» quedó oculta: ya no se ve en la página.`);
    } catch (err) {
      if (!expired(err)) say(messageOf(err));
    } finally { busy = false; }
  }

  // ---- Eliminar ----
  function openConfirm(p) {
    deleting = p;
    confirmMsg.textContent = '';
    $('#confirm-text').textContent = `Vas a eliminar la tarjeta «${nameOf(p)}». Desaparece de la página y no se puede deshacer. Si solo quieres que no se vea por ahora, mejor usa «Ocultar».`;
    document.body.classList.add('modal-open');
    confirmDlg.showModal();
    $('#confirm-no').focus();
  }
  $('#confirm-no').addEventListener('click', () => confirmDlg.close());
  confirmDlg.addEventListener('close', () => document.body.classList.remove('modal-open'));
  $('#confirm-yes').addEventListener('click', async () => {
    const p = deleting;
    const yes = $('#confirm-yes');
    yes.disabled = true;
    yes.textContent = 'Eliminando…';
    busy = true;
    try {
      await api(`/api/admin/productos/${encodeURIComponent(p.id)}`, { method: 'DELETE' });
      products = products.filter((x) => x !== p);
      confirmDlg.close();
      renderList();
      say(`La tarjeta «${nameOf(p)}» se eliminó.`);
      $('#new').focus();
    } catch (err) {
      if (!expired(err)) confirmMsg.textContent = messageOf(err);
    } finally {
      busy = false;
      yes.disabled = false;
      yes.textContent = 'Sí, eliminar';
    }
  });

  // ---- Editor (crear / editar) ----
  const f = {
    nombre: $('#f-nombre'), desc: $('#f-desc'), largo: $('#f-largo'),
    precio: $('#f-precio'), alt: $('#f-alt'), visible: $('#f-visible'),
  };
  const photoImg = $('#photo-img');
  const photoEmpty = $('#photo-empty');
  const photoFile = $('#photo-file');
  const photoStatus = $('#photo-status');
  const saveBtn = $('#editor-save');
  const cancelBtn = $('#editor-cancel');

  const showPhoto = (src) => {
    if (src) photoImg.src = src; else photoImg.removeAttribute('src');
    photoImg.hidden = !src;
    photoEmpty.hidden = !!src;
  };
  const dropPreview = () => { if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = ''; } };

  function openEditor(p) {
    editing = p || null;
    pendingBlob = null;
    dropPreview();
    photoUrl = p && safeImg(p.imagen) ? p.imagen : '';
    const es = (p && p.es) || {};
    $('#editor-title').textContent = p ? 'Editar tarjeta' : 'Nueva tarjeta';
    f.nombre.value = es.nombre || '';
    f.desc.value = es.desc || '';
    f.largo.value = es.largo || '';
    f.precio.value = p && hasPrice(p) ? String(p.precio) : '';
    // Si el texto de la foto era solo el nombre (lo rellenamos nosotros), se deja vacío para que siga al nombre
    f.alt.value = es.alt && es.alt !== es.nombre ? es.alt : '';
    f.visible.checked = p ? p.visible !== false : true;
    photoFile.value = '';
    photoStatus.textContent = '';
    editorMsg.textContent = '';
    showPhoto(photoUrl);
    document.body.classList.add('modal-open');
    editor.showModal();
    editor.scrollTop = 0;
    f.nombre.focus();
  }

  $('#new').addEventListener('click', () => { if (!busy) openEditor(null); });
  cancelBtn.addEventListener('click', () => editor.close());
  editor.addEventListener('cancel', (e) => { if (busy) e.preventDefault(); });   // Escape no cierra a mitad de guardar
  editor.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    pendingBlob = null;
    dropPreview();
  });

  // Foto: se redimensiona aquí (máx. 1200 px, JPEG) para que suba rápido, incluso con datos del celular
  const loadImage = async (file) => {
    if (window.createImageBitmap) {
      try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (_) { /* prueba con <img> */ }
    }
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imagen')); };
      img.src = url;
    });
  };
  const resizeImage = async (file) => {
    const src = await loadImage(file);
    const w = src.width || src.naturalWidth;
    const h = src.height || src.naturalHeight;
    if (!w || !h) throw new Error('imagen');
    const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';                       // un PNG con fondo transparente no debe quedar negro
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
    if (src.close) src.close();
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('blob'))), 'image/jpeg', JPEG_QUALITY);
    });
  };

  photoFile.addEventListener('change', async () => {
    const file = photoFile.files[0];
    if (!file) return;
    editorMsg.textContent = '';
    photoStatus.textContent = 'Preparando la foto…';
    saveBtn.disabled = true;
    try {
      const blob = await resizeImage(file);
      dropPreview();
      previewUrl = URL.createObjectURL(blob);
      pendingBlob = blob;
      showPhoto(previewUrl);
      photoStatus.textContent = 'Foto lista. Se sube al tocar «Guardar».';
    } catch (_) {
      photoStatus.textContent = '';
      editorMsg.textContent = 'No pudimos leer esa foto. Prueba con otra (JPG o PNG).';
    } finally {
      saveBtn.disabled = false;
      photoFile.value = '';                       // permite volver a elegir el mismo archivo
    }
  });

  // "45", "45.50" o "45,50" → número; vacío → null; otra cosa → error
  const parsePrice = (raw) => {
    const s = raw.trim().replace(/^\$\s*/, '').replace(',', '.');
    if (s === '') return { value: null };
    if (!/^\d{1,6}(\.\d{1,2})?$/.test(s)) return { error: true };
    return { value: Number(s) };
  };

  const setBusy = (on) => {
    busy = on;
    saveBtn.disabled = on;
    cancelBtn.disabled = on;
    saveBtn.textContent = on ? 'Guardando…' : 'Guardar';
  };

  editorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    editorMsg.textContent = '';

    const nombre = f.nombre.value.trim();
    const price = parsePrice(f.precio.value);
    if (!nombre) { editorMsg.textContent = 'Escribe el nombre de la tarjeta.'; f.nombre.focus(); return; }
    if (price.error) { editorMsg.textContent = 'El precio debe ser un número, por ejemplo 45 o 45.50.'; f.precio.focus(); return; }
    if (!pendingBlob && !photoUrl) { editorMsg.textContent = 'Elige una foto para la tarjeta.'; photoFile.focus(); return; }

    setBusy(true);
    try {
      if (pendingBlob) {
        photoStatus.textContent = 'Subiendo la foto…';
        const up = await api('/api/admin/imagen', { method: 'POST', body: pendingBlob, type: 'image/jpeg' });
        if (!up || !safeImg(up.url)) throw new ApiError(0, 'La foto no se pudo guardar. Inténtalo de nuevo.');
        photoUrl = up.url;                        // si el guardado falla, al reintentar no se vuelve a subir
        pendingBlob = null;
        photoStatus.textContent = '';
      }

      // En español lo que escribió la usuaria; en/ru: vacíos al crear (la página muestra el español) o intactos al editar
      const blank = { nombre: '', desc: '', largo: '', alt: '' };
      const base = editing || { en: { ...blank }, ru: { ...blank } };
      const payload = {
        ...base,
        visible: f.visible.checked,
        precio: price.value,
        imagen: photoUrl,
        es: {
          ...(base.es || {}),
          nombre,
          desc: f.desc.value.trim(),
          largo: f.largo.value.trim(),
          alt: f.alt.value.trim() || nombre,
        },
      };
      if (editing) await api(`/api/admin/productos/${encodeURIComponent(editing.id)}`, { method: 'PUT', json: payload });
      else await api('/api/admin/productos', { method: 'POST', json: payload });

      const wasNew = !editing;
      setBusy(false);
      editor.close();
      await loadList();
      say(wasNew ? `Listo: la tarjeta «${nombre}» ya está creada.` : `Listo: los cambios de «${nombre}» se guardaron.`);
    } catch (err) {
      setBusy(false);
      if (!expired(err)) editorMsg.textContent = messageOf(err);
    }
  });

  // ---- Inicio: si ya hay sesión en esta pestaña se entra directo; si venció, api() vuelve al login ----
  if (token) showPanel(); else showLogin();
})();
