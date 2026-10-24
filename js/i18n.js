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
      'detail.kicker': 'Cuándo regalarlo',
      'detail.view': 'Ver detalles',
      'detail.close': 'Cerrar',
      'p1.long': 'Las peonías rosadas son la flor de la ternura y la buena fortuna, por eso este arreglo es ideal cuando quieres decir algo sentido sin que resulte pesado. Elígelo para un primer aniversario, un baby shower, una sorpresa del Día de la Madre o para dar la bienvenida a un recién nacido. También va muy bien en una despedida de soltera o para agradecer a quien te ha cuidado. Las peonías tienen una temporada corta, así que el ramo se siente especial y poco común. Sus flores llenas y onduladas llenan la habitación de color suave y un perfume ligero, perfectas para una mesa de noche, el comedor o una recepción. Se disfrutan mejor durante la primera semana.',
      'p2.long': 'Este ramo suave, en tonos empolvados, de rosas, lisianthus y hortensia está hecho para el romance. Elígelo para un aniversario, San Valentín, una propuesta o una disculpa que merece más que palabras. También funciona de maravilla como regalo de boda, para una despedida de soltera o como un tranquilo «pienso en ti» un martes cualquiera. La paleta suave resulta elegante y no estridente, así que le queda bien a tu pareja, a tu madre o a una amiga. La hortensia aporta volumen generoso y el lisianthus dura bien en el agua. Se entrega listo para poner en un florero sobre la mesa de la sala, donde sus colores delicados se admirarán durante días.',
      'p3.long': 'Las hortensias fucsia aportan energía y seguridad, por eso este es el arreglo para celebraciones con carácter. Elígelo para un cumpleaños, una graduación, un ascenso, un estreno o una casa nueva, cuando quieres que el regalo se note desde el momento en que llega. También es una forma alegre de iluminar una oficina, una sala de espera o la semana difícil de una amiga. Las flores densas y redondeadas con follaje verde lucen impactantes en un florero sencillo y casi no necesitan arreglo. Las hortensias son sedientas, así que cambia el agua seguido. Va con personas que aman el color y no temen una declaración atrevida.',
      'p4.long': 'Las rosas blancas hablan de respeto, nuevos comienzos y elegancia atemporal, aquí acompañadas por delicada paniculata. Este arreglo es una elección segura y refinada para muchos momentos: una boda o un compromiso, un bautizo, un regalo corporativo, un agradecimiento a un mentor o una disculpa discreta. Como el blanco es sereno y universal, también va bien en ocasiones formales en las que quieres mostrar cariño sin un mensaje fuerte, y es apropiado cuando no conoces el gusto de quien lo recibe. Luce hermoso en un recibidor, una recepción o junto a una cama. Elígelo cuando busques un estilo clásico que nunca pasa de moda.',
      'p5.long': 'Los delicados ranúnculos y tulipanes blancos con toques rosados dan a este ramo un aire fresco, de primavera. Es perfecto para celebraciones suaves: un bebé recién nacido, un bautizo, una despedida de soltera, el cumpleaños de alguien dulce o los primeros días cálidos del año. También es un bonito regalo para desear una pronta recuperación, porque transmite ligereza y esperanza en lugar de peso. Su forma aireada cabe fácilmente en la mesa de la cocina, un escritorio o la mesita de un hospital. Los tulipanes siguen creciendo en el florero, así que el ramo cambia de forma durante varios días, lo que le suma encanto. Elígelo cuando quieras decir algo amable en voz baja.',
      'p6.long': 'Las calas anaranjadas, las rosas y la hortensia verde forman un arreglo cálido y sofisticado, de línea moderna. Elígelo para brindar por un logro: un nuevo empleo, la apertura de un negocio, una casa nueva, una jubilación o un aniversario laboral. Las calas escultóricas transmiten elegancia y seguridad, por lo que también es un buen regalo para alguien de gusto refinado, como un anfitrión, un cliente o un mentor. Los tonos cálidos lucen especialmente bien en otoño y en hogares con decoración de madera o neutra. Colócalo en la mesa del comedor o en la consola de la entrada, donde sus formas fuertes se vuelven el centro de atención. Dura bien y solo necesita agua fresca.',
      'p7.long': 'Los violetas profundos y los rosas intensos le dan a este arreglo un aire señorial, casi teatral. Elígelo para una ocasión nocturna: una cena, un estreno, un aniversario de muchos años o un regalo para alguien que ama el drama y la profundidad. También es adecuado como gesto de condolencia sentido o como regalo para una persona mayor, porque los tonos oscuros transmiten respeto y madurez en lugar de alegría. Su riqueza luce mejor con luz tenue, sobre un piano, un aparador o una mesa de biblioteca. Si quieres impresionar con algo distinto y elegante en lugar del típico ramo pastel, este es el indicado.',
      'p8.long': 'Los tulipanes durazno son amables, esperanzadores y suaves, lo que los convierte en un regalo fácil para casi cualquier persona. Elígelos para dar las gracias, celebrar un nuevo empleo, animar a una amiga, recibir la primavera o simplemente regalar flores sin motivo. Les van bien a maestros, vecinos, madres y colegas, y nunca resultan demasiado formales ni demasiado íntimos. El color delicado calienta cualquier ambiente, desde la encimera de la cocina hasta el escritorio de trabajo. Los tulipanes siguen moviéndose y curvándose en el florero, lo que da al ramo un aspecto natural y relajado. Duran más en habitaciones frescas, lejos del sol directo y de la fruta madura.',
      'occ1.long': 'Un cumpleaños es el día en que una persona espera sentirse celebrada, así que el arreglo debe transmitir alegría desde el momento en que se abre la puerta. Elige flores vivas y coloridas que combinen con la personalidad de quien festejas: ranúnculos, gerberas, tulipanes y flores de primavera aportan energía alegre. Funciona para tu pareja, tus padres, una amiga o un colega, y es una sorpresa muy bien recibida en el trabajo o en una fiesta. Acompáñalo con una tarjeta escrita a mano que recuerde algo compartido. Pídelo con uno o dos días de anticipación si el cumpleaños cae en fin de semana, y cuéntanos los colores favoritos para diseñar a partir de ellos.',
      'occ2.long': 'Las rosas llevan siglos hablando el lenguaje del amor, y un arreglo bien diseñado dice lo que a veces las palabras no alcanzan. Elige rosas rojas o rosas profundos para un aniversario romántico, San Valentín, una propuesta o una disculpa sentida; elige tonos más suaves para una declaración delicada o una primera cita. Muchas parejas repiten el mismo ramo cada año para marcar la fecha. Mantenlo clásico y elegante, con flores generosas y poco follaje de relleno, para que las rosas sean las protagonistas. Entregarlo en el trabajo suma un toque de sorpresa, mientras que una entrega en casa por la noche resulta íntima. Cuéntanos cuántos años cumplen y diseñaremos a partir de ese número.',
      'occ3.long': 'En los momentos de pérdida, las flores acompañan cuando cuesta encontrar las palabras justas. Elige tonos suaves y serenos, casi siempre blanco, crema o verde pálido, con formas tranquilas como hortensias, lirios y rosas. Este arreglo va bien para un funeral, un velatorio o una visita a la familia en su casa, y también es un gesto respetuoso para un colega, un vecino o un amigo que perdió a alguien. Procura que la tarjeta sea breve y sincera. Podemos entregarlo directamente en la funeraria o en la residencia de la familia a la hora adecuada, para que el gesto llegue con cuidado y sin sumar carga a quienes están de duelo.',
      'occ4.long': 'Algunos logros merecen un brindis, y las flores hacen que el momento se sienta oficial. Elige colores vivos y formas seguras para un ascenso, una graduación, una casa nueva, la apertura de un negocio, el nacimiento de un bebé o una jubilación. El arreglo luce muy bien en un escritorio, una mesa de recepción o el comedor, y se mantiene fresco una semana con agua limpia. También funciona como regalo de un equipo o una empresa, porque es visible y lo comparten todos los que están cerca. Añade un mensaje breve que nombre el logro, y lo entregaremos para que la persona disfrute el momento mientras aún es nuevo.',
      'extra1.long': 'Un ramo de agradecimiento convierte la gratitud en algo que se puede ver y oler. Elige tonos suaves y cálidos, como durazno, rosa pálido o crema, porque transmiten cercanía y sinceridad sin resultar románticos. Va bien para una maestra, un médico, un anfitrión, un vecino, un colega que te ayudó o un familiar que hizo un esfuerzo por ti. Mantén un tamaño moderado si es para el trabajo, y añade una tarjeta con una frase concreta sobre lo que hicieron, porque los detalles hacen memorable un agradecimiento. Es una forma atenta de cerrar un favor y fortalecer una relación.',
      'extra2.long': 'Cuando alguien no se siente bien, un ramo lleva luz a una habitación silenciosa. Elige flores frescas y suaves en blanco, rosa o amarillo pálido, con un aroma ligero para que no abrume. Va bien para una internación, una recuperación en casa o una amiga que atraviesa una semana difícil. Consulta antes las normas del hospital, porque algunas áreas no permiten flores, y evita las flores muy perfumadas si la persona tiene alergias o sensibilidad. Un arreglo compacto cabe fácilmente en una mesita de noche. Añade un mensaje breve y cálido que diga que piensas en ella, y deja que las flores se encarguen de animar.',
      'extra3.long': 'Las mejores flores suelen ser las que nadie esperaba. Un ramo enviado sin motivo le dice a alguien que está en tus pensamientos y convierte un día cualquiera en una pequeña celebración. Elige flores alegres y coloridas y deja que tu instinto te guíe. Va bien para tu pareja, una amiga, tu madre, tu hermana o incluso para ti. No hay fecha límite ni presión, así que puedes enviarlo un lunes por la mañana, después de una semana dura o simplemente porque el clima está lindo. Cuéntanos un poco sobre la persona y diseñaremos algo que se sienta personal y espontáneo.',
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
      'occ.more': 'Ver más',
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
      'detail.kicker': 'Когда дарить',
      'detail.view': 'Подробнее',
      'detail.close': 'Закрыть',
      'p1.long': 'Розовые пионы — цветы нежности и удачи, поэтому эта композиция идеальна, когда хочется сказать что-то искренне и без пафоса. Выберите её для первой годовщины, праздника в честь будущего малыша, сюрприза ко Дню матери или в честь рождения ребёнка. Она подойдёт и для девичника, и как благодарность тому, кто о вас заботился. Сезон пионов короток, поэтому букет воспринимается как редкий и особенный. Пышные махровые бутоны наполняют комнату мягким цветом и лёгким ароматом — они прекрасно смотрятся на прикроватной тумбе, обеденном столе или стойке ресепшен. Лучше всего радуют в течение первой недели.',
      'p2.long': 'Этот мягкий букет в пудровых тонах из роз, эустомы и гортензии создан для романтики. Выберите его для годовщины, Дня святого Валентина, предложения руки и сердца или извинения, которое заслуживает большего, чем слова. Он прекрасно подходит и как свадебный подарок, для девичника или как тихое «я думаю о тебе» в самый обычный вторник. Сдержанная палитра выглядит элегантно, а не кричаще, поэтому букет подойдёт партнёру, маме и подруге. Гортензия добавляет щедрый объём, а эустома хорошо стоит в воде. Букет доставляется готовым к вазе — поставьте его на стол в гостиной, и нежные цвета будут радовать глаз много дней.',
      'p3.long': 'Яркие фуксиевые гортензии дарят энергию и уверенность, поэтому эта композиция создана для праздников с характером. Выберите её для дня рождения, выпускного, повышения, премьеры или новоселья, когда хочется, чтобы подарок был замечен с первой секунды. Это и весёлый способ украсить офис, приёмную клиники или трудную неделю друга. Плотные округлые соцветия с зелёной листвой эффектно смотрятся в простой вазе и почти не требуют оформления. Гортензии любят воду, поэтому меняйте её чаще. Композиция для тех, кто любит цвет и не боится смелого высказывания.',
      'p4.long': 'Белые розы говорят об уважении, новых началах и вечной элегантности, а здесь к ним добавлена нежная гипсофила. Эта композиция — безопасный и изысканный выбор для многих случаев: свадьбы или помолвки, крестин, корпоративного подарка, благодарности наставнику или сдержанных извинений. Белый цвет спокоен и универсален, поэтому он подходит для официальных поводов, когда нужно проявить внимание без сильного посыла, и уместен, если вы не знаете вкусов получателя. Она красиво смотрится в прихожей, на ресепшене или у кровати. Выберите её, если хотите классический стиль, который никогда не устаревает.',
      'p5.long': 'Нежные белые ранункулюсы и тюльпаны с розовыми акцентами придают этому букету свежее, весеннее настроение. Он идеален для мягких торжеств: рождения малыша, крестин, девичника, дня рождения кого-то нежного или первых тёплых дней года. Это и прекрасный подарок с пожеланием скорейшего выздоровления, ведь он кажется лёгким и полным надежды, а не тяжёлым. Воздушная форма легко помещается на кухонном столе, рабочем столе или больничной тумбочке. Тюльпаны продолжают расти в вазе, поэтому букет несколько дней меняет форму, и в этом его очарование. Выберите его, когда хочется сказать что-то доброе тихим голосом.',
      'p6.long': 'Оранжевые каллы, розы и зелёная гортензия создают тёплую, изысканную композицию с современной линией. Выберите её, чтобы отметить достижение: новую работу, открытие бизнеса, новоселье, выход на пенсию или рабочую годовщину. Скульптурные каллы выглядят элегантно и уверенно, поэтому композиция подойдёт и человеку с утончённым вкусом — хозяину дома, клиенту или наставнику. Тёплые тона особенно хороши осенью и в интерьерах с деревом или нейтральным декором. Поставьте её на обеденный стол или консоль в прихожей, где выразительные формы станут центром внимания. Она долго стоит и требует лишь свежей воды.',
      'p7.long': 'Глубокие фиолетовые и насыщенные розовые тона придают этой композиции благородный, почти театральный вид. Выберите её для вечернего события: ужина, премьеры, юбилея многолетнего брака или подарка тому, кто любит драму и глубину. Она уместна и как продуманный знак соболезнования, и как подарок человеку старшего возраста, ведь тёмные тона передают уважение и зрелость, а не веселье. Её насыщенность лучше всего раскрывается в приглушённом свете — на рояле, буфете или библиотечном столе. Если хотите удивить чем-то необычным и элегантным вместо привычного пастельного букета, выбирайте её.',
      'p8.long': 'Персиковые тюльпаны дружелюбны, обнадёживающи и нежны, поэтому это лёгкий подарок почти для любого. Выберите их, чтобы поблагодарить, отметить новую работу, поднять настроение подруге, встретить весну или просто подарить цветы без повода. Они подойдут учителям, соседям, мамам и коллегам и никогда не кажутся слишком официальными или слишком личными. Нежный цвет согревает любую комнату — от кухонной столешницы до рабочего стола. Тюльпаны продолжают двигаться и изгибаться в вазе, придавая букету естественный, непринуждённый вид. Лучше всего им в прохладных комнатах, вдали от прямого солнца и спелых фруктов.',
      'occ1.long': 'День рождения — единственный день, когда человек ждёт, что его будут поздравлять, поэтому композиция должна радовать с той секунды, как откроется дверь. Выберите яркие, красочные цветы, подходящие характеру именинника: ранункулюсы, герберы, тюльпаны и весенние цветы дарят весёлую энергию. Композиция подойдёт партнёру, родителям, подруге или коллеге, а в офис или на вечеринку станет приятным сюрпризом. Добавьте открытку, написанную от руки, с общим воспоминанием. Если день рождения выпадает на выходные, закажите за день-два и расскажите о любимых цветах получателя, чтобы мы создали композицию вокруг них.',
      'occ2.long': 'Розы веками говорят на языке любви, а хорошо составленная композиция выражает то, что порой не удаётся словами. Выберите красные или тёмно-розовые розы для романтической годовщины, Дня святого Валентина, предложения или искренних извинений; для нежного признания или первого свидания — более мягкие оттенки. Многие пары каждый год повторяют один и тот же букет, отмечая дату. Сохраняйте классику и элегантность: щедрые бутоны и минимум зелени, чтобы главными оставались розы. Доставка на работу добавит сюрприза, а вечерняя доставка домой создаст интимную атмосферу. Расскажите, сколько лет вы вместе, и мы построим композицию вокруг этого числа.',
      'occ3.long': 'В минуты утраты цветы поддерживают, когда трудно найти нужные слова. Выберите мягкие, спокойные тона — чаще всего белый, кремовый или бледно-зелёный — и сдержанные формы: гортензии, лилии, розы. Такая композиция подходит для похорон, прощания или визита к семье домой, а также как знак уважения коллеге, соседу или другу, потерявшему близкого. Пусть открытка будет краткой и искренней. Мы можем доставить композицию прямо в ритуальный зал или в дом семьи в нужное время, чтобы жест пришёл бережно и не добавил забот тем, кто скорбит.',
      'occ4.long': 'Некоторые достижения заслуживают тоста, а цветы придают моменту официальность. Выберите живые цвета и уверенные формы для повышения, выпускного, новоселья, открытия бизнеса, рождения малыша или выхода на пенсию. Композиция прекрасно смотрится на рабочем столе, у ресепшена или на обеденном столе и остаётся свежей неделю при чистой воде. Она подойдёт и как подарок от команды или компании: её видят и разделяют все вокруг. Добавьте короткое сообщение с названием достижения, и мы доставим композицию, чтобы человек мог насладиться моментом, пока он ещё нов.',
      'extra1.long': 'Букет благодарности превращает признательность в то, что можно увидеть и почувствовать. Выберите мягкие тёплые тона — персиковый, бледно-розовый или кремовый: они выглядят дружелюбно и искренне, не становясь романтичными. Он подойдёт учителю, врачу, хозяевам дома, соседу, коллеге, который вам помог, или родственнику, сделавшему для вас больше обычного. Для офиса выбирайте умеренный размер и добавьте открытку с конкретной фразой о том, что человек сделал: детали делают благодарность запоминающейся. Это внимательный способ закрыть услугу и укрепить отношения.',
      'extra2.long': 'Когда человек нездоров, букет приносит свет в тихую комнату. Выберите свежие нежные цветы белого, розового или бледно-жёлтого цвета с лёгким ароматом, чтобы он не перебивал. Он подойдёт для больничной палаты, выздоровления дома или подруги, у которой трудная неделя. Заранее узнайте правила больницы — в некоторых отделениях цветы запрещены — и избегайте сильно пахнущих цветов, если у человека аллергия или чувствительность. Компактная композиция легко поместится на прикроватной тумбочке. Добавьте короткое тёплое сообщение, что вы думаете о человеке, а ободрение пусть доверят цветам.',
      'extra3.long': 'Лучшие цветы часто те, которых никто не ждал. Букет без повода говорит человеку, что вы о нём думаете, и превращает обычный день в маленький праздник. Выберите весёлые, яркие цветы и доверьтесь интуиции. Он подойдёт партнёру, подруге, маме, сестре или даже вам самим. Ни сроков, ни давления: отправьте его в понедельник утром, после тяжёлой недели или просто потому, что на улице прекрасная погода. Расскажите нам немного о человеке, и мы создадим что-то личное и спонтанное.',
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
      'occ.more': 'Подробнее',
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
