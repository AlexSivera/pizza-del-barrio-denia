// Genera dist/ a partir de src/: carta, horario, JSON-LD y gráficos estáticos salen de src/data/menu.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PIZZAS, GROUPS, DRINKS, HOURS, CONTACT, SOURCE } from '../src/data/menu.mjs';
import { renderBoard, renderCrustEdge } from '../src/js/pizza.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (...p) => path.join(root, 'src', ...p);
const out = (...p) => path.join(root, 'dist', ...p);

const SITE_URL = (process.env.SITE_URL || 'https://alexsivera.github.io/pizza-del-barrio-denia').replace(/\/$/, '');

const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r1 = (n) => Math.round(n * 10) / 10;

const groupOf = (p) => GROUPS.find((g) => g.bases.includes(p.base));

// --- Carta
function menuHtml() {
  return GROUPS.map((g) => {
    const items = PIZZAS.filter((p) => g.bases.includes(p.base));
    const rows = items.map((p) => {
      const tags = [
        p.top ? '<span class="tag tag--top">Lo más pedido</span>' : '',
        p.veg ? '<span class="tag tag--veg">Vegetariana</span>' : '',
      ].join('');
      return `            <li><button type="button" class="row" data-id="${p.id}" data-group="${g.id}"${p.veg ? ' data-veg' : ''}>
              <span class="row__thumb" data-thumb aria-hidden="true"></span>
              <span class="row__main"><span class="row__name">${esc(p.name)}</span>${tags}<span class="row__ing">${esc(p.ingredients)}</span></span>
              <span class="row__price">${eur(p.price)}</span>
            </button></li>`;
    }).join('\n');
    return `          <section class="menu__group menu__group--${g.id}" data-group="${g.id}" aria-labelledby="g-${g.id}">
            <h3 class="menu__gt" id="g-${g.id}"><span class="dot" aria-hidden="true"></span>${g.name} <span class="menu__gn">${g.note} · ${items.length}</span></h3>
            <ul class="rows">
${rows}
            </ul>
          </section>`;
  }).join('\n');
}

function drinksHtml() {
  return DRINKS.map((d) => `                <li><span>${esc(d.name)}</span><span>${eur(d.price)}</span></li>`).join('\n');
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
function weekHtml() {
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = HOURS[d];
    return `            <li data-day="${d}"><span>${DAYS[d]}</span><span>${h ? `${h[0]}–${h[1]}` : 'Cerrado'}</span></li>`;
  }).join('\n');
}

// --- Juntas de ladrillo del arco del horno (centro 300,300; radios 170–240)
// Ladrillos del arco: dovelas en dos hiladas y pilares con aparejo alterno.
// Cada ladrillo tiene un tono distinto y los más cercanos a la boca reciben la luz del fuego.
function joints() {
  let s = '';
  const tones = ['#6A2D1A', '#74331E', '#5E2716', '#7C3A21', '#663019', '#70301B'];
  let k = 0;
  const tone = () => tones[(k++ * 7 + (k % 3)) % tones.length];
  const cx = 300, cy = 300;
  const courses = [[170, 205, 17], [205, 240, 21]];
  for (const [ra, rb, n] of courses) {
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI + (i / n) * Math.PI, a1 = Math.PI + ((i + 1) / n) * Math.PI;
      const P = (a, r) => `${r1(cx + Math.cos(a) * r)},${r1(cy + Math.sin(a) * r)}`;
      s += `<path d="M${P(a0, ra)}L${P(a0, rb)}A${rb},${rb} 0 0 1 ${P(a1, rb)}L${P(a1, ra)}A${ra},${ra} 0 0 0 ${P(a0, ra)}Z" fill="${tone()}"/>`;
    }
  }
  for (const [x0, x1] of [[60, 130], [470, 540]]) {
    let row = 0;
    for (let y = 300; y < 470; y += 28) {
      const h = Math.min(28, 470 - y);
      const cut = row % 2 ? x0 + (x1 - x0) / 3 : x0 + (2 * (x1 - x0)) / 3;
      s += `<rect x="${x0}" y="${y}" width="${r1(cut - x0)}" height="${h}" fill="${tone()}"/><rect x="${r1(cut)}" y="${y}" width="${r1(x1 - cut)}" height="${h}" fill="${tone()}"/>`;
      row++;
    }
  }
  return s;
}

// --- Esquema del cruce: Passeig del Saladar (bulevar con mediana) × Carrer Carlos Sentí.
function mapSvg() {
  const W = 600, H = 440;
  // Bulevar: dirección ~ -28°, pasa por el cruce (300,240)
  const ang = (-28 * Math.PI) / 180;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const nx = -dy, ny = dx; // normal
  const C = [300, 240];
  const line = (off, len = 520) => [
    [C[0] - dx * len + nx * off, C[1] - dy * len + ny * off],
    [C[0] + dx * len + nx * off, C[1] + dy * len + ny * off],
  ];
  const L = (p) => `M${r1(p[0][0])},${r1(p[0][1])}L${r1(p[1][0])},${r1(p[1][1])}`;
  // Carlos Sentí: casi vertical, inclinada
  const ang2 = (68 * Math.PI) / 180;
  const ex = Math.cos(ang2), ey = Math.sin(ang2);
  const cs = [[C[0] - ex * 400, C[1] - ey * 400], [C[0] + ex * 400, C[1] + ey * 400]];
  let trees = '';
  for (let t = -560; t <= 560; t += 26) {
    const x = C[0] + dx * t, y = C[1] + dy * t;
    if (Math.hypot(x - C[0], y - C[1]) < 40) continue;
    trees += `<circle cx="${r1(x)}" cy="${r1(y)}" r="5"/>`;
  }
  // Pizzería: esquina noroeste del cruce (al oeste de Carlos Sentí, al norte del bulevar)
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
            <circle r="17" class="map__crust"/><circle r="12" class="map__sauce"/>
            <circle cx="-4" cy="-3" r="3.4" fill="#FFF6E2"/><circle cx="5" cy="3" r="3" fill="#FFF6E2"/><circle cx="-2" cy="6" r="2.4" fill="#FFF6E2"/>
            <text class="map__name" x="-40" y="-40" text-anchor="middle">Pizza del Barrio</text>
            <text class="map__note" x="-40" y="-22" text-anchor="middle">nº 67, local E</text>
          </g>
        </svg>`;
}

const MARK = `<svg viewBox="-20 -20 40 40" width="40" height="40"><circle r="19" fill="#E9B977"/><circle r="14.5" fill="#B7301A"/><circle cx="-5" cy="-4" r="4.2" fill="#FFF6E2"/><circle cx="5" cy="3" r="3.8" fill="#FFF6E2"/><circle cx="-2" cy="7" r="3" fill="#FFF6E2"/><path d="M3,-9C6,-8 7,-5 5,-3C3,-4 2,-7 3,-9Z" fill="#3E8226"/><g fill="#2A150A"><circle cx="-15" cy="-9" r="1.6"/><circle cx="12" cy="-13" r="1.3"/><circle cx="17" cy="4" r="1.5"/><circle cx="-8" cy="16" r="1.4"/><circle cx="9" cy="15" r="1.1"/><circle cx="-17" cy="5" r="1.2"/></g></svg>`;

const CLOVER = `<svg viewBox="-50 -50 100 100" width="1em" height="1em"><g fill="currentColor">${[0, 90, 180, 270].map((a) => `<path transform="rotate(${a})" d="M0,-4C-4,-16 -26,-22 -26,-36C-26,-46 -14,-50 -7,-42C-4,-39 -1,-36 0,-33C1,-36 4,-39 7,-42C14,-50 26,-46 26,-36C26,-22 4,-16 0,-4Z"/>`).join('')}<path d="M0,0C4,14 10,30 22,44" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/></g></svg>`;

const PHONE_ICON = `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>`;

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
    description: 'Pizzería napolitana de barrio en el Saladar (Dénia). Para llevar, a domicilio con Glovo y comedor interior.',
    servesCuisine: ['Pizza', 'Pizza napolitana', 'Italiana'],
    priceRange: '€',
    telephone: CONTACT.tel,
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
          ...(p.veg ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}),
          offers: { '@type': 'Offer', price: p.price.toFixed(2), priceCurrency: 'EUR' },
        })),
      })),
    },
  }).replace(/</g, '\\u003c');
}

function menuJson() {
  return JSON.stringify({
    pizzas: PIZZAS.map((p) => ({ ...p, group: groupOf(p).id })),
    hours: HOURS,
    source: SOURCE,
  }).replace(/</g, '\\u003c');
}

// --- Montaje
const count = (fn) => PIZZAS.filter(fn).length;
const tokens = {
  JSONLD: jsonLd(),
  MENU_JSON: menuJson(),
  MENU: menuHtml(),
  DRINKS: drinksHtml(),
  WEEK: weekHtml(),
  JOINTS: joints(),
  MAP: mapSvg(),
  MARK,
  CLOVER,
  PHONE_ICON,
  BOARD: renderBoard(),
  SITE_URL,
  GLOVO: CONTACT.glovo,
  MAPS: CONTACT.maps,
  N_ROJA: count((p) => p.base === 'tomate'),
  N_BLANCA: count((p) => p.base === 'nata' || p.base === 'sin'),
  N_VERDE: count((p) => p.base === 'pesto'),
  N_VEG: count((p) => p.veg),
  EDGE_CARTA: renderCrustEdge('carta', '#E9B977'),
  EDGE_PEDIR: renderCrustEdge('pedir', '#B8301A', false),
  EDGE_BARRIO: '',
  EDGE_PIE: renderCrustEdge('pie', '#E9B977'),
};

let html = fs.readFileSync(src('index.html'), 'utf8');
html = html.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
  if (!(k in tokens)) throw new Error('Token sin valor: ' + k);
  return String(tokens[k]);
});

fs.rmSync(out(), { recursive: true, force: true });
fs.mkdirSync(out('js'), { recursive: true });
fs.mkdirSync(out('fonts'), { recursive: true });
fs.writeFileSync(out('index.html'), html);
for (const f of ['styles.css', 'favicon.svg']) fs.copyFileSync(src(f), out(f));
fs.writeFileSync(out('robots.txt'), `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);
fs.writeFileSync(out('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE_URL}/</loc></url></urlset>
`);
fs.writeFileSync(out('.nojekyll'), '');
for (const f of fs.readdirSync(src('js'))) fs.copyFileSync(src('js', f), out('js', f));
for (const f of fs.readdirSync(src('fonts'))) fs.copyFileSync(src('fonts', f), out('fonts', f));

const kb = (f) => (fs.statSync(out(f)).size / 1024).toFixed(1) + ' KB';
console.log('dist/ listo · index.html', kb('index.html'), '· styles.css', kb('styles.css'), '· pizza.js', kb('js/pizza.js'), '· main.js', kb('js/main.js'));
