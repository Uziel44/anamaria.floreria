# Cómo agregar una pasarela de pagos (PSP) a la web de Ana María Florería — Miami

> Guía para pasar de "pedir por WhatsApp" a "pagar con tarjeta en la web".
> Pensada para este proyecto: `index.html` + `css/styles.css` + `js/main.js`, sin backend.
> Fecha de la investigación: 2026-10-23. Las tarifas e impuestos cambian: antes de decidir, confirma cada cifra en la página oficial (enlaces al final).
> No soy asesor fiscal ni legal. Los puntos de impuestos y constitución de empresa los debe validar un contador de Florida.

---

## 1. Recomendación en 30 segundos

| Etapa | Qué hacer | Esfuerzo |
|---|---|---|
| **Ahora (semana 1–2)** | **Stripe Payment Links** (un enlace de pago por arreglo) en un botón "Pagar" junto al "Pedir". Sin servidor, sin código nuevo de pagos. | Bajo |
| **Cuando haya volumen** | **Stripe Checkout con una función serverless** (carrito, tarifa de entrega por código postal, impuestos automáticos, fecha de entrega guardada en el pedido). | Medio |
| **Siempre** | Mantener WhatsApp para consultas, arreglos a medida y urgencias. | — |

**Por qué Stripe:** la comisión estándar en EE. UU. es la más baja de las opciones comparables, los pagos con Apple Pay, Google Pay y Link ya vienen incluidos, el checkout puede mostrarse en español, y sirve tanto para un enlace sin código como para una integración a medida.

**Alternativa válida:** Square, si más adelante quieres también cobrar en persona con un lector de tarjetas en el local.

---

## 2. Qué necesitas como negocio en Miami (antes de abrir la cuenta)

Cada PSP te va a pedir estos datos (verificación KYC). Si algo falta, la cuenta queda limitada o retenida.

- [ ] **Entidad legal** registrada en Florida (por ejemplo una LLC en Sunbiz) o como sole proprietor.
- [ ] **EIN** (número de identificación fiscal del IRS). Un sole proprietor puede usar su SSN, pero conviene EIN.
- [ ] **Cuenta bancaria de EE. UU.** a nombre del negocio, donde se depositan los pagos.
- [ ] **Registro de impuesto de ventas de Florida** ante el Department of Revenue (las ventas de flores están gravadas, ver sección 5).
- [ ] **Licencia local** (Business Tax Receipt de Miami-Dade o de tu ciudad). Confirma el trámite con el municipio.
- [ ] **Dirección comercial, teléfono, sitio web y descriptor de tarjeta** (el nombre que aparece en el resumen del cliente, por ejemplo `ANA MARIA FLORERIA`).
- [ ] **Páginas de políticas publicadas en la web** (ver sección 7). Stripe y las marcas de tarjeta las exigen para aprobar la cuenta.

> **Pregunta clave:** ¿la dueña o la empresa residen en EE. UU.? Si no, hay que crear primero una entidad y una cuenta bancaria estadounidenses (por ejemplo con un servicio como Stripe Atlas). Eso cambia los plazos, no la arquitectura técnica.

---

## 3. Comparación de opciones

Para un pedido de **US$100**. Las tarifas salen de comparativas de terceros de 2025–2026 y **no coinciden del todo entre sí**; verifícalas en las páginas oficiales.

| Opción | Comisión online (EE. UU.) | Costo en US$100 | Cuándo conviene |
|---|---|---|---|
| **Stripe** (Payment Links / Checkout) | 2,9 % + 30 ¢ (tarjetas de EE. UU.) | ≈ US$3,20 | Web propia, mejor relación costo / flexibilidad |
| **Square** (Online Checkout / Payment Links) | 3,3 % + 30 ¢ según una fuente; otras dicen 2,9 % + 30 ¢ | ≈ US$3,60 | Si también cobras con lector en el local |
| **PayPal Checkout** | 3,49 % + 49 ¢ | ≈ US$3,98 | Como método extra para quien ya tiene cuenta PayPal |
| **Shopify Payments** | Depende del plan de Shopify | — | Solo si migras toda la tienda a Shopify (es lo que usa la web de referencia) |
| **Zelle / Venmo / efectivo** | Sin comisión de PSP | — | **No es una pasarela**: no hay confirmación automática; úsalo solo manual por WhatsApp |

Extras de Stripe a tener en cuenta (según comparativas de terceros): las tarjetas emitidas fuera de EE. UU. suman un cargo adicional (alrededor de 1,5 %) y la conversión de moneda otro (alrededor de 1 %). Relevante si tus clientes envían flores desde otros países.

---

## 4. Opción A (recomendada para empezar): Stripe Payment Links

Un **Payment Link** es una página de pago alojada por Stripe. No escribes código de pagos y no tocas datos de tarjeta, lo que te deja en el nivel de cumplimiento PCI más simple.

### 4.1 Pasos
1. Crea la cuenta en Stripe y completa la verificación del negocio (sección 2).
2. Trabaja primero en **modo de prueba** (test mode).
3. Crea un producto por arreglo en el Dashboard con su precio en **USD**.
4. Crea un Payment Link por producto y activa estas opciones:
   - **Recopilar dirección de envío** (solo `US`, o los países que atiendas).
   - **Requerir teléfono** (para coordinar la entrega).
   - **Campos personalizados** para lo que Stripe no tiene de forma nativa: *fecha de entrega*, *mensaje de la tarjeta*, *nombre de quien recibe*. Stripe permite un número limitado de campos (hoy son pocos; confirma el máximo en la documentación).
   - **Idioma español** si quieres que el checkout se vea en español.
   - **Impuesto**: una tasa fija de 7 % para entregas en Miami-Dade, o Stripe Tax (sección 5).
5. Copia cada enlace `https://buy.stripe.com/...`.
6. Prueba con la tarjeta de prueba `4242 4242 4242 4242` (cualquier fecha futura y CVC).
7. Pasa a modo real y reemplaza los enlaces de prueba por los reales.

### 4.2 Cambios en esta web

**`index.html`**: junto a cada botón "Pedir" agrega un botón "Pagar" con una clave del arreglo:

```html
<a class="btn btn--dark btn--sm" href="#" data-wa-product="Peonías rosadas">Pedir</a>
<a class="btn btn--primary btn--sm" href="#" data-pay="peonias-rosadas">Pagar</a>
```

Y muestra el precio en cada tarjeta (hoy la web no tiene precios; un PSP los necesita):

```html
<p class="card__price">US$ 85</p>
```

**`js/main.js`**: agrega un mapa clave → enlace dentro de la sección de configuración, y el código que los conecta (mismo estilo que el resto del archivo):

```js
// ---- Configuración ----
const PAYMENT_LINKS = {
  'peonias-rosadas': 'https://buy.stripe.com/REEMPLAZAR',
  // 'bouquet-romantico': 'https://buy.stripe.com/REEMPLAZAR',
};

// Pagar con tarjeta: cualquier enlace con data-pay="clave"
$$('[data-pay]').forEach((a) => {
  const url = PAYMENT_LINKS[a.dataset.pay];
  if (!url) { a.hidden = true; return; }   // sin enlace configurado, el botón no se muestra
  a.href = url;
  openInNewTab(a);
});
```

**`css/styles.css`**: un estilo para el precio, con las variables de marca que ya existen:

```css
.card__price { font: 500 1rem/1.3 var(--font-body); margin-top: 2px; }
```

### 4.3 Límites de esta opción
- **Un enlace = un producto.** No hay carrito con varios arreglos.
- **Sin selector de fecha real**: la fecha va en un campo de texto personalizado.
- **La tarifa de entrega es fija** o se configura como "opción de envío" fija; no se calcula por código postal.
- Para avisar de cada pedido necesitas mirar el Dashboard o activar los correos de Stripe.

Si eso te alcanza al inicio, no necesitas nada más.

---

## 5. Impuestos (Florida)

Puntos verificados en las fuentes consultadas (confirma con tu contador):

- **Las ventas de flores están gravadas.** La regla de Florida para florerías (Rule 12A-1.047) trata a las florerías como vendedoras minoristas de bienes tangibles.
- **Tasa en Miami-Dade: 7 %** = 6 % estatal + 1 % de recargo del condado. Varía según el **condado de entrega** (por ejemplo, no todos los condados tienen el mismo recargo), así que un 7 % fijo solo es correcto para entregas dentro de Miami-Dade.
- **El cargo de envío normalmente también se grava** cuando acompaña la venta de un artículo gravado. Puede quedar exento solo si se muestra por separado en la factura y el cliente puede evitarlo (por ejemplo, retirando en la tienda). Hay una interpretación del Departamento que lo vuelve gravable si se combina con otros cargos gravables en un solo monto.
- **Pedidos entre florerías** (red de entregas): quién cobra y paga el impuesto depende de dónde se origina el pedido. Si vas a recibir o enviar pedidos a otras florerías, consulta la regla antes.

**Qué hacer en la práctica:**
- **Al empezar (solo Miami-Dade):** tasa fija del 7 % configurada en el Payment Link.
- **Cuando entregues en varios condados:** activa **Stripe Tax**, que calcula la tasa según la dirección de entrega. Requiere tener cargada tu dirección de origen y tus registros de impuestos, y tiene un costo adicional; revisa la tarifa vigente.
- Presenta y paga la declaración de impuestos de ventas en la frecuencia que te asigne el Department of Revenue. Stripe **no** declara por ti.

---

## 6. Opción B (cuando crezcas): Stripe Checkout con función serverless

Aquí la web envía el carrito a **una función en el servidor** (Netlify, Vercel o Cloudflare), que crea una **Checkout Session** y redirige al cliente. Ganas: varios arreglos por pedido, entrega por código postal, impuestos automáticos y la fecha de entrega guardada dentro del pedido.

### 6.1 Arquitectura

```
Navegador (index.html + main.js)
   │  POST /api/checkout  { items:[{id,qty}], fecha, mensaje, zip }
   ▼
Función serverless (clave secreta de Stripe, precios en el servidor)
   │  stripe.checkout.sessions.create(...)  →  devuelve session.url
   ▼
Stripe Checkout (página alojada)  →  pago
   │
   ├── success_url  →  /gracias.html
   └── Webhook "checkout.session.completed"  →  tu función avisa (correo / WhatsApp)
```

**Regla de oro:** los **precios viven en el servidor**. Nunca aceptes un precio que venga del navegador.

### 6.2 Función de ejemplo (Netlify, Node.js)

`netlify/functions/checkout.js`

```js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Catálogo y precios en centavos de USD. Fuente de verdad: el servidor.
const CATALOGO = {
  'peonias-rosadas': { nombre: 'Peonías rosadas', centavos: 8500 },
  'bouquet-romantico': { nombre: 'Bouquet romántico', centavos: 9500 },
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Método no permitido' };

  const { items = [], fecha = '', mensaje = '' } = JSON.parse(event.body || '{}');
  const lineItems = items
    .filter((i) => CATALOGO[i.id] && i.qty > 0 && i.qty <= 20)
    .map((i) => ({
      quantity: i.qty,
      price_data: {
        currency: 'usd',
        unit_amount: CATALOGO[i.id].centavos,
        product_data: { name: CATALOGO[i.id].nombre },
      },
    }));
  if (!lineItems.length) return { statusCode: 400, body: 'Carrito vacío' };

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    locale: 'es-419',
    shipping_address_collection: { allowed_countries: ['US'] },
    phone_number_collection: { enabled: true },
    // automatic_tax: { enabled: true },       // requiere Stripe Tax configurado
    metadata: { fecha_entrega: fecha.slice(0, 40), mensaje_tarjeta: mensaje.slice(0, 400) },
    success_url: `${process.env.SITE_URL}/gracias.html?s={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/#arreglos`,
  });

  return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
};
```

### 6.3 Webhook (confirmar pagos de verdad)

La página `/gracias.html` **no** prueba que se pagó (cualquiera puede abrirla). La confirmación real es el webhook:

```js
// netlify/functions/stripe-webhook.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  let evt;
  try {
    evt = stripe.webhooks.constructEvent(
      event.body,                                   // cuerpo SIN modificar
      event.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return { statusCode: 400, body: 'Firma inválida' };
  }

  if (evt.type === 'checkout.session.completed') {
    const s = evt.data.object;
    // Aquí: enviar correo/WhatsApp con s.customer_details, s.shipping_details, s.metadata
  }
  return { statusCode: 200, body: 'ok' };
};
```

### 6.4 Lado del navegador (`js/main.js`)

```js
async function pagar(items, fecha, mensaje) {
  const res = await fetch('/.netlify/functions/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, fecha, mensaje }),
  });
  const { url } = await res.json();
  if (url) window.location.href = url;
}
```

### 6.5 Variables de entorno (en el panel del hosting, **nunca** en el código)

| Variable | Valor |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` primero, luego `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` del endpoint de webhook |
| `SITE_URL` | URL pública de la web (con https) |

> La web hoy se puede alojar de forma gratuita (Netlify, Vercel o Cloudflare Pages). La opción A funciona en cualquier hosting estático; la B necesita uno que ejecute funciones.

---

## 7. Cumplimiento y seguridad

- **HTTPS obligatorio** (los hostings anteriores lo traen).
- **No pidas ni guardes datos de tarjeta en tu formulario.** Con Payment Links o Checkout alojado, la tarjeta se escribe en la página de Stripe.
- **La clave secreta (`sk_...`) jamás va en `index.html` ni en `main.js`.** Solo en el servidor. La clave publicable (`pk_...`) es la única que puede estar en el navegador.
- **Firma del webhook:** verifícala siempre (ejemplo de la sección 6.3).
- **Páginas legales publicadas** (las piden Stripe y las marcas de tarjeta): política de **entregas y sustituciones**, política de **reembolsos / cancelaciones**, **términos del servicio**, **privacidad**, datos de contacto reales y descriptor de tarjeta reconocible.
- **3D Secure / SCA:** Stripe lo activa automáticamente cuando hace falta.
- **Radar** (antifraude de Stripe) viene activo; revisa las reglas para pedidos de alto monto.

---

## 8. Cosas propias de una florería

- **Fecha y hora de entrega:** Stripe no trae selector de fecha. En la opción A usa un campo personalizado; en la B, un `<input type="date">` en tu web que se guarda en `metadata`.
- **Hora límite del mismo día:** valida en tu función que el pedido llegue antes del corte (por ejemplo, 2 p. m.).
- **Entrega por zona:** define una tabla de tarifas por código postal de Miami-Dade (y fuera, si atiendes). En la opción A, usa tarifas fijas de envío; en la B, calcula por ZIP.
- **Cobrar al entregar (autorización manual):** Stripe permite autorizar la tarjeta y capturar el cobro después (`payment_intent_data.capture_method = 'manual'`), por un plazo limitado (en tarjetas suele ser de unos 7 días). Útil si la disponibilidad de flores puede cambiar.
- **Fechas pico (San Valentín, Día de la Madre, etc.):** abre los pedidos con anticipación, publica la hora límite y verifica que tu cuenta no tenga límites de pago bajos antes de la temporada.
- **Contracargos (disputas):** en flores son frecuentes ("no llegó", "no es lo que pedí"). Guarda: foto del arreglo antes de salir, nombre y firma de quien recibió, hora y dirección de entrega.
- **Sustituciones:** la política debe decir claramente que las flores pueden variar según la temporada, con el mismo valor y estilo.
- **Plazo de acreditación:** en cuentas nuevas el primer pago suele tardar más en liberarse y puede haber retenciones. No dependas del primer cobro para pagar proveedores.
- **Español:** `locale: 'es-419'` en la función o la opción de idioma en el Payment Link.

---

## 9. Qué le falta hoy a la web para cobrar

La web actual es de catálogo + WhatsApp. Antes de activar pagos:

- [ ] **Precios en USD** en cada tarjeta de arreglo.
- [ ] **Páginas legales**: entregas y sustituciones, reembolsos, términos, privacidad.
- [ ] **Datos reales de contacto**: teléfono, correo y dirección (hoy el WhatsApp y el Instagram de `js/main.js` son datos de ejemplo).
- [ ] **Zonas de entrega y tarifas** publicadas.
- [ ] **Página `gracias.html`** con el mensaje de confirmación.
- [ ] **Fotos propias** de los arreglos (las actuales son de ejemplo, ver `img/flores/CREDITOS.md`).

---

## 10. Plan paso a paso

**Fase 1 — Preparación (1–2 semanas, la mayor parte es trámite)**
1. Definir entidad, EIN y cuenta bancaria de EE. UU. (sección 2).
2. Registrarse para el impuesto de ventas de Florida.
3. Redactar y publicar las políticas.

**Fase 2 — Cobrar con Payment Links (1–2 días de trabajo)**
4. Crear la cuenta de Stripe y probar en modo de prueba.
5. Crear productos y Payment Links; agregar precios y botones "Pagar" (sección 4.2).
6. Probar el flujo completo con la tarjeta `4242 4242 4242 4242`; verificar que llega el correo de recibo y que el pago aparece en el Dashboard.
7. Pasar a modo real; hacer **una compra real pequeña** y reembolsarla.

**Fase 3 — Escalar (cuando lo necesites)**
8. Cambiar a Checkout con función serverless (sección 6), con carrito y entrega por ZIP.
9. Activar Stripe Tax si entregas en varios condados.
10. Agregar el webhook para avisar por correo o WhatsApp de cada pedido.

### Lista de verificación antes de salir en vivo
- [ ] Todos los enlaces de pago son de **modo real**, no de prueba.
- [ ] Ninguna clave secreta aparece en el código ni en el repositorio.
- [ ] Probado en celular (Apple Pay / Google Pay).
- [ ] El descriptor de tarjeta es reconocible.
- [ ] Las políticas están enlazadas desde el footer y el checkout.
- [ ] Hay una persona asignada a revisar pedidos y disputas.
- [ ] Un contador revisó la configuración de impuestos.

---

## 11. Preguntas abiertas (necesito saberlas para afinar esto)

1. ¿La empresa y la dueña residen en EE. UU., o hay que crear la entidad y la cuenta bancaria?
2. ¿Cuántos pedidos al mes se esperan? (decide entre A y B)
3. ¿Se entrega solo en Miami-Dade o también en Broward y Palm Beach?
4. ¿Se recibirán pedidos de otras florerías (red de entregas)?
5. ¿Hay tienda física donde se quiera cobrar con lector de tarjetas? (inclina hacia Square)

---

## Fuentes

Consultadas el 2026-10-23. Las comparativas de terceros pueden estar desactualizadas: verifica siempre en la página oficial del PSP.

- Comisiones de Stripe (comparativas de terceros): [NerdWallet](https://www.nerdwallet.com/business/software/learn/stripe-fees), [Dodo Payments](https://dodopayments.com/blogs/stripe-fees-calculator)
- Stripe, Payment Links: [personalización del checkout](https://docs.stripe.com/payment-links/customize), [recopilar direcciones](https://docs.stripe.com/payments/no-code/collect-addresses), [campos personalizados](https://docs.stripe.com/payments/checkout/custom-fields)
- Comparativa de tarifas (Stripe, Square, PayPal): [Dodo Payments](https://dodopayments.com/blogs/payment-processing-fees-compared), [Tipalti](https://tipalti.com/resources/learn/square-vs-paypal/)
- Impuesto de ventas de Miami-Dade (7 %): [Avalara](https://www.avalara.com/us/en/taxrates/state-rates/florida/counties/miami-dade.html), [Kintsugi](https://trykintsugi.com/sales-tax-guides/usa/florida/miami-dade-county), [Stripe](https://stripe.com/resources/more/florida-sales-tax-rate)
- Florida, florerías y cargos de envío: [Rule 12A-1.047, Florists](https://www.law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-12A-1-047), [FAQ del Florida Department of Revenue sobre cargos de entrega](https://floridarevenue.com/faq/Pages/FAQDetails.aspx?FAQID=1277)
