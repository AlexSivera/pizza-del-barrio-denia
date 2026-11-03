const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const HOURS = JSON.parse($('#hours-data').textContent);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp01 = (n) => Math.min(1, Math.max(0, n));
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const ease = (t) => 1 - Math.pow(1 - t, 3);

/* ---------- Estado: abierto / cerrado, con la hora de Dénia */
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

function madridNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), min: Number(get('hour')) * 60 + Number(get('minute')) };
}

function nextOpening(day, min) {
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = HOURS[d];
    if (!h || (i === 0 && min >= toMin(h[0]))) continue;
    return { inDays: i, day: d, at: h[0] };
  }
  return null;
}

function computeStatus() {
  const { day, min } = madridNow();
  const h = HOURS[day];
  if (h && min >= toMin(h[0]) && min < toMin(h[1])) {
    return { open: true, today: day, short: `Abierto · hasta las ${h[1]}`, title: 'Encendido', sub: `Encarga hasta las ${h[1]}` };
  }
  const n = nextOpening(day, min);
  const when = n.inDays === 0 ? 'hoy' : n.inDays === 1 ? 'mañana' : `el ${DAYS[n.day]}`;
  return {
    open: false, today: day,
    short: n.inDays === 0 ? `Abre hoy a las ${n.at}` : `Cerrado · abre ${when} a las ${n.at}`,
    title: n.inDays === 0 ? `Hoy a las ${n.at}` : h ? 'Apagado' : 'Descansa',
    sub: n.inDays === 0 ? 'Se enciende esta noche' : `Vuelve ${when}, a las ${n.at}`,
  };
}

// ?horno=on | ?horno=off fuerza el estado para revisar el diseño fuera de horario.
const forced = new URLSearchParams(location.search).get('horno');

function paintStatus() {
  const st = computeStatus();
  if (forced === 'on') Object.assign(st, { open: true, short: 'Abierto · hasta las 22:30', title: 'Encendido', sub: 'Encarga hasta las 22:30' });
  if (forced === 'off') Object.assign(st, { open: false, short: 'Abre hoy a las 19:00', title: 'Hoy a las 19:00', sub: 'Se enciende esta noche' });
  const el = $('[data-status]');
  el.classList.toggle('is-open', st.open);
  el.classList.toggle('is-closed', !st.open);
  $('[data-status-text]').textContent = st.short;
  $('[data-oven-title]').textContent = st.title;
  $('[data-oven-text]').textContent = st.sub;
  $('[data-hero]').dataset.oven = st.open ? 'on' : 'off';
  for (const li of $$('[data-week] li')) {
    const d = Number(li.dataset.day);
    li.classList.toggle('is-today', d === st.today);
    li.classList.toggle('is-closed', !HOURS[d]);
  }
}
paintStatus();
setInterval(paintStatus, 60_000);

/* ---------- Cabecera sólida al salir del hero */
const top = $('[data-top]');
const onScrollTop = () => top.classList.toggle('is-solid', scrollY > 40);
addEventListener('scroll', onScrollTop, { passive: true });
onScrollTop();

/* ---------- Del horno a la caja: la pizza cae, la tapa se cierra, aparece el sello */
const caja = $('[data-caja]');
const stage = $('.caja__stage', caja);
const steps = $$('[data-steps] li');

function setBox(p) {
  const drop = 1 - ease(seg(p, 0.12, 0.42));   // 1 = arriba, 0 = dentro de la caja
  const open = 1 - ease(seg(p, 0.5, 0.78));    // 1 = tapa abierta, 0 = cerrada
  const stick = seg(p, 0.84, 0.9) > 0 ? 1 : 0;
  stage.style.setProperty('--drop', drop.toFixed(3));
  stage.style.setProperty('--open', open.toFixed(3));
  stage.style.setProperty('--lift', ease(seg(p, 0.78, 0.95)).toFixed(3));
  stage.style.setProperty('--turn', p.toFixed(3));
  stage.style.setProperty('--stick', String(stick));
  const active = p < 0.12 ? 0 : p < 0.5 ? 1 : 2;
  steps.forEach((li, i) => li.classList.toggle('is-on', i === active));
}

let ticking = false;
function onCaja() {
  ticking = false;
  const r = caja.getBoundingClientRect();
  const total = r.height - innerHeight;
  setBox(clamp01(-r.top / Math.max(total, 1)));
}
if (reduceMotion) {
  setBox(0.45); // estática: pizza dentro y caja abierta, que es lo que da hambre
  steps.forEach((li) => li.classList.add('is-on'));
} else {
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onCaja); } }, { passive: true });
  addEventListener('resize', onCaja);
  onCaja();
}

/* ---------- Filtros de la carta */
const chips = $$('.chip');
const rows = $$('.row');
const vegNote = $('[data-veg-note]');
for (const c of chips) {
  c.addEventListener('click', () => {
    const f = c.dataset.filter;
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    vegNote.hidden = f !== 'veg';
    for (const r of rows) r.hidden = !(f === 'all' || (f === 'veg' ? r.hasAttribute('data-veg') : r.dataset.group === f));
    for (const g of $$('.group')) g.hidden = !$$('.row', g).some((r) => !r.hidden);
  });
}

/* ---------- Vídeos del proceso: se cargan al acercarse y solo se reproducen si se ven */
const videos = $$('[data-clips] video');
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src) { v.src = v.dataset.src; v.load(); }
        v.play().catch(() => {});
      } else if (v.src) {
        v.pause();
      }
    }
  }, { threshold: 0.35 });
  videos.forEach((v) => io.observe(v));
} else {
  // Sin movimiento: solo el póster; el vídeo se puede abrir con los controles.
  videos.forEach((v) => { v.controls = true; v.src = v.dataset.src; });
}

/* ---------- Barra móvil: se esconde donde ya hay un teléfono enorme */
const dock = $('[data-dock]');
new IntersectionObserver(([e]) => dock.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.3 }).observe($('#pedir'));
