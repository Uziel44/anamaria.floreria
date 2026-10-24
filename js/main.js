(() => {
  'use strict';

  // ---- Configuración: cambia estos datos y se actualiza toda la web ----
  const WHATSAPP = '13052164794';              // código de país + número, sin "+" ni espacios (+1 305 216 4794)
  const INSTAGRAM = 'angisoto09__';             // usuario de Instagram, sin "@"
  // ----------------------------------------------------------------------

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  const openInNewTab = (a) => { a.target = '_blank'; a.rel = 'noopener'; };

  const { t } = window.I18N;

  // Instagram
  $$('[data-instagram], [data-reel]').forEach((a) => {
    a.href = `https://www.instagram.com/${INSTAGRAM}/`;
  });
  $('#t-insta').textContent = `@${INSTAGRAM}`;

  // Enlaces que dependen del idioma: se calculan al cargar y cada vez que se cambia de idioma.
  // i18n.js ya dejó data-wa y los aria-label base en el idioma actual antes de avisarnos.
  const refreshLinks = () => {
    // WhatsApp: cualquier enlace con data-wa="mensaje" o data-wa-product="Nombre del arreglo"
    $$('[data-wa]').forEach((a) => {
      a.href = waLink(a.dataset.wa);
      openInNewTab(a);
    });
    $$('[data-wa-product]').forEach((a) => {
      const name = a.dataset.waProduct;
      a.href = waLink(t('wa.product', { name }));
      a.setAttribute('aria-label', t('aria.order', { name }));
      openInNewTab(a);
    });

    // Aviso a lectores de pantalla en los enlaces que abren pestaña nueva
    $$('a[target="_blank"]').forEach((a) => {
      if (a.getAttribute('aria-label')) {
        // Quita el aviso anterior (de otro idioma) si i18n.js no restauró la etiqueta base
        let label = a.getAttribute('aria-label');
        if (a.dataset.newtabNote && label.endsWith(a.dataset.newtabNote)) label = label.slice(0, -a.dataset.newtabNote.length);
        a.dataset.newtabNote = ` ${t('newtab')}`;
        a.setAttribute('aria-label', label + a.dataset.newtabNote);
      } else {
        let note = $('.sr-only[data-newtab]', a);
        if (!note) {
          note = document.createElement('span');
          note.className = 'sr-only';
          note.dataset.newtab = '';
          a.append(note);
        }
        note.textContent = ` ${t('newtab')}`;
      }
    });
  };
  refreshLinks();
  document.addEventListener('i18n:change', refreshLinks);

  // ---- Tarjetas desde la API ----
  // Si /api/productos responde con datos, reemplazan las tarjetas del HTML (que quedan como respaldo sin servidor).
  // Todo se construye con createElement/textContent: nada del producto pasa por innerHTML.
  // Las tarjetas generadas no usan data-i18n (i18n.js solo conoce lo que existía al cargar): su texto se
  // calcula aquí según el idioma activo, con el español como respaldo campo por campo.
  const grid = $('.grid');
  const SAFE_IMG = /^(\/uploads\/|img\/)/;   // solo fotos propias; cualquier otra ruta se descarta
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const cards = [];                           // { card, p } de las tarjetas generadas

  const el = (tag, className, text) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const hasPrice = (p) => typeof p.precio === 'number' && isFinite(p.precio) && p.precio >= 0;
  const formatPrice = (n) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
  const field = (p, key) => ((p[window.I18N.lang] || {})[key]) || ((p.es || {})[key]) || '';

  const buildCard = (p) => {
    const card = el('article', 'card');

    const media = el('div', 'card__media');
    const zoom = el('button', 'card__zoom');
    zoom.type = 'button';
    zoom.setAttribute('data-detail', '');
    if (typeof p.imagen === 'string' && SAFE_IMG.test(p.imagen)) {
      const img = document.createElement('img');
      img.src = p.imagen;
      img.width = 900; img.height = 1125;       // reserva el espacio (4:5) para que no salte el layout
      img.loading = 'lazy';
      zoom.append(img);
    }
    zoom.append(el('span', 'sr-only'));
    const icon = document.createElementNS(SVG_NS, 'svg');
    icon.setAttribute('class', 'icon card__zoom-icon');
    icon.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#i-zoom');
    icon.append(use);
    zoom.append(icon);
    media.append(zoom);

    const body = el('div', 'card__body');
    body.append(el('h3', 'card__name'), el('p', 'card__desc'));
    if (hasPrice(p)) body.append(el('p', 'card__price', formatPrice(p.precio)));
    const long = el('p', 'card__long');
    long.hidden = true;
    const order = el('a', 'btn btn--dark btn--sm');
    order.href = '#';
    body.append(long, order);

    card.append(media, body);
    return card;
  };

  // Rellena (o vuelve a rellenar al cambiar de idioma) los textos de una tarjeta generada
  const fillCard = (card, p) => {
    const name = field(p, 'nombre');
    $('.card__name', card).textContent = name;
    $('.card__desc', card).textContent = field(p, 'desc');
    $('.card__long', card).textContent = field(p, 'largo');
    $('.card__zoom .sr-only', card).textContent = t('detail.view');
    const img = $('.card__media img', card);
    if (img) img.alt = field(p, 'alt') || name;
    const order = $('.btn', card);
    order.textContent = t('order');
    // El precio viaja en el mensaje de WhatsApp: «Pink peonies ($45)»
    order.dataset.waProduct = hasPrice(p) ? `${name} (${formatPrice(p.precio)})` : name;
  };

  const fillCards = () => {
    cards.forEach(({ card, p }) => fillCard(card, p));
    emptyMsg.textContent = t('panel.empty');
    refreshLinks();
  };
  document.addEventListener('i18n:change', fillCards);

  // Aviso para cuando la API responde bien pero no hay ninguna tarjeta visible (Ana María las ocultó o borró todas)
  const emptyMsg = el('p', 'grid__empty');

  const renderProducts = (list) => {
    const items = list
      .filter((p) => p && typeof p === 'object' && p.visible !== false)
      .sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0));
    cards.length = 0;
    items.forEach((p) => cards.push({ card: buildCard(p), p }));
    grid.replaceChildren(...(items.length ? cards.map(({ card }) => card) : [emptyMsg]));
    fillCards();
  };

  if (grid) {
    // Las tarjetas del HTML se ocultan mientras llega la respuesta: así no se ve un instante una tarjeta vieja
    // (o ya borrada) antes de que entren las reales. Si la API no responde, se muestran igual.
    grid.classList.add('is-loading');
    const abort = new AbortController();
    const giveUp = setTimeout(() => abort.abort(), 5000);
    fetch('/api/productos', { headers: { Accept: 'application/json' }, signal: abort.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
      // Una lista vacía SÍ es una respuesta válida: significa «no hay tarjetas», no «el servidor falló»
      .then((list) => { if (Array.isArray(list)) renderProducts(list); })
      .catch(() => { /* sin servidor, con error o sin respuesta a tiempo: se conservan las tarjetas del HTML */ })
      .finally(() => { clearTimeout(giveUp); grid.classList.remove('is-loading'); });
  }

  // Año del copyright
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // ---- Header fijo: sombra y logo compacto al hacer scroll ----
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  // ---- Menú móvil ----
  const nav = $('#nav');
  const toggle = $('.nav-toggle');
  const closeBtn = $('.nav-close');
  const backdrop = $('#backdrop');
  const outside = [$('main'), $('.site-footer'), $('.wa-float')];

  const setNav = (open) => {
    const wasOpen = nav.classList.contains('is-open');
    if (open === wasOpen) return;
    nav.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    // Con el menú abierto el resto de la página no recibe foco ni clics
    outside.forEach((el) => el && (open ? el.setAttribute('inert', '') : el.removeAttribute('inert')));
    if (open) closeBtn.focus(); else toggle.focus();
  };
  toggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  closeBtn.addEventListener('click', () => setNav(false));
  backdrop.addEventListener('click', () => setNav(false));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  matchMedia('(min-width: 1101px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });

  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setNav(false);
    // Cierra el submenú abierto por teclado (WCAG 1.4.13: descartable)
    const sub = document.activeElement && document.activeElement.closest('.has-sub');
    if (sub) { const link = $('.nav__link', sub); link.focus(); sub.classList.add('is-dismissed'); }
  });
  $$('.has-sub').forEach((li) => {
    li.addEventListener('mouseleave', () => li.classList.remove('is-dismissed'));
    li.addEventListener('focusout', () => li.classList.remove('is-dismissed'));
  });

  // ---- Detalle: al tocar una tarjeta se abre una ventana con la foto grande y cuándo regalarlo ----
  // Sirve a tres tipos de disparador; el texto largo vive oculto en el HTML y i18n.js lo traduce como el resto:
  //   .card                      arreglo        → .card__long dentro de la tarjeta
  //   .occ[data-open-detail]     ocasión        → .occ__long dentro de la tarjeta
  //   button[data-open-detail]   botón extra    → párrafo oculto indicado en data-detail-text, foto en data-detail-img
  const detail = $('#detail');
  if (detail && typeof detail.showModal === 'function') {
    const dImg = $('.detail__img', detail);
    const dTitle = $('.detail__title', detail);
    const dText = $('.detail__text', detail);
    const dPrice = $('.detail__price', detail);
    const dOrder = $('.detail__order', detail);

    const openDetail = ({ src, alt, title, text, href, price = '' }) => {
      if (src) dImg.src = src; else dImg.removeAttribute('src');
      dImg.alt = alt;
      dTitle.textContent = title;
      dPrice.textContent = price;
      dPrice.hidden = !price;
      dText.textContent = text;
      dOrder.href = href;
      document.body.classList.add('modal-open');
      detail.showModal();
      detail.scrollTop = 0;
    };

    // Un solo oyente en la cuadrícula: sirve igual a las tarjetas del HTML y a las generadas desde la API
    if (grid) grid.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card || e.target.closest('a')) return; // el botón "Pedir" de la tarjeta sigue yendo a WhatsApp
      const img = $('.card__media img', card);
      const price = $('.card__price', card);
      openDetail({
        src: img ? (img.currentSrc || img.src) : '',
        alt: img ? img.alt : '',
        title: $('.card__name', card).textContent,
        text: $('.card__long', card).textContent,
        href: $('[data-wa-product]', card).href,
        price: price ? price.textContent : '',
      });
    });

    $$('[data-open-detail]').forEach((el) => {
      const open = (e) => {
        e.preventDefault();
        const img = $('img', el);
        const textEl = el.dataset.detailText ? document.getElementById(el.dataset.detailText) : $('.occ__long', el);
        openDetail({
          src: img ? (img.currentSrc || img.src) : el.dataset.detailImg,
          alt: img ? img.alt : '',
          title: $('.occ__title', el) ? $('.occ__title', el).textContent : el.textContent.trim(),
          text: textEl.textContent,
          href: waLink(el.dataset.detailWa),
        });
      };
      el.addEventListener('click', open);
      // Un enlace con role="button" también debe activarse con la barra espaciadora
      if (el.tagName === 'A') el.addEventListener('keydown', (e) => { if (e.key === ' ') open(e); });
    });

    $('.detail__close', detail).addEventListener('click', () => detail.close());
    detail.addEventListener('click', (e) => { if (e.target === detail) detail.close(); }); // clic en el fondo
    detail.addEventListener('close', () => document.body.classList.remove('modal-open'));
  }

  // ---- El botón flotante de WhatsApp se oculta cuando se ve el footer (ya tiene sus propios enlaces) ----
  const waFloat = $('.wa-float');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => waFloat.classList.toggle('is-hidden', entry.isIntersecting))
      .observe($('.site-footer'));
  }

  // ---- Aparición suave al hacer scroll ----
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Instagram: video en loop al pasar el mouse (solo si la tarjeta tiene data-video) ----
  // Pendiente antes de usar videos en táctil: agregar un botón de pausa (WCAG 2.2.2).
  $$('[data-reel][data-video]').forEach((card) => {
    let video = null;

    const build = () => {
      if (video) return video;
      video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-hidden', 'true');
      video.src = card.dataset.video;
      video.addEventListener('error', () => { video.remove(); video = null; }, { once: true });
      card.prepend(video);
      return video;
    };
    const play = () => {
      if (reducedMotion) return;
      build().play().then(() => card.classList.add('is-playing')).catch(() => {});
    };
    const stop = () => {
      if (!video) return;
      video.pause();
      card.classList.remove('is-playing');
    };

    card.addEventListener('mouseenter', play);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focus', play);
    card.addEventListener('blur', stop);
  });
})();
