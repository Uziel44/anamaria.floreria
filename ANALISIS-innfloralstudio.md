# Análisis de innfloralstudio.com — para copiar y aprender (Angela Florista)

- **Web analizada:** https://innfloralstudio.com/ (floristería de San Francisco, EE. UU.)
- **Fecha del análisis:** 2026-10-22
- **Cómo se hizo:** descarga del HTML real del home (1 MB) + lectura de una colección (`/collections/sympathy-flowers`) y una ficha (`/products/blush-elegance-bouquet`). No se vio renderizada en navegador, ni se recorrió carrito ni checkout.
- **Agentes de Plexi usados** (`plexi/03-producto-ux-diseno`): UX Architect, UI Designer, Persona Walkthrough, Behavioral Nudge Engine.
- **Nota:** el `flower.html` e `index.html` de esta carpeta están vacíos (0 bytes). Los `.scss` y `preloads.js` sueltos son genéricos (el `preloads.js` es el prefetch del checkout de Shopify) y no describen esta web.

---

## 1. Resumen en 30 segundos

| Tema | Respuesta |
|---|---|
| Plataforma | **Shopify**, tema **Horizon 3.4.0** con secciones personalizadas (`innfloralstudiotheme/main`) |
| ¿Tiene IA? | **No hay chatbot de IA propio.** Hay bloques generados con **Shopify Sidekick** (`ai_gen_block`) en el footer y en "preparation instructions" |
| Chat | Chat nativo de Shopify (`<shopify-chat>`), **no hay WhatsApp** |
| Fecha de entrega | App **Delivery Date** (omega-dingdoong), pero **está apagada** (ver sección 5) |
| Reseñas | **Ninguna** |
| Lo mejor | Hero claro, ocasiones, 3 pasos, SEO por barrio, barra con código de envío |
| Lo peor | Catálogo entero en el home, sin prueba social, sin hora límite, sin WhatsApp |

---

## 2. Todo lo que tiene la página (en orden de aparición)

### Barra y header
1. **Skip link** de accesibilidad ("Skip to content").
2. **Barra de anuncio:** `🌸 Free local delivery in San Francisco use code FREEDELIVERY`.
3. **Header sticky** con logo (imagen), menú y 3 iconos: búsqueda, cuenta, carrito.
4. **Menú:** Home · Occasions ▾ · Arrangements ▾ · About us · Contact · FAQ.
   - *Occasions:* Birthday Flowers, Anniversary & Romance, Sympathy & Condolences, Congratulations, Thank You, Get Well Soon, Just Because.
   - *Arrangements:* Bouquets, Vase Arrangements, Box Arrangements.
5. **Menú móvil / "More"** (el menú está duplicado en el HTML).
6. **Búsqueda predictiva** (`predictive-search-component`) con resultados de productos.
7. **Cart drawer** (carrito lateral): estado vacío, "Have an account? Log in to check out faster", botón "Continue shopping".

### Home
1. **Hero** (sección personalizada `hero_78qeTb`): kicker "San Francisco & Bay Area" · H1 "Beautiful Flowers, Delivered Across SF" · subtítulo con "same-day" · 2 botones: **Shop by Occasion** / **Shop All Flowers**.
2. **Featured arrangements:** grilla de ~37 productos ($75–$230 en el home), con precio visible, botón **Add** (1 variante) o **Choose** (varias), y galería con varias fotos por tarjeta. Enlace "View all".
3. **How it works** (3 pasos, intercalado en la grilla): *Choose the arrangement → Add delivery details → We design and deliver.*
4. **Shop by occasion** (`home_occasions`): 4 tarjetas — Birthday, Anniversary & Romance, Sympathy & Condolences, Congratulations — con etiqueta tipo "Same-day SF".
5. **Delivery areas** (`home_seo_neighborhoods`): 16 barrios de SF (Mission, Castro, Marina, Pacific Heights, Nob Hill, Hayes Valley, SoMa, Financial District, Sunset, Richmond, Haight-Ashbury, Chinatown, North Beach, Potrero Hill, Mission Bay, Fillmore) + 5 condados (Marin, Alameda, San Mateo, Santa Clara, Contra Costa). Cada uno enlaza a su propia página (`flowers-sf-castro`, etc.).
6. **Why choose us** (`home_why_choose`): 4 bloques + CTA "Shop flower delivery".
7. **Instagram:** "Follow along on Instagram" (@inn_floralstudio), feed con la app GSC Instagram Feed.
8. **"Special preparation instructions":** bloque de app que aparece **vacío/huérfano** al final del home.
9. **Footer:** tagline "Premium flowers, made simple.", teléfono, email, Customer Care (5 políticas: entrega y sustituciones, privacidad, términos, accesibilidad, página SEO general), redes (Instagram, Facebook), © 2026.

### Catálogo y producto (según el análisis de la colección y la ficha)
- Colecciones por **ocasión** y por **formato** (ramos, jarrón, caja), con filtros de precio y orden.
- Variantes en la URL del producto, add-to-cart pegajoso (sticky), un **jarrón como extra por $20**, "You may also like" (vacío en la ficha revisada).
- Campo de texto "Special preparation instructions" (app de terceros).
- Slug mal cargado en un producto (URL en cirílico).

---

## 3. Stack técnico

### Arquitectura del tema (Horizon)
- **Web components** propios, sin framework: `product-card`, `quick-add-component`, `slideshow-component`, `cart-drawer-component`, `header-component`, `predictive-search-component`, `dialog-component`, `announcement-bar-component`, `overflow-list`, `header-drawer`, etc.
- **Import map** con módulos `@theme/*`: `component`, `events`, `product-form`, `variant-picker`, `media-gallery`, `quick-add`, `section-renderer`, `section-hydration`, `fly-to-cart` (animación al carrito), `sticky-add-to-cart`, `comparison-slider`, `recently-viewed-products`, `paginated-list`, `scrolling`, `money-formatting`, `morph`, `focus`, `dialog`, `performance`.
- **Archivos CSS:** `base.css`, `overflow-list.css`, `compiled_assets/styles.css`.
- **Carga:** 37 imágenes `eager` y 98 `lazy`.

### Apps / integraciones (qué hace cada una y alternativa)

| Integración | Para qué sirve | Alternativa gratis o barata |
|---|---|---|
| **Delivery Date** (omega-dingdoong) | Calendario de entrega, cut-off, zonas, pickup/delivery/shipping | Campo de fecha en el formulario + WhatsApp; Google Forms |
| **Shopify Sidekick** (`ai_gen_block`) | Bloques de texto/estilo generados con IA (footer, preparation instructions) | ChatGPT/Claude y revisar el texto a mano |
| **Shopify Chat / Inbox** | Chat en el sitio | **Botón de WhatsApp** (click-to-chat, gratis) |
| **Shop Pay / accelerated checkout** (Apple Pay, PayPal) | Pago rápido | Mercado Pago, Stripe Link, PayPal |
| **GSC Instagram Feed** | Feed de Instagram en el sitio | Embed nativo de Instagram, Behold (plan free) |
| **Google Ads + GA4** | Publicidad y analítica | GA4 gratis + Google Business Profile |
| **Meta Pixel** | Retargeting en Facebook/Instagram | Gratis |
| **Microsoft Clarity** | Mapas de calor y grabaciones | Gratis |
| hCaptcha de formularios Shopify | Anti-spam | Cloudflare Turnstile |
| *(falta)* Reseñas | Prueba social | Judge.me free, Google Reviews, Trustindex free |

> ⚠️ Los IDs de Ads, GA4, Meta y Clarity que aparecen en su HTML son **del dueño**. No los copies a tu web.

### Qué es lo de "IA" que viste
- `ai_gen_block_*` son bloques que **Shopify Sidekick** (asistente de IA de Shopify) genera dentro del editor de temas. Por eso el footer y "preparation instructions" tienen clases tipo `ai-footer-…aigenblock…`.
- Se nota en el copy genérico ("Premium flowers, made simple", "handled with care").
- **No** hay chatbot, ni recomendador, ni buscador con IA propio.

---

## 4. Sistema visual (verificado en el CSS real)

> Hallazgo: el tema base es **monocromo blanco/negro**. La calidez floral (salvia, rosa, crema) vive en secciones personalizadas con colores hardcodeados.

| Grupo | Valores |
|---|---|
| Texto | cuerpo `rgb(0 0 0 / .81)` · headings `#000` |
| Fondos | `#FFFFFF`, `#F5F5F5`, `#EEF1EA` (salvia claro), `#E1EDF5` (azul claro), `#333333` |
| Botón primario del tema | fondo `#000`, texto `#FFF`, hover `#333` |
| Custom floral | verde salvia oscuro `#34463B` (títulos), `#61756A` (texto secundario), rosa `#F6D7CD` (hover `#F9E2DA`), crema `#F5F0E8` (hero), `#FAF8F5` (footer), texto de botón `#3B2925` |
| Estados | error `#8B0000`, success `#006400`, in-stock `#3ED660`, low `#EE9441` |
| Fuentes | **Playfair Display** (títulos) · **Poppins** (cuerpo) · **Inter** (subtítulos, UI y botones) |
| Escala | h1 `clamp(3rem, 5.6vw, 3.5rem)` · h2 `clamp(2.25rem, 4.8vw, 3rem)` · h3 2rem · h4 1.5rem · párrafo .875rem (14 px) |
| Radios | botones 14 px · cards 8 px · inputs 4 px |
| Sombras | botón `0 12px 32px rgba(107,63,48,.16)` · card hover `0 14px 34px rgba(52,70,59,.10)` |
| Layout | breakpoints 750 / 990 / 1200 / 1400 px · hero `min(100% - 40px, 1320px)` · touch target 44 px |

### Componentes clave
- **Announcement bar:** fondo blanco, borde inferior 1 px, Inter 500 14 px, centrada, con emoji.
- **Hero:** foto 2400×800, alto `min(82svh, 800px)`, overlay crema degradado; kicker en MAYÚSCULAS con tracking .18em; H1 Playfair `clamp(2.4rem, 5vw, 4.6rem)`, color `#34463B`; CTAs apilados al 100 % en móvil.
- **Botón primario del hero:** fondo `#F6D7CD`, texto `#3B2925`, MAYÚSCULAS, tracking .08em, padding 16×24. El secundario es translúcido con `backdrop-filter: blur(10px)`.
- **Product card:** imagen ratio 4/5, radio 8 px, fondo `rgba(52,70,59,.06)`, sin borde; grid 4 col desktop / 2 móvil; título 12 px, precio 14 px; quick-add oculto en móvil.
- **Footer:** fondo `#FAF8F5`, 3 columnas, marca Playfair 24 px.

### `:root` adaptado y listo para pegar

```css
:root{
  /* Color */
  --color-bg: #FFFFFF;
  --color-bg-soft: #FAF8F5;
  --color-bg-sage: #EEF1EA;
  --color-text: #2B2B2B;
  --color-text-muted: #61756A;
  --color-heading: #34463B;
  --color-accent: #F6D7CD;
  --color-accent-hover: #F9E2DA;
  --color-accent-text: #3B2925;
  --color-border: #DFDFDF;
  --color-error: #8B0000;
  --color-success: #006400;
  --color-dark: #333333;

  /* Tipografía */
  --font-heading: "Playfair Display", serif;
  --font-body: "Poppins", sans-serif;
  --font-ui: "Inter", sans-serif;
  --fs-body: 1rem;
  --fs-sm: .875rem;
  --fs-xs: .75rem;
  --fs-h4: 1.5rem;
  --fs-h3: 2rem;
  --fs-h2: clamp(2.25rem, 4.8vw, 3rem);
  --fs-h1: clamp(2.4rem, 5vw, 4.6rem);
  --lh-heading: 1.1;
  --lh-body: 1.6;
  --ls-kicker: .18em;
  --ls-button: .08em;

  /* Spacing */
  --space-xs: .5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 5rem;
  --container: min(100% - 40px, 1320px);

  /* Radios y sombras */
  --radius-card: 8px;
  --radius-btn: 14px;
  --radius-input: 4px;
  --shadow-btn: 0 12px 32px rgba(107,63,48,.16);
  --shadow-card-hover: 0 14px 34px rgba(52,70,59,.10);
  --shadow-popover: 0 4px 20px rgba(0,0,0,.15);

  /* Motion y layout */
  --ease: .125s ease-in-out;
  --bp-mobile: 750px;
  --touch-min: 44px;
  --card-ratio: 4 / 5;
  --grid-cols: 4;
  --grid-cols-mobile: 2;
}
```

### Qué mejorar del diseño
- Unificar los ~10 colores hardcodeados en variables (hay dos "primarios": negro del tema y rosa del hero).
- Título de card de 12 px es chico: subir a 15–16 px; párrafo base a 16 px; interlineado del H1 a 1.1.
- El texto secundario del hero al 68 % de opacidad puede bajar de contraste 4.5:1 sobre la foto: reforzar el overlay.
- Los bordes `rgb(0 0 0 / .06)` son casi invisibles; no usarlos en inputs.
- Fijar un solo sistema de radios (8 px cards, 12–14 px botones).

---

## 5. Verificaciones importantes (corrección)

Algunos agentes dedujeron que la fecha de entrega era obligatoria. **Al revisar el HTML, no es así:**

| Ajuste de la app Delivery Date | Valor real |
|---|---|
| `isEnableDeliveryDatePicker` | `false` |
| `isEnablePickupDatePicker` / `isEnableShippingDatePicker` | `false` |
| `isRequiredBeforeCheckout` | `false` |
| `countdown.isEnabled` | `false` |
| `isDisableAddToCartButton` | `true` |

- Los textos existen ("Please choose a delivery date and time", "⏳ Order within {time} to get it by {date}"), pero **la función está apagada**. En la ficha se ve el texto de relleno del widget.
- Resultado: la web promete "same-day" pero **no muestra hora límite ni calendario**.
- **JSON-LD** del home: solo `Organization` (nombre, logo, url). Falta `Florist`/`LocalBusiness` con dirección, horario y zona de servicio.
- Sí tiene `meta description` (hay 1 en el HTML).

---

## 6. Qué copiar

1. **Hero que responde en 5 segundos:** kicker de zona + H1 con ciudad + promesa de entrega + 2 CTA.
2. **Barra superior con beneficio y código** (mejor aún: descuento automático, sin tipear código).
3. **Navegación por ocasión**, con tarjetas que traen etiqueta ("Same-day") y un verbo en el CTA.
4. **Bloque de 3 pasos** (Elegí → Datos de entrega → Entregamos).
5. **Cobertura por barrio/zona** con una página por cada una (SEO local fuerte).
6. **Precio visible en la grilla** + **quick-add**.
7. **Fotos verticales 4/5** (ideales para ramos) con hover discreto.
8. **Add-to-cart sticky** y **extra a bajo costo** (jarrón $20).
9. **Teléfono y email visibles** + políticas de entrega y sustituciones.
10. **Colecciones por formato** (ramo / jarrón / caja) además de por ocasión.
11. **Pagos rápidos** en el checkout.

## 7. Qué NO copiar

1. **Catálogo completo en el home** (36–37 tarjetas, 1 MB de HTML): parálisis de elección y lentitud.
2. **Ocasiones debajo del catálogo** — deberían ir antes.
3. **Cero reseñas, estrellas o testimonios.**
4. **Sin WhatsApp / click-to-chat.**
5. **Sin hora límite** ("pedí antes de las X") aunque prometan same-day.
6. **Bloque "Special preparation instructions" suelto** en el home.
7. **Hero que dice "throughout the Bay Area" y más abajo "by request"** (contradicción), tarifas "calculadas en checkout".
8. **Condolencias sin guía:** no hay texto sobre entrega a funeraria, mensaje de tarjeta sugerido ni plazos.
9. **Copy genérico de IA** ("made simple", "handled with care") y nombres de producto abstractos ("Belle Amour", "Ivory Daydream").
10. **Menú duplicado** en el HTML, carrito vacío con el mensaje repetido, slug en cirílico.
11. **Login "para pagar más rápido"** en un regalo de compra única.
12. **Feed de Instagram con 0–15 likes** como prueba social (contraproducente).
13. **Dependencia de apps de terceros** para algo tan básico como fecha y mensaje.

---

## 8. Fricciones por tipo de comprador

| Persona | Qué busca | Dónde abandona |
|---|---|---|
| **Marina**, cumpleaños mañana, desde iPhone | "¿Llega mañana? ¿Hasta qué hora pido?" | En la ficha: no hay fecha, ni hora límite, ni chequeo de zona |
| **Daniel**, condolencias, poco tiempo | "¿Sirve para un funeral? ¿Qué escribo en la tarjeta?" | En la colección: sin guía, sin tono humano, sin política de sustituciones visible |
| **Priya**, envía a su madre en San Mateo | "¿Cuánto cuesta el envío? ¿Puedo pagar online?" | Al ver "by request" y la lista de condados sin precios |

Top fricciones (priorizadas): 1) sin selector de fecha, 2) sin hora límite, 3) sin reseñas, 4) tarifas por zona ocultas, 5) condolencias sin guía, 6) sin campo de mensaje de tarjeta en la ficha, 7) sin verificador de ZIP, 8) política de sustituciones solo en el footer.

---

## 9. Oportunidades que la web desaprovecha (para ganarle)

- **Reseñas reales** arriba (Google/Instagram).
- **Cut-off con cuenta regresiva:** "Quedan 2 h 15 min para recibir hoy".
- **Garantía de frescura** ("si no llegan frescas, las reponemos o te devolvemos el dinero").
- **Foto del arreglo antes de salir** (por WhatsApp).
- **Captura de fechas especiales** (recordar el cumpleaños del año siguiente).
- **Upsells:** chocolates, vase, tarjeta; suscripción de flores; bundles.
- **Ancla de precios de 3 niveles** (básico / recomendado / premium, con el del medio destacado).
- **Tarifas por zona** en una tabla + verificador de código postal.
- **Página de condolencias** con guía de redacción y botón de llamada directa.
- **Schema `Florist`** con horario, zona de servicio y reseñas.

---

## 10. Wireframe recomendado para Angela Florista

```
[Barra]   Entrega hoy en [ciudad] si pedís antes de las [hh:mm] · envío gratis automático
[Header]  Logo | Ocasiones | Ramos | Arreglos | Nosotros | Contacto | [WhatsApp] [Carrito]
[HERO]    Kicker: [Ciudad / zona]
          H1: Flores frescas, entregadas hoy en [ciudad]
          Sub: Diseñadas a mano por Angela. Fotos reales, precio final claro.
          [Elegir por ocasión]  [Ver ramos]   | Chip: "Pedí hasta las hh:mm"
          Franja de confianza: ★ 4,9 (reseñas) · Entrega en 3 h · Frescura garantizada
[OCASIONES]   "¿Para qué ocasión?" — 6 tarjetas: Cumpleaños, Amor, Condolencias,
              Gracias, Felicitaciones, Sin motivo (tag + CTA con verbo)
[MÁS PEDIDOS] 8 productos: foto 4/5, nombre, precio, "Agregar" · "Ver todos"
[CÓMO FUNCIONA] 3 pasos con iconos: Elegí · Contanos fecha/dirección/mensaje · Entregamos
[COBERTURA]   Buscador de zona/código postal + barrios con costo y horario
[PRUEBA SOCIAL] 3 reseñas con foto + enlace a Google/Instagram
[SOBRE ANGELA] Foto de la florista + 2 líneas de historia + CTA "Hablemos"
[URGENCIAS]   Botón grande WhatsApp + teléfono + horario + mapa
[FOOTER]      Políticas (entrega y sustituciones), redes, dirección
[Móvil]       Botón fijo inferior: WhatsApp + Comprar
```

Notas de implementación: mobile-first desde 320 px, contenedores 640/768/1024/1280, tokens en `:root`, contraste AA en los CTA, `Florist` en JSON-LD, meta description y una landing por zona.

### Cinco copys de ejemplo
1. **Barra:** "Envío gratis en tu zona, aplicado automáticamente. Pedí hasta las 2 pm y llega hoy."
2. **Hero:** "Flores frescas que llegan hoy. Elegí, escribí tu mensaje y nosotras nos ocupamos del resto."
3. **Garantía:** "Si tus flores no llegan frescas, las reponemos o te devolvemos tu dinero. Sin vueltas."
4. **Cut-off:** "Quedan 2 h 15 min para pedir y recibir hoy. Elegí tu horario de entrega."
5. **Post-compra (WhatsApp):** "Ya estamos armando tu ramo. Te mandamos una foto antes de salir. ¿Querés agendar el cumpleaños de [nombre] para el año que viene?"

---

## 11. Cómo llevarlo a tu proyecto (HTML + CSS + JS)

| En Shopify/Horizon | En tu landing |
|---|---|
| Secciones `hero`, `home_occasions`, `home_seo_neighborhoods`, `home_why_choose` | Un `<section>` por bloque en `index.html` |
| `base.css` + `compiled_assets/styles.css` | `css/styles.css` con el `:root` de la sección 4 |
| Web components (`product-card`, `cart-drawer-component`…) | `js/main.js` (carrito simple en `localStorage`, menú móvil, quick-add) |
| App Delivery Date | Selector de fecha + hora propio, o mensaje directo por WhatsApp |
| Shop Pay / checkout | Mercado Pago / link de pago / WhatsApp |
| Shopify Chat | Botón flotante de WhatsApp |
| Sidekick `ai_gen_block` | Texto escrito por vos (evitar copy genérico) |

---

## 12. Límites de este análisis
- No se navegó el carrito ni el checkout; lo que se dice de ellos sale de la configuración de las apps.
- Las imágenes no se inspeccionaron (calidad de fotos reales, ni equipo ni taller).
- Los recorridos por persona son una simulación cualitativa, no datos de usuarios reales.
- Los agentes de Plexi están escritos en inglés, y sus informes sueltos están en la carpeta temporal de la sesión.
