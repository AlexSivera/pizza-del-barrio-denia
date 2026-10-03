// Genera dist/ a partir de src/: carta, horario, JSON-LD y gráficos estáticos salen de src/data/menu.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PIZZAS, GROUPS, DRINKS, HOURS, CONTACT, LOCAL_ONLY } from '../src/data/menu.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (...p) => path.join(root, 'src', ...p);
const out = (...p) => path.join(root, 'dist', ...p);

const SITE_URL = (process.env.SITE_URL || 'https://alexsivera.github.io/pizza-del-barrio-denia').replace(/\/$/, '');

const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (n) => Math.round(n * 10) / 10;
const groupOf = (p) => GROUPS.find((g) => g.bases.includes(p.base));

// <img> con srcset de las fotos preparadas por scripts/images.mjs
function photo(name, widths, sizes, alt, { cls = '', eager = false } = {}) {
  const set = widths.map((w) => `img/pz-${name}-${w}.webp ${w}w`).join(', ');
  const big = widths[widths.length - 1];
  return `<img${cls ? ` class="${cls}"` : ''} src="img/pz-${name}-${widths[0]}.webp" srcset="${set}" sizes="${sizes}" width="${big}" height="${big}" alt="${esc(alt)}"${eager ? '' : ' loading="lazy"'} decoding="async">`;
}

const tags = (p, extra = '') => [
  p.top ? '<span class="tag tag--top">Lo más pedido en Glovo</span>' : '',
  p.veg ? '<span class="tag tag--veg">Vegetariana</span>' : '',
  p.mentions ? `<span class="tag tag--rev">Sale en ${p.mentions} reseñas</span>` : '',
  extra,
].join('');

// --- La estrella
function starHtml() {
  const p = PIZZAS.find((x) => x.level === 'star');
  return `      <article class="star" aria-labelledby="star-t">
        <div class="star__photo">
          ${photo(p.photo, [600, 1000], '(max-width: 900px) 92vw, 640px', `Pizza ${p.name} vista desde arriba`)}
          <p class="marker star__note">pistacho de Bronte 💚</p>
        </div>
        <div class="star__body">
          <p class="star__k">La de la casa</p>
          <h3 class="star__name" id="star-t">${esc(p.name)}</h3>
          <p class="star__tags">${tags(p)}</p>
          <p class="star__ing">${esc(p.ingredients)}.</p>
          <p class="star__note-t">${esc(p.note)}</p>
          <p class="star__price">${eur(p.price)}</p>
          <a class="btn btn--tomate" href="tel:+34611776551">Encargar · 611 77 65 51</a>
        </div>
      </article>`;
}

// --- Las que más salen
function topHtml() {
  return PIZZAS.filter((x) => x.level === 'feature').map((p) => `          <li class="top-card">
            <div class="top-card__photo">${photo(p.photo, [480, 900], '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 400px', `Pizza ${p.name}`)}</div>
            <div class="top-card__body">
              <h4 class="top-card__name">${esc(p.name)} <span class="top-card__price">${eur(p.price)}</span></h4>
              <p class="top-card__tags">${tags(p)}</p>
              <p class="top-card__ing">${esc(p.ingredients)}</p>
              ${p.note ? `<p class="marker top-card__note">${esc(p.note)}</p>` : ''}
            </div>
          </li>`).join('\n');
}

// --- Solo en el local: la Trufa
function localHtml() {
  const p = LOCAL_ONLY;
  return `      <article class="cartel" aria-labelledby="trufa-t">
        <div class="cartel__photo">${photo(p.photo, [480, 900], '(max-width: 900px) 92vw, 560px', 'Pizza trufa con jamón serrano y stracciatella, en el local')}</div>
        <div class="cartel__body">
          <p class="cartel__k">Fuera de Glovo</p>
          <h3 class="cartel__name" id="trufa-t">Pizza ${esc(p.name)}</h3>
          <p class="cartel__ing">${esc(p.ingredients)}.</p>
          <p class="cartel__rev">La nombran ${p.mentions} reseñas de Google.</p>
          <p class="marker cartel__note">${esc(p.note)}</p>
        </div>
      </article>`;
}

// --- Toda la carta, por bases
function listHtml() {
  return GROUPS.map((g) => {
    const items = PIZZAS.filter((p) => g.bases.includes(p.base));
    const rows = items.map((p) => `            <li class="row" data-group="${g.id}"${p.veg ? ' data-veg' : ''}>
              <span class="row__thumb">${p.photo ? photo(p.photo, [480], '64px', '', { cls: 'row__img' }) : '<span class="row__dot" aria-hidden="true"></span>'}</span>
              <span class="row__main"><span class="row__name">${esc(p.name)}</span>${p.top ? '<span class="tag tag--top">Top</span>' : ''}${p.veg ? '<span class="tag tag--veg">Veg.</span>' : ''}<span class="row__ing">${esc(p.ingredients)}</span></span>
              <span class="row__price">${eur(p.price)}</span>
            </li>`).join('\n');
    return `        <section class="group group--${g.id}" data-group="${g.id}" aria-labelledby="g-${g.id}">
          <h4 class="group__t" id="g-${g.id}"><span class="dot" aria-hidden="true"></span>${g.name} <span class="group__n">${g.note} · ${items.length}</span></h4>
          <ul class="rows">
${rows}
          </ul>
        </section>`;
  }).join('\n');
}

function drinksHtml() {
  return DRINKS.map((d) => `              <li><span>${esc(d.name)}</span><span>${eur(d.price)}</span></li>`).join('\n');
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
function weekHtml() {
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = HOURS[d];
    return `            <li data-day="${d}"><span>${DAYS[d]}</span><span>${h ? `${h[0]}–${h[1]}` : 'Cerrado'}</span></li>`;
  }).join('\n');
}

// --- Esquema del cruce: Passeig del Saladar (bulevar con mediana) × Carrer Carlos Sentí.
function mapSvg() {
  const W = 600, H = 440;
  const ang = (-28 * Math.PI) / 180;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const nx = -dy, ny = dx;
  const C = [300, 240];
  const line = (off, len = 520) => [
    [C[0] - dx * len + nx * off, C[1] - dy * len + ny * off],
    [C[0] + dx * len + nx * off, C[1] + dy * len + ny * off],
  ];
  const L = (p) => `M${r1(p[0][0])},${r1(p[0][1])}L${r1(p[1][0])},${r1(p[1][1])}`;
  const ang2 = (68 * Math.PI) / 180;
  const ex = Math.cos(ang2), ey = Math.sin(ang2);
  const cs = [[C[0] - ex * 400, C[1] - ey * 400], [C[0] + ex * 400, C[1] + ey * 400]];
  let trees = '';
  for (let t = -560; t <= 560; t += 26) {
    const x = C[0] + dx * t, y = C[1] + dy * t;
    if (Math.hypot(x - C[0], y - C[1]) < 40) continue;
    trees += `<circle cx="${r1(x)}" cy="${r1(y)}" r="5"/>`;
  }
  const pin = [C[0] - 74, C[1] - 76];
  const bike = [C[0] + 40, C[1] - 150];
  return `<svg class="map__svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="map-t map-d">
          <title id="map-t">Esquema de situación</title>
          <desc id="map-d">Pizza del Barrio está en el Passeig del Saladar, 67, junto al cruce con el Carrer Carlos Sentí, en el lado norte del bulevar. En el mismo cruce hay un aparcabicis.</desc>
          <g class="map__roads">
            <path d="${L(line(-34))}" class="road road--wide"/>
            <path d="${L(line(34))}" class="road road--wide"/>
            <path d="${L(cs)}" class="road"/>
          </g>
          <g class="map__trees">${trees}</g>
          <g class="map__labels">
            <text transform="translate(${r1(C[0] + dx * 240 + nx * -34)},${r1(C[1] + dy * 240 + ny * -34 + 4)}) rotate(-28)" text-anchor="middle">Passeig del Saladar</text>
            <text transform="translate(${r1(C[0] - dx * 200 + nx * 34)},${r1(C[1] - dy * 200 + ny * 34 + 4)}) rotate(-28)" text-anchor="middle">Passeig del Saladar</text>
            <text transform="translate(${r1(C[0] - ex * 150 + 16)},${r1(C[1] - ey * 150)}) rotate(68)" text-anchor="middle">C/ Carlos Sentí</text>
            <text transform="translate(${r1(C[0] + ex * 150 + 16)},${r1(C[1] + ey * 150)}) rotate(68)" text-anchor="middle">C/ Carlos Sentí</text>
          </g>
          <g class="map__bike" transform="translate(${r1(bike[0])},${r1(bike[1])})"><circle r="13"/><text y="4.5" text-anchor="middle">P</text><text class="map__note" x="20" y="4">aparcabicis</text></g>
          <g class="map__pin" transform="translate(${r1(pin[0])},${r1(pin[1])})">
            <circle r="30" class="map__halo"/>
            <rect x="-17" y="-17" width="34" height="34" rx="3" class="map__box"/>
            <circle r="11" class="map__sauce"/>
            <text class="map__name" x="-40" y="-40" text-anchor="middle">Pizza del Barrio</text>
            <text class="map__note" x="-40" y="-22" text-anchor="middle">nº 67, local E</text>
          </g>
        </svg>`;
}

const CLOVER = `<svg viewBox="-50 -50 100 100" width="1em" height="1em"><g fill="currentColor">${[0, 90, 180, 270].map((a) => `<path transform="rotate(${a})" d="M0,-4C-4,-16 -26,-22 -26,-36C-26,-46 -14,-50 -7,-42C-4,-39 -1,-36 0,-33C1,-36 4,-39 7,-42C14,-50 26,-46 26,-36C26,-22 4,-16 0,-4Z"/>`).join('')}<path d="M0,0C4,14 10,30 22,44" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></g></svg>`;
const PHONE_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>`;
const WA_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3z"/></svg>`;
const IG_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.8a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17 6a1.1 1.1 0 1 0 0 2.2A1.1 1.1 0 0 0 17 6zM21.9 7.9c-.1-1.6-.4-3-1.6-4.2S17.7 2.2 16.1 2.1C14.5 2 9.5 2 7.9 2.1 6.3 2.2 4.9 2.5 3.7 3.7S2.2 6.3 2.1 7.9C2 9.5 2 14.5 2.1 16.1c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.6.1 6.6.1 8.2 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6.6 0-8.2zM19.8 18c-.3.9-1 1.5-1.9 1.9-1.3.5-4.4.4-5.9.4s-4.6.1-5.9-.4A3.3 3.3 0 0 1 4.2 18c-.5-1.3-.4-4.4-.4-5.9s-.1-4.6.4-5.9c.3-.9 1-1.5 1.9-1.9 1.3-.5 4.4-.4 5.9-.4s4.6-.1 5.9.4c.9.3 1.5 1 1.9 1.9.5 1.3.4 4.4.4 5.9s.1 4.6-.4 5.9z"/></svg>`;

// --- Datos estructurados
function jsonLd() {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const specs = {};
  for (const [d, h] of Object.entries(HOURS)) {
    if (!h) continue;
    const k = h.join('-');
    (specs[k] ||= { opens: h[0], closes: h[1], days: [] }).days.push(dayNames[d]);
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Pizza del Barrio',
    alternateName: 'Bocca di Forno',
    url: SITE_URL + '/',
    image: SITE_URL + '/img/hero-horno-1400.webp',
    description: 'Pizza napolitana para llevar en el Saladar (Dénia). Horno a 400–450 °C. Recogida, WhatsApp, Glovo y barra en el local.',
    servesCuisine: ['Pizza', 'Pizza napolitana', 'Italiana'],
    priceRange: '€',
    telephone: CONTACT.tel,
    sameAs: [CONTACT.instagram],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Passeig del Saladar, 67, local E',
      postalCode: CONTACT.postal,
      addressLocality: CONTACT.city,
      addressRegion: CONTACT.region,
      addressCountry: 'ES',
    },
    geo: { '@type': 'GeoCoordinates', latitude: CONTACT.lat, longitude: CONTACT.lng },
    hasMap: CONTACT.maps,
    openingHoursSpecification: Object.values(specs).map((s) => ({
      '@type': 'OpeningHoursSpecification', dayOfWeek: s.days, opens: s.opens, closes: s.closes,
    })),
    potentialAction: { '@type': 'OrderAction', target: CONTACT.glovo },
    hasMenu: {
      '@type': 'Menu',
      name: 'Carta de pizzas',
      hasMenuSection: GROUPS.map((g) => ({
        '@type': 'MenuSection',
        name: g.name,
        hasMenuItem: PIZZAS.filter((p) => g.bases.includes(p.base)).map((p) => ({
          '@type': 'MenuItem',
          name: `Pizza ${p.name}`,
          description: p.ingredients,
          ...(p.photo ? { image: `${SITE_URL}/img/pz-${p.photo}-${p.level === 'star' ? 1000 : 900}.webp` } : {}),
          ...(p.veg ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}),
          offers: { '@type': 'Offer', price: p.price.toFixed(2), priceCurrency: 'EUR' },
        })),
      })),
    },
  }).replace(/</g, '\\u003c');
}

// --- Montaje
const count = (fn) => PIZZAS.filter(fn).length;
const tokens = {
  JSONLD: jsonLd(),
  HOURS_JSON: JSON.stringify(HOURS),
  MENU_STAR: starHtml(),
  MENU_TOP: topHtml(),
  LOCAL_ONLY: localHtml(),
  MENU_LIST: listHtml(),
  DRINKS: drinksHtml(),
  WEEK: weekHtml(),
  MAP: mapSvg(),
  CLOVER,
  PHONE_ICON,
  WA_ICON,
  IG_ICON,
  SITE_URL,
  GLOVO: CONTACT.glovo,
  MAPS: CONTACT.maps,
  WHATSAPP: esc(CONTACT.whatsapp),
  INSTAGRAM: CONTACT.instagram,
  INSTAGRAM_HANDLE: CONTACT.instagramHandle,
  N_ROJA: count((p) => p.base === 'tomate'),
  N_BLANCA: count((p) => p.base === 'nata' || p.base === 'sin'),
  N_VERDE: count((p) => p.base === 'pesto'),
  N_VEG: count((p) => p.veg),
};

let html = fs.readFileSync(src('index.html'), 'utf8');
html = html.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
  if (!(k in tokens)) throw new Error('Token sin valor: ' + k);
  return String(tokens[k]);
});

const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) fs.copyFileSync(path.join(from, f), path.join(to, f));
};

// Vacía dist/ sin borrar la carpeta (en Windows puede estar abierta por otro proceso).
fs.mkdirSync(out(), { recursive: true });
for (const f of fs.readdirSync(out())) fs.rmSync(out(f), { recursive: true, force: true });
fs.writeFileSync(out('index.html'), html);
for (const f of ['styles.css', 'favicon.svg']) fs.copyFileSync(src(f), out(f));
for (const d of ['js', 'fonts', 'img', 'media']) copyDir(src(d), out(d));
fs.writeFileSync(out('robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
fs.writeFileSync(out('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE_URL}/</loc></url></urlset>\n`);
fs.writeFileSync(out('.nojekyll'), '');

const size = (d) => fs.readdirSync(out(d)).reduce((a, f) => a + fs.statSync(out(d, f)).size, 0);
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log(`dist/ listo · index.html ${kb(fs.statSync(out('index.html')).size)} · css ${kb(fs.statSync(out('styles.css')).size)} · js ${kb(size('js'))} · img ${kb(size('img'))} · media ${kb(size('media'))}`);
