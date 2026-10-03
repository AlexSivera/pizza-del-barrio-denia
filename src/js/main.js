import { renderPizza } from './pizza.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const data = JSON.parse($('#menu-data').textContent);
const byId = Object.fromEntries(data.pizzas.map((p) => [p.id, p]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => matchMedia('(min-width: 901px)').matches;
const eur = (n) => n.toFixed(2).replace('.', ',') + ' €';

/* ---------- Estado: abierto / cerrado, con la hora de Dénia */
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

function madridNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, min: Number(get('hour')) * 60 + Number(get('minute')) };
}

function nextOpening(day, min) {
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = data.hours[d];
    if (!h) continue;
    if (i === 0 && min >= toMin(h[0])) continue;
    return { inDays: i, day: d, at: h[0] };
  }
  return null;
}

function computeStatus() {
  const { day, min } = madridNow();
  const h = data.hours[day];
  if (h && min >= toMin(h[0]) && min < toMin(h[1])) {
    return { open: true, today: day, short: `Abierto · hasta las ${h[1]}`, oven: `Horno encendido hasta las ${h[1]}` };
  }
  const n = nextOpening(day, min);
  const when = n.inDays === 0 ? 'hoy' : n.inDays === 1 ? 'mañana' : `el ${DAYS[n.day]}`;
  const short = n.inDays === 0 ? `Abre hoy a las ${n.at}` : `Cerrado · abre ${when} a las ${n.at}`;
  let oven;
  if (n.inDays === 0) oven = `El horno se enciende hoy a las ${n.at}`;
  else if (!h) oven = `Los ${DAYS[day]} el horno descansa. Vuelve ${when}, desde las ${n.at}`;
  else oven = `Horno apagado. Vuelve ${when}, desde las ${n.at}`;
  return { open: false, today: day, short, oven };
}

// ?horno=on | ?horno=off fuerza el estado para revisar el diseño fuera de horario.
const forced = new URLSearchParams(location.search).get('horno');

function paintStatus() {
  const st = computeStatus();
  if (forced === 'on' || forced === 'off') {
    st.open = forced === 'on';
    if (st.open) { st.short = 'Abierto · hasta las 22:30'; st.oven = 'Horno encendido hasta las 22:30'; }
    else { st.short = 'Abre hoy a las 19:00'; st.oven = 'El horno se enciende hoy a las 19:00'; }
  }
  const el = $('[data-status]');
  el.classList.toggle('is-open', st.open);
  el.classList.toggle('is-closed', !st.open);
  $('[data-status-text]').textContent = st.short;
  $('[data-oven-text]').textContent = st.oven;
  $('[data-hero]').dataset.oven = st.open ? 'on' : 'off';
  for (const li of $$('[data-week] li')) {
    const d = Number(li.dataset.day);
    li.classList.toggle('is-today', d === st.today);
    li.classList.toggle('is-closed', !data.hours[d]);
  }
  return st;
}

const status = paintStatus();
setInterval(paintStatus, 60_000);

/* ---------- Hero: la pizza dentro del horno y su salida al hacer scroll */
const hero = $('[data-hero]');
const stage = $('.hero__stage', hero);
const heroPizza = byId['mortadela-pistacho'];
$('[data-hero-pizza]').innerHTML = renderPizza(heroPizza, { title: 'Pizza de mortadela y pistacho saliendo del horno' });

// Se hornea al llegar: las manchas del borde aparecen solo si el horno está encendido.
if (reduceMotion || !status.open) hero.classList.add('is-baked');
else requestAnimationFrame(() => setTimeout(() => hero.classList.add('is-baked'), 250));

let ticking = false;
function heroProgress() {
  ticking = false;
  if (reduceMotion) return;
  const r = hero.getBoundingClientRect();
  const total = isDesktop() ? r.height - innerHeight : r.height;
  const p = Math.min(1, Math.max(0, -r.top / Math.max(total, 1)));
  stage.style.setProperty('--p', p.toFixed(3));
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(heroProgress); } }, { passive: true });
addEventListener('resize', heroProgress);
heroProgress();

/* ---------- Cabecera sólida al salir del hero */
const top = $('[data-top]');
const onScrollTop = () => top.classList.toggle('is-solid', scrollY > 40);
addEventListener('scroll', onScrollTop, { passive: true });
onScrollTop();

/* ---------- Carta */
const rows = $$('.row');
const peel = {
  pizza: $('[data-peel-pizza]'), tags: $('[data-peel-tags]'), name: $('[data-peel-name]'),
  ing: $('[data-peel-ing]'), price: $('[data-peel-price]'), quote: $('[data-peel-quote]'),
};
const sheet = {
  el: $('[data-sheet]'), pizza: $('[data-sheet-pizza]'), tags: $('[data-sheet-tags]'), name: $('[data-sheet-name]'),
  ing: $('[data-sheet-ing]'), price: $('[data-sheet-price]'), quote: $('[data-sheet-quote]'),
};

function tagsHtml(p) {
  return [
    p.top ? '<span class="tag tag--top">Lo más pedido en Glovo</span>' : '',
    p.veg ? '<span class="tag tag--veg">Vegetariana</span>' : '',
    p.mentions ? `<span class="tag tag--veg">Sale en ${p.mentions} reseñas de Google</span>` : '',
  ].join('');
}

function fill(target, p) {
  target.pizza.innerHTML = renderPizza(p, { title: `Pizza ${p.name}: ${p.ingredients}` });
  target.tags.innerHTML = tagsHtml(p);
  target.name.textContent = p.name;
  target.ing.textContent = p.ingredients;
  target.price.textContent = eur(p.price);
  if (p.quote) {
    target.quote.hidden = false;
    $('p', target.quote).textContent = `«${p.quote.text}»`;
    $('footer', target.quote).textContent = p.quote.source;
  } else {
    target.quote.hidden = true;
  }
}

let current = 'mortadela-pistacho';
function show(id) {
  if (id === current && peel.pizza.firstChild) return;
  current = id;
  fill(peel, byId[id]);
  for (const r of rows) r.classList.toggle('is-active', r.dataset.id === id);
}

// Miniaturas: se dibujan cuando la carta se acerca a la pantalla.
const thumbsIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const row = e.target.closest('.row');
    const p = byId[row.dataset.id];
    e.target.innerHTML = renderPizza(p, { detail: false, title: '' });
    thumbsIO.unobserve(e.target);
  }
}, { rootMargin: '400px 0px' });
$$('[data-thumb]').forEach((t) => thumbsIO.observe(t));

for (const r of rows) {
  r.addEventListener('mouseenter', () => { if (isDesktop()) show(r.dataset.id); });
  r.addEventListener('focus', () => { if (isDesktop()) show(r.dataset.id); });
  r.addEventListener('click', () => {
    if (isDesktop()) { show(r.dataset.id); return; }
    fill(sheet, byId[r.dataset.id]);
    sheet.el.showModal();
  });
}
show(current);

$('[data-sheet-close]').addEventListener('click', () => sheet.el.close());
sheet.el.addEventListener('click', (e) => { if (e.target === sheet.el) sheet.el.close(); });

// Filtros
const chips = $$('.chip');
const vegNote = $('[data-veg-note]');
for (const c of chips) {
  c.addEventListener('click', () => {
    const f = c.dataset.filter;
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    vegNote.hidden = f !== 'veg';
    for (const r of rows) {
      const ok = f === 'all' || (f === 'veg' ? r.hasAttribute('data-veg') : r.dataset.group === f);
      r.parentElement.hidden = !ok;
    }
    for (const g of $$('.menu__group')) g.hidden = !$$('li', g).some((li) => !li.hidden);
    const first = rows.find((r) => !r.parentElement.hidden);
    if (first && isDesktop()) show(first.dataset.id);
  });
}

/* ---------- Dock móvil: se esconde donde ya hay un teléfono enorme */
const dock = $('[data-dock]');
const pedir = $('#pedir');
new IntersectionObserver(([e]) => dock.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.35 }).observe(pedir);
