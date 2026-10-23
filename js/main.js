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

  // ---- Detalle de arreglo: al tocar una tarjeta se abre una ventana con la foto grande y cuándo regalarlo ----
  // El texto largo vive oculto en cada tarjeta (.card__long) y i18n.js lo traduce como el resto.
  const detail = $('#detail');
  if (detail && typeof detail.showModal === 'function') {
    const dImg = $('.detail__img', detail);
    const dTitle = $('.detail__title', detail);
    const dText = $('.detail__text', detail);
    const dOrder = $('.detail__order', detail);

    const openDetail = (card) => {
      const img = $('.card__media img', card);
      dImg.src = img.currentSrc || img.src;
      dImg.alt = img.alt;
      dTitle.textContent = $('.card__name', card).textContent;
      dText.textContent = $('.card__long', card).textContent;
      dOrder.href = $('[data-wa-product]', card).href;
      document.body.classList.add('modal-open');
      detail.showModal();
      detail.scrollTop = 0;
    };

    $$('.card').forEach((card) => card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) openDetail(card); // el botón "Pedir" de la tarjeta sigue yendo a WhatsApp
    }));
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
