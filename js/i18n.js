(() => {
  'use strict';

  // ---- Idiomas ----------------------------------------------------------
  // El inglés (idioma principal) vive en el propio HTML (respaldo sin JS y para buscadores): al cargar
  // se guarda una copia de cada texto marcado y es lo que se restaura al volver a "en". Aquí está el español.
  //   data-i18n="clave"                      → reemplaza el contenido del elemento
  //   data-i18n-attr="atributo:clave;..."    → reemplaza atributos (alt, aria-label, data-wa, ...)
  // Para agregar otro idioma: súmalo a LANGS, crea su diccionario en DICT y agrega un botón [data-lang].
  const LANGS = ['en', 'es', 'ru'];
  const DEFAULT = 'en';
  const STORAGE_KEY = 'lang';

  const DICT = {
    // Solo textos que genera el JS (en el HTML ya están en inglés)
    en: {
      'wa.product': 'Hello, I\'m interested in the arrangement "{name}". Is it available?',
      'aria.order': 'Order {name}',
      'newtab': '(opens in a new tab)',
    },
    es: {
      // Los textos de abajo reemplazan a los marcados con data-i18n / data-i18n-attr
      'wa.product': 'Hola, me interesa el arreglo "{name}". ¿Tienen disponibilidad?',
      'aria.order': 'Pedir {name}',
      'newtab': '(se abre en una pestaña nueva)',
      'skip': 'Saltar al contenido',
      'announce': 'Arreglos florales de autor · Consulta disponibilidad y entrega por',
      'nav.home': 'Inicio',
      'nav.occasions': 'Ocasiones',
      'occ1.title': 'Cumpleaños',
      'occ2.title': 'Aniversario y amor',
      'occ3.title': 'Condolencias',
      'occ4.title': 'Felicitaciones',
      'nav.other': 'Gracias · Mejórate pronto · Sin motivo',
      'nav.arrangements': 'Arreglos',
      'nav.about': 'Sobre Ana María',
      'nav.contact': 'Contacto',
      'hero.kicker': 'Florería de autor',
      'hero.title': 'Cada arreglo, una obra de <span class="script">arte floral</span>',
      'hero.text': 'No vendemos flores: creamos experiencias que transmiten lujo, sofisticación y emoción. Diseño floral hecho a mano para cada momento especial.',
      'hero.cta1': 'Elegir por ocasión',
      'hero.cta2': 'Ver todos los arreglos',
      'panel.title': 'Arreglos destacados',
      'panel.lead': 'Diseños de autor, ramos y arreglos listos para regalar.',
      'panel.all': 'Ver todos',
      'step1.kicker': 'Paso uno',
      'step1.title': 'Elige tu arreglo.',
      'step1.text': 'Explora ramos y arreglos, y escoge el que mejor transmita lo que quieres decir.',
      'step2.kicker': 'Paso dos',
      'step2.title': 'Cuéntanos los detalles.',
      'step2.text': 'Destinatario, dirección, fecha y el mensaje de tu tarjeta. Todo por WhatsApp.',
      'step3.kicker': 'Paso tres',
      'step3.title': 'Diseñamos y entregamos.',
      'step3.text': 'Cada pieza se arma a mano y se entrega con el mayor cuidado.',
      'p1.name': 'Peonías rosadas',
      'p1.desc': 'Suaves, románticas y llenas de volumen.',
      'order': 'Pedir',
      'p2.name': 'Bouquet romántico',
      'p2.desc': 'Rosas, lisianthus y hortensia en tonos empolvados.',
      'p3.name': 'Hortensia fucsia',
      'p3.desc': 'Color intenso para celebrar con carácter.',
      'p4.name': 'Rosas blancas',
      'p4.desc': 'Elegancia atemporal con paniculata.',
      'p5.name': 'Ramo blanco y rosa',
      'p5.desc': 'Delicado, fresco y de aire primaveral.',
      'p6.name': 'Calas y rosas',
      'p6.desc': 'Tonos cálidos para brindar con estilo.',
      'p7.name': 'Jardín nocturno',
      'p7.desc': 'Violetas y rosas profundos, de aire señorial.',
      'p8.name': 'Tulipanes durazno',
      'p8.desc': 'Suavidad y color en tonos delicados.',
      'occ.kicker': 'Comprar por ocasión',
      'occ.title': '¿Cuál es la <span class="script">ocasión?</span>',
      'occ.lead': 'Arreglos de autor para cada momento, grande o pequeño.',
      'occ1.chip1': 'Vibrante',
      'occ1.chip2': 'Festivo',
      'occ1.desc': 'Arreglos vibrantes que hacen del momento de la entrega una celebración.',
      'occ.more': 'Consultar',
      'occ2.chip1': 'Rosas',
      'occ2.chip2': 'Elegancia',
      'occ2.desc': 'Rosas y composiciones elegantes para aniversarios, San Valentín y cada gesto de cariño.',
      'occ3.chip1': 'Sereno',
      'occ3.chip2': 'Con respeto',
      'occ3.desc': 'Arreglos suaves y serenos para acompañar con respeto en los momentos más difíciles.',
      'occ4.chip1': 'Celebración',
      'occ4.chip2': 'Logros',
      'occ4.desc': 'Para brindar por ascensos, graduaciones, nuevos hogares y todo logro que merece flores.',
      'occ.also': 'También:',
      'extra.thanks': 'Gracias',
      'extra.getwell': 'Mejórate pronto',
      'extra.justbecause': 'Sin motivo',
      'about.kicker': 'Conoce a Ana María',
      'about.title': 'Flores con alma, diseñadas <span class="script">a mano.</span>',
      'about.p1': 'Ana María Florería nace con una idea: transformar cada arreglo floral en una obra de arte. Detrás de cada pieza hay dedicación, sensibilidad y una mirada que busca emocionar.',
      'about.p2': 'Nuestra misión es crear experiencias memorables a través de arreglos únicos, diseñados con elegancia, que transmitan lujo, sofisticación y emociones auténticas en cada ocasión especial.',
      'about.quote': 'Cada pétalo cuenta algo.',
      'about.cta': 'Hablemos por WhatsApp',
      'v1.title': 'Excelencia',
      'v1.text': 'Atención cuidada en cada detalle del diseño y del acabado.',
      'v2.title': 'Elegancia',
      'v2.text': 'Composiciones equilibradas y atemporales.',
      'v3.title': 'Emoción',
      'v3.text': 'Arreglos pensados para que quien los recibe sienta que alguien lo tuvo presente.',
      'v4.title': 'Exclusividad',
      'v4.text': 'Diseños de autor, pensados con sensibilidad para cada ocasión.',
      'v5.title': 'Innovación',
      'v5.text': 'Nuevas miradas del diseño floral, fieles a nuestra esencia.',
      'insta.kicker': 'Síguenos en Instagram',
      'insta.follow': 'Seguir',
      'reel1.label': 'Tulipanes de temporada',
      'reel2.label': 'Detalle de una rosa malva',
      'reel3.label': 'Ramos para el gran día',
      'reel4.label': 'Arreglo de lirios y silvestres',
      'footer.tag': 'Arreglos florales de autor: lujo, sofisticación y emoción en cada ocasión.',
      'footer.explore': 'Explorar',
      'footer.rights': 'Todos los derechos reservados',
      'footer.credits': 'Créditos de fotos',
      'wa.avail': 'Hola, quisiera consultar disponibilidad y entrega.',
      'aria.menu': 'Menú',
      'aria.nav': 'Principal',
      'aria.close': 'Cerrar menú',
      'aria.home': 'Ana María Florería, inicio',
      'aria.browse': 'Ver arreglos',
      'aria.lang': 'Idioma',
      'wa.catalog': 'Hola, quisiera ver el catálogo completo de arreglos.',
      'p1.alt': 'Peonías rosadas en florero de cristal',
      'p2.alt': 'Ramo de rosas rosadas, lisianthus y hortensias',
      'p3.alt': 'Ramo de hortensias fucsia con follaje verde',
      'p4.alt': 'Rosas blancas con paniculata',
      'p5.alt': 'Ramo blanco de ranúnculos y tulipanes con toques rosados',
      'p6.alt': 'Arreglo con calas anaranjadas, rosas y hortensia verde',
      'p7.alt': 'Arreglo floral en tonos rosa y violeta',
      'p8.alt': 'Tulipanes color durazno',
      'wa.birthday': 'Hola, busco un arreglo para un cumpleaños.',
      'occ1.alt': 'Ranúnculos y flores de colores vivos',
      'wa.love': 'Hola, busco un arreglo para un aniversario o para decir te quiero.',
      'occ2.alt': 'Ramo de rosas rojas',
      'wa.condolences': 'Hola, busco un arreglo para expresar condolencias.',
      'occ3.alt': 'Hortensias blancas',
      'wa.congrats': 'Hola, busco un arreglo para felicitar a alguien.',
      'occ4.alt': 'Ramo de rosas rosadas con hipérico rojo',
      'wa.thanks': 'Hola, busco un arreglo para agradecer.',
      'wa.getwell': 'Hola, busco un arreglo para desear que se mejoren.',
      'wa.justbecause': 'Hola, busco un arreglo para regalar sin motivo.',
      'wa.custom': 'Hola Ana María, me gustaría hablar sobre un arreglo a medida.',
      'aria.follow': 'Seguir en Instagram',
      'reel1.alt': 'Tulipanes de colores',
      'reel2.alt': 'Rosa de tono malva',
      'reel3.alt': 'Ramo en manos de una novia',
      'reel4.alt': 'Arreglo de lirios y flores silvestres',
      'wa.inquiry': 'Hola, quisiera hacer una consulta.',
      'wa.order': 'Hola, quisiera hacer un pedido.',
      'aria.wa': 'Pedir por WhatsApp',
      'meta.title': 'Ana María Florería | Arreglos florales de autor',
      'meta.description': 'Ana María Florería: arreglos florales de autor, diseñados a mano para cada ocasión. Pedidos por WhatsApp.',
    },
    ru: {
      'wa.product': 'Здравствуйте, меня интересует композиция «{name}». Она есть в наличии?',
      'aria.order': 'Заказать: {name}',
      'newtab': '(откроется в новой вкладке)',

      'meta.title': 'Ana María Florería | Авторские цветочные композиции',
      'meta.description': 'Ana María Florería: авторские цветочные композиции ручной работы для любого случая. Заказ через WhatsApp.',

      'skip': 'Перейти к содержимому',
      'announce': 'Авторские цветочные композиции · Уточните наличие и доставку в',
      'aria.menu': 'Меню',
      'aria.nav': 'Главная навигация',
      'aria.close': 'Закрыть меню',
      'aria.home': 'Ana María Florería, главная',
      'aria.browse': 'Смотреть композиции',
      'aria.wa': 'Заказать через WhatsApp',
      'aria.lang': 'Язык',
      'aria.follow': 'Подписаться в Instagram',

      'nav.home': 'Главная',
      'nav.occasions': 'Поводы',
      'nav.other': 'Спасибо · Выздоравливай · Просто так',
      'nav.arrangements': 'Композиции',
      'nav.about': 'Об Ана Мария',
      'nav.contact': 'Контакты',

      'hero.kicker': 'Авторская флористика',
      'hero.title': 'Каждая композиция — <span class="script">искусство флористики</span>',
      'hero.text': 'Мы не просто продаём цветы: мы создаём впечатления, в которых есть роскошь, изысканность и чувство. Флористический дизайн ручной работы для каждого особенного момента.',
      'hero.cta1': 'Выбрать по поводу',
      'hero.cta2': 'Все композиции',

      'panel.title': 'Избранные композиции',
      'panel.lead': 'Авторские букеты и композиции, готовые стать подарком.',
      'panel.all': 'Смотреть все',
      'step1.kicker': 'Шаг первый',
      'step1.title': 'Выберите композицию.',
      'step1.text': 'Посмотрите букеты и композиции и выберите ту, что лучше всего скажет то, что вы хотите сказать.',
      'step2.kicker': 'Шаг второй',
      'step2.title': 'Расскажите детали.',
      'step2.text': 'Получатель, адрес, дата и текст открытки. Всё через WhatsApp.',
      'step3.kicker': 'Шаг третий',
      'step3.title': 'Мы создаём и доставляем.',
      'step3.text': 'Каждая композиция собирается вручную и доставляется с особой заботой.',

      'order': 'Заказать',
      'p1.name': 'Розовые пионы', 'p1.desc': 'Нежные, романтичные и пышные.', 'p1.alt': 'Розовые пионы в стеклянной вазе',
      'p2.name': 'Романтический букет', 'p2.desc': 'Розы, эустома и гортензия в пудровых тонах.', 'p2.alt': 'Букет из розовых роз, эустомы и гортензий',
      'p3.name': 'Фуксиевая гортензия', 'p3.desc': 'Насыщенный цвет, чтобы праздновать с характером.', 'p3.alt': 'Букет фуксиевых гортензий с зелёной листвой',
      'p4.name': 'Белые розы', 'p4.desc': 'Вечная элегантность с гипсофилой.', 'p4.alt': 'Белые розы с гипсофилой',
      'p5.name': 'Бело-розовый букет', 'p5.desc': 'Нежный, свежий, с весенним настроением.', 'p5.alt': 'Белый букет из ранункулюсов и тюльпанов с розовыми акцентами',
      'p6.name': 'Каллы и розы', 'p6.desc': 'Тёплые тона, чтобы поднять бокал со вкусом.', 'p6.alt': 'Композиция с оранжевыми каллами, розами и зелёной гортензией',
      'p7.name': 'Ночной сад', 'p7.desc': 'Глубокие фиолетовые и розовые тона, полные благородства.', 'p7.alt': 'Цветочная композиция в розовых и фиолетовых тонах',
      'p8.name': 'Персиковые тюльпаны', 'p8.desc': 'Мягкость и цвет в нежных оттенках.', 'p8.alt': 'Тюльпаны персикового цвета',

      'occ.kicker': 'Выбрать по поводу',
      'occ.title': 'Какой у вас <span class="script">повод?</span>',
      'occ.lead': 'Авторские композиции для любого момента, большого или маленького.',
      'occ.more': 'Узнать',
      'occ.also': 'Также:',
      'occ1.title': 'День рождения', 'occ1.chip1': 'Яркий', 'occ1.chip2': 'Праздничный',
      'occ1.desc': 'Яркие композиции, которые превращают момент доставки в праздник.', 'occ1.alt': 'Ранункулюсы и цветы ярких оттенков',
      'occ2.title': 'Годовщина и любовь', 'occ2.chip1': 'Розы', 'occ2.chip2': 'Элегантность',
      'occ2.desc': 'Розы и элегантные композиции для годовщин, Дня святого Валентина и каждого проявления нежности.', 'occ2.alt': 'Букет красных роз',
      'occ3.title': 'Соболезнования', 'occ3.chip1': 'Сдержанный', 'occ3.chip2': 'С уважением',
      'occ3.desc': 'Мягкие, спокойные композиции, чтобы с уважением поддержать в самые трудные минуты.', 'occ3.alt': 'Белые гортензии',
      'occ4.title': 'Поздравления', 'occ4.chip1': 'Праздник', 'occ4.chip2': 'Достижения',
      'occ4.desc': 'Чтобы отметить повышение, выпускной, новый дом и любое достижение, достойное цветов.', 'occ4.alt': 'Букет розовых роз с красным зверобоем',
      'extra.thanks': 'Спасибо',
      'extra.getwell': 'Выздоравливай',
      'extra.justbecause': 'Просто так',

      'about.kicker': 'Знакомьтесь: Ана Мария',
      'about.title': 'Цветы с душой, <span class="script">созданные вручную.</span>',
      'about.p1': 'Ana María Florería родилась из одной идеи: превратить каждую цветочную композицию в произведение искусства. За каждой работой стоят преданность делу, чуткость и взгляд, который стремится трогать сердце.',
      'about.p2': 'Наша миссия — создавать запоминающиеся впечатления с помощью уникальных, элегантно оформленных композиций, в которых есть роскошь, изысканность и искренние чувства в каждый особенный момент.',
      'about.quote': 'У каждого лепестка есть своя история.',
      'about.cta': 'Напишите нам в WhatsApp',
      'v1.title': 'Совершенство', 'v1.text': 'Внимание к каждой детали дизайна и исполнения.',
      'v2.title': 'Элегантность', 'v2.text': 'Гармоничные композиции, не подвластные времени.',
      'v3.title': 'Эмоции', 'v3.text': 'Композиции, после которых получатель чувствует, что о нём подумали.',
      'v4.title': 'Эксклюзивность', 'v4.text': 'Авторские работы, продуманные с душой для каждого повода.',
      'v5.title': 'Новизна', 'v5.text': 'Свежий взгляд на флористический дизайн, верный нашей сути.',

      'insta.kicker': 'Подписывайтесь в Instagram',
      'insta.follow': 'Подписаться',
      'reel1.label': 'Сезонные тюльпаны', 'reel1.alt': 'Разноцветные тюльпаны',
      'reel2.label': 'Деталь лиловой розы', 'reel2.alt': 'Роза лилового оттенка',
      'reel3.label': 'Букеты для главного дня', 'reel3.alt': 'Букет в руках невесты',
      'reel4.label': 'Композиция из лилий и полевых цветов', 'reel4.alt': 'Композиция из лилий и полевых цветов',

      'footer.tag': 'Авторские цветочные композиции: роскошь, изысканность и чувство для любого случая.',
      'footer.explore': 'Разделы',
      'footer.rights': 'Все права защищены',
      'footer.credits': 'Авторы фотографий',

      'wa.order': 'Здравствуйте, я хотел бы сделать заказ.',
      'wa.inquiry': 'Здравствуйте, у меня есть вопрос.',
      'wa.avail': 'Здравствуйте, я хотел бы уточнить наличие и доставку.',
      'wa.catalog': 'Здравствуйте, я хотел бы посмотреть полный каталог композиций.',
      'wa.custom': 'Здравствуйте, Ана Мария! Я хотел бы обсудить композицию на заказ.',
      'wa.birthday': 'Здравствуйте, я ищу композицию ко дню рождения.',
      'wa.love': 'Здравствуйте, я ищу композицию к годовщине или чтобы сказать «я люблю тебя».',
      'wa.condolences': 'Здравствуйте, я ищу композицию, чтобы выразить соболезнования.',
      'wa.congrats': 'Здравствуйте, я ищу композицию, чтобы кого-то поздравить.',
      'wa.thanks': 'Здравствуйте, я ищу композицию, чтобы сказать спасибо.',
      'wa.getwell': 'Здравствуйте, я ищу композицию, чтобы пожелать скорейшего выздоровления.',
      'wa.justbecause': 'Здравствуйте, я ищу композицию, чтобы подарить просто так.',
    },
  };

  const $$ =(sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const metaDesc = document.querySelector('meta[name="description"]');

  let lang = DEFAULT;

  // ---- Copia del español original (antes de que main.js toque el DOM) ----
  const source = new Map();
  $$('[data-i18n], [data-i18n-attr]').forEach((el) => {
    const entry = { html: null, attrs: [] };
    if (el.dataset.i18n) entry.html = el.innerHTML;
    (el.dataset.i18nAttr || '').split(';').filter(Boolean).forEach((pair) => {
      const i = pair.indexOf(':');
      const attr = pair.slice(0, i).trim();
      entry.attrs.push({ attr, key: pair.slice(i + 1).trim(), value: el.getAttribute(attr) });
    });
    source.set(el, entry);
  });
  source.set('title', document.title);
  source.set('description', metaDesc ? metaDesc.content : '');

  // t('clave', { name: 'x' }): texto en el idioma actual; si falta en inglés cae al español
  const t = (key, vars = {}) => {
    const text = (DICT[lang] && DICT[lang][key]) ?? DICT[DEFAULT][key] ?? key;
    return text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? vars[name] : m));
  };

  const apply = () => {
    const isDefault = lang === DEFAULT;
    const pick = (key, original) => (isDefault ? original : DICT[lang][key] ?? original);

    source.forEach((entry, el) => {
      if (typeof el === 'string') return;
      if (entry.html !== null) el.innerHTML = pick(el.dataset.i18n, entry.html);
      entry.attrs.forEach(({ attr, key, value }) => el.setAttribute(attr, pick(key, value)));
    });
    document.title = pick('meta.title', source.get('title'));
    if (metaDesc) metaDesc.content = pick('meta.description', source.get('description'));
    document.documentElement.lang = lang;

    $$('[data-lang]').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang)));
  };

  const setLang = (next, { persist = true } = {}) => {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next;
    apply();
    if (persist) { try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) { /* modo privado */ } }
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang } }));
  };

  // Idioma inicial: elección guardada → idioma del navegador → español
  const initial = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (LANGS.includes(saved)) return saved;
    } catch (_) { /* sin almacenamiento */ }
    const preferred = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]) || [];
    const match = preferred.map((l) => String(l).toLowerCase().slice(0, 2)).find((l) => LANGS.includes(l));
    return match || DEFAULT;
  };

  $$('[data-lang]').forEach((btn) => btn.addEventListener('click', () => setLang(btn.dataset.lang)));

  window.I18N = { t, setLang, get lang() { return lang; } };

  setLang(initial(), { persist: false });
})();
