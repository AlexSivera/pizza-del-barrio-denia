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

/* ---------- Del horno a la caja
   La pizza sale del horno (cae con brillo de calor), humea en la caja abierta,
   la tapa se cierra, la caja sube al centro y la pegatina cae sobre la tapa. */
const caja = $('[data-caja]');
const stage = $('.caja__stage', caja);
const steps = $$('[data-steps] li');
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const setVar = (k, v) => stage.style.setProperty(k, v.toFixed(3));
let activeStep = -1;

function setBox(p) {
  const drop = 1 - ease(seg(p, 0.04, 0.34));               // 1 = saliendo del horno, 0 = en la caja
  const open = 1 - easeInOut(seg(p, 0.48, 0.74));          // 1 = tapa abierta, 0 = cerrada
  const steam = seg(p, 0.24, 0.34) * (1 - seg(p, 0.5, 0.64));
  setVar('--drop', drop);
  setVar('--pzo', clamp01((1 - drop) * 6));                // entra rápido: nunca se ve «aparecer» en medio
  setVar('--heat', 1 - ease(seg(p, 0.3, 0.62)));           // el brillo naranja se apaga al reposar
  setVar('--steam', steam);
  setVar('--open', open);
  setVar('--lift', easeInOut(seg(p, 0.66, 0.88)));         // la caja cerrada sube al centro y se acerca
  setVar('--turn', p);
  stage.classList.toggle('is-steaming', steam > 0.01);
  stage.classList.toggle('is-stuck', p > 0.86);
  const active = p < 0.04 ? 0 : p < 0.48 ? 1 : 2;
  if (active !== activeStep) {
    activeStep = active;
    steps.forEach((li, i) => li.classList.toggle('is-on', i === active));
  }
}

// La animación sigue al scroll con inercia (τ ≈ 90 ms): con rueda de ratón no va a saltos.
let target = 0, cur = 0, raf = 0, last = 0;
function measure() {
  const r = caja.getBoundingClientRect();
  target = clamp01(-r.top / Math.max(r.height - innerHeight, 1));
}
function loop(t) {
  const dt = last ? Math.min(64, t - last) : 16;
  last = t;
  cur += (target - cur) * (1 - Math.exp(-dt / 90));
  if (Math.abs(target - cur) < 0.0005) cur = target;
  setBox(cur);
  if (cur !== target) raf = requestAnimationFrame(loop);
  else { raf = 0; last = 0; }
}
function kick() { measure(); if (!raf) raf = requestAnimationFrame(loop); }

if (reduceMotion) {
  setBox(0.4); // estática: pizza dentro y caja abierta, que es lo que da hambre
  stage.classList.remove('is-steaming');
  steps.forEach((li) => li.classList.add('is-on'));
} else {
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  measure();
  cur = target; // al recargar a mitad de página, sin animar desde cero
  setBox(cur);
}

/* ---------- Filtros de la carta */
const chips = $$('.chip');
const rows = $$('.row');
for (const c of chips) {
  c.addEventListener('click', () => {
    const f = c.dataset.filter;
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    for (const r of rows) r.hidden = !(f === 'all' || (f === 'veg' ? r.hasAttribute('data-veg') : r.dataset.group === f));
    for (const g of $$('.group')) g.hidden = !$$('.row', g).some((r) => !r.hidden);
  });
}

/* ---------- Vídeos del proceso
   Escritorio: los tres en fila, en bucle, solo mientras se ven.
   Móvil (≤600 px): formato historia, como el reel original. Un clip a la vez con barras de progreso;
   al acabar pasa al siguiente; tocar a la izquierda o a la derecha cambia de clip y en el centro pausa. */
const reel = $('[data-reel]');
const videos = $$('[data-clips] video');
const clipItems = $$('[data-clips] .clip');
const bars = $$('.reel__bars i', reel);
const playBtn = $('[data-reel-play]', reel);
const storyMQ = matchMedia('(max-width: 600px)');
const load = (v) => { if (!v.src) { v.src = v.dataset.src; v.load(); } };
let inView = false, current = 0, paused = reduceMotion, barRaf = 0;

function paintBars() {
  bars.forEach((b, i) => {
    const v = videos[i];
    const f = i < current ? 1 : i > current ? 0 : (v.duration ? v.currentTime / v.duration : 0);
    b.style.transform = `scaleX(${f})`;
  });
  barRaf = storyMQ.matches && inView && !paused ? requestAnimationFrame(paintBars) : 0;
}

function sync() {
  const story = storyMQ.matches;
  reel.classList.toggle('is-story', story);
  videos.forEach((v, i) => {
    v.loop = !story;
    const shown = story ? i === current : true;
    clipItems[i].classList.toggle('is-on', story && i === current);
    if (story) clipItems[i].setAttribute('aria-hidden', String(!shown)); else clipItems[i].removeAttribute('aria-hidden');
    if (inView && shown && !paused) { load(v); v.play().catch(() => {}); }
    else if (v.src) v.pause();
  });
  if (story && inView) load(videos[(current + 1) % videos.length]); // el siguiente, ya preparado
  playBtn.setAttribute('aria-label', paused ? 'Reproducir' : 'Pausar');
  reel.classList.toggle('is-paused', paused);
  if (story && !barRaf) paintBars();
}

function go(i) {
  current = (i + videos.length) % videos.length;
  const v = videos[current];
  if (v.src) v.currentTime = 0;
  sync();
}

videos.forEach((v, i) => v.addEventListener('ended', () => { if (storyMQ.matches && i === current) go(current + 1); }));
$('[data-reel-prev]', reel).addEventListener('click', () => go(current - 1));
$('[data-reel-next]', reel).addEventListener('click', () => go(current + 1));
playBtn.addEventListener('click', () => { paused = !paused; sync(); });
storyMQ.addEventListener('change', sync);

// Sin movimiento: nada arranca solo. En escritorio, controles nativos; en móvil, el botón central reproduce.
if (reduceMotion) videos.forEach((v) => { v.controls = !storyMQ.matches; v.src = v.dataset.src; }); // preload=none: solo el póster hasta que se pulse
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.35 }).observe($('[data-clips]'));
} else { inView = true; sync(); }

/* ---------- Barra móvil: se esconde donde ya hay un teléfono enorme */
const dock = $('[data-dock]');
new IntersectionObserver(([e]) => dock.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.3 }).observe($('#pedir'));
