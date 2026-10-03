// Generador de pizzas en SVG.
// Cada pizza se dibuja a partir de su base y de sus ingredientes reales (src/data/menu.mjs).
// La semilla es el id de la pizza: la misma pizza siempre sale igual.
// Funciona en navegador y en Node (el build lo usa para los bordes decorativos).

const R = 188; // radio del borde, en un viewBox de -200..200
const TS = 1.3; // los ingredientes se dibujan a escala y se amplían juntos
const RT = R / TS;

function seeded(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

// Contorno orgánico: círculo deformado con varias ondas suaves, cerrado con Catmull-Rom.
function blob(rnd, cx, cy, r, wobble = 0.08, points = 14) {
  const waves = [1, 2, 3].map((k) => ({ k: k + Math.floor(rnd() * 3), a: rnd() * wobble / k, p: rnd() * Math.PI * 2 }));
  const pts = [];
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    let rr = r;
    for (const w of waves) rr += r * w.a * Math.sin(w.k * t + w.p);
    rr += r * (rnd() - 0.5) * wobble * 0.5;
    pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]);
  }
  return closedPath(pts);
}

function closedPath(pts) {
  const n = pts.length;
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + 'Z';
}

function openPath(pts) {
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

// Puntos repartidos en un disco, con separación mínima (muestreo por rechazo).
function scatter(rnd, count, maxR, minDist, taken = []) {
  const out = [];
  let tries = 0;
  while (out.length < count && tries < count * 60) {
    tries++;
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * maxR;
    const p = [Math.cos(a) * r, Math.sin(a) * r];
    if (out.every((q) => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 > minDist * minDist) &&
        taken.every((q) => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 > (minDist * 0.6) ** 2)) {
      out.push(p);
    }
  }
  return out;
}

const tr = (p, rot = 0, s = 1) => `transform="translate(${f(p[0])},${f(p[1])}) rotate(${f(rot)})${s !== 1 ? ` scale(${f(s * 100) / 100})` : ''}"`;

const BASES = {
  tomate: { fill: '#B7301A', mottle: ['#D2482A', '#8E2312', '#C83B1F'], edge: '#8E2312' },
  nata: { fill: '#F2E4C6', mottle: ['#E6CF9E', '#F8EEDA', '#DDBF86'], edge: '#D9B57A' },
  pesto: { fill: '#557F24', mottle: ['#6E9B33', '#3E6219', '#86A93F'], edge: '#3E6219' },
  sin: { fill: '#F0D79B', mottle: ['#E5BE6E', '#F7E6BC', '#D9A85A'], edge: '#C9944A' },
};

// --- Ingredientes. Cada uno devuelve SVG; `ctx` comparte rnd, nivel de detalle y puntos ocupados.

const T = {
  mozzarella(ctx) {
    const { rnd } = ctx;
    const n = 6 + Math.floor(rnd() * 3);
    return scatter(rnd, n, RT * 0.6, 44).map((p) => {
      const r = 15 + rnd() * 11;
      let s = '';
      // Halo de queso fundido que se extiende sobre la salsa
      if (ctx.detail) s += `<path d="${blob(rnd, p[0], p[1], r * 1.3, 0.3, 9)}" fill="#F6DDAE" opacity=".55" filter="${ctx.blur}"/>`;
      s += `<path d="${blob(rnd, p[0], p[1], r, 0.32, 11)}" fill="#FFF6E2"/>`;
      if (ctx.detail) {
        s += `<path d="${blob(rnd, p[0] + r * 0.2, p[1] + r * 0.15, r * 0.5, 0.35, 8)}" fill="#F0D29C" opacity=".5"/>`;
        if (rnd() < 0.45) s += `<circle cx="${f(p[0] + (rnd() - 0.5) * r)}" cy="${f(p[1] + (rnd() - 0.5) * r)}" r="${f(2 + rnd() * 2.5)}" fill="#C98A43" opacity=".55"/>`;
        s += `<ellipse cx="${f(p[0] - r * 0.3)}" cy="${f(p[1] - r * 0.35)}" rx="${f(r * 0.3)}" ry="${f(r * 0.13)}" fill="#fff" opacity=".8"/>`;
      }
      return s;
    }).join('');
  },
  provolone(ctx) {
    return scatter(ctx.rnd, 5, RT * 0.6, 50).map((p) => `<path d="${blob(ctx.rnd, p[0], p[1], 15 + ctx.rnd() * 6, 0.25, 9)}" fill="#F1D88C" opacity=".95"/>`).join('');
  },
  cheddar(ctx) {
    return scatter(ctx.rnd, 5, RT * 0.6, 50).map((p) => `<path d="${blob(ctx.rnd, p[0], p[1], 14 + ctx.rnd() * 6, 0.25, 9)}" fill="#EDA931" opacity=".9"/>`).join('');
  },
  barbacoa(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 9, RT * 0.62, 34).map((p) => `<path d="${blob(rnd, p[0], p[1], 12 + rnd() * 12, 0.4, 8)}" fill="#4E1B0C" opacity=".45"${ctx.detail ? ` filter="${ctx.blur}"` : ''}/>`).join('');
  },
  albahaca(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 5, RT * 0.55, 60, ctx.taken).map((p) => {
      const s = 1.1 + rnd() * 0.5;
      return `<g ${tr(p, rnd() * 360, s)}><path d="M0,-16C10,-11 12,6 0,16C-12,6 -10,-11 0,-16Z" fill="#2F6B1C"/><path d="M0,-16C10,-11 12,6 0,16" fill="#3E8226"/><path d="M0,-13L0,13" stroke="#1F4A12" stroke-width="1.1" opacity=".7"/></g>`;
    }).join('');
  },
  jamonYork(ctx) {
    const { rnd } = ctx;
    const pts = scatter(rnd, 6, RT * 0.58, 52, ctx.taken);
    ctx.taken.push(...pts);
    return pts.map((p) => `<g ${tr(p, rnd() * 360, 1 + rnd() * 0.25)}><path d="M-22,-9C-10,-19 9,-16 22,-7C17,3 20,11 7,16C-5,11 -14,16 -22,7C-17,1 -24,-3 -22,-9Z" fill="#EFA49D"/><path d="M-14,-6C-4,-11 8,-9 16,-3" stroke="#F9CFC8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-12,7C-3,4 6,8 12,4" stroke="#D27C77" stroke-width="1.6" fill="none" opacity=".8"/></g>`).join('');
  },
  serrano(ctx) {
    const { rnd } = ctx;
    const pts = scatter(rnd, 6, RT * 0.6, 50, ctx.taken);
    ctx.taken.push(...pts);
    return pts.map((p) => `<g ${tr(p, rnd() * 360, 1 + rnd() * 0.3)}><path d="M-24,-6C-12,-14 6,-12 24,-8C20,-1 22,6 10,10C-2,6 -12,12 -24,5C-20,0 -26,-2 -24,-6Z" fill="#B23A43" opacity=".95"/><path d="M-20,-3C-8,-8 6,-7 20,-5" stroke="#F1D5CF" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9"/></g>`).join('');
  },
  mortadela(ctx) {
    const { rnd } = ctx;
    const pts = scatter(rnd, 5, RT * 0.52, 66, ctx.taken);
    ctx.taken.push(...pts);
    return pts.map((p) => {
      const r = 27 + rnd() * 5;
      let s = `<g ${tr(p, rnd() * 360)}><path d="${blob(rnd, 0, 0, r, 0.18, 10)}" fill="#F2AFB2"/><path d="M${f(-r * 0.8)},${f(r * 0.1)}C${f(-r * 0.3)},${f(-r * 0.3)} ${f(r * 0.3)},${f(r * 0.4)} ${f(r * 0.85)},${f(-r * 0.05)}" stroke="#D98B91" stroke-width="2.4" fill="none" opacity=".8"/>`;
      for (let i = 0; i < 5; i++) s += `<circle cx="${f((rnd() - 0.5) * r * 1.2)}" cy="${f((rnd() - 0.5) * r * 1.2)}" r="${f(1.6 + rnd() * 1.6)}" fill="#FCE4E3"/>`;
      return s + '</g>';
    }).join('');
  },
  stracciatella(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 7, RT * 0.6, 42).map((p) => {
      const r = 11 + rnd() * 6;
      return `<path d="${blob(rnd, p[0], p[1], r, 0.35, 9)}" fill="#FFFDF6"/><path d="${blob(rnd, p[0] + 2, p[1] + 3, r * 0.55, 0.3, 7)}" fill="#EFE7D6" opacity=".7"/>`;
    }).join('');
  },
  pistacho(ctx) {
    const { rnd } = ctx;
    const cols = ['#9DBB4A', '#6E8F2F', '#C9C47B', '#86A63C'];
    let s = '';
    for (const p of scatter(rnd, ctx.detail ? 90 : 40, RT * 0.72, 6)) {
      const r = 1.6 + rnd() * 2.4;
      s += `<path d="${blob(rnd, p[0], p[1], r, 0.5, 5)}" fill="${cols[Math.floor(rnd() * cols.length)]}"/>`;
    }
    return s;
  },
  pepperoni(ctx, dark) {
    const { rnd } = ctx;
    const pts = scatter(rnd, 10, RT * 0.62, 34, ctx.taken);
    ctx.taken.push(...pts);
    return pts.map((p) => {
      const r = 15 + rnd() * 3;
      let s = `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r)}" fill="${dark ? '#8C1F10' : '#B02F1D'}"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r - 2)}" fill="none" stroke="#6E170B" stroke-width="2" opacity=".55"/>`;
      if (ctx.detail) for (let i = 0; i < 4; i++) s += `<circle cx="${f(p[0] + (rnd() - 0.5) * r)}" cy="${f(p[1] + (rnd() - 0.5) * r)}" r="${f(1.2 + rnd())}" fill="#E88A66" opacity=".8"/>`;
      return s + `<ellipse cx="${f(p[0] - r * 0.3)}" cy="${f(p[1] - r * 0.35)}" rx="${f(r * 0.35)}" ry="${f(r * 0.16)}" fill="#fff" opacity=".22"/>`;
    }).join('');
  },
  salamiPicante(ctx) {
    let s = T.pepperoni(ctx, true);
    if (ctx.detail) for (const p of scatter(ctx.rnd, 24, RT * 0.7, 10)) s += `<path d="${blob(ctx.rnd, p[0], p[1], 1.8, 0.6, 5)}" fill="#E2391B"/>`;
    return s;
  },
  salami(ctx) {
    const { rnd } = ctx;
    const pts = scatter(rnd, 7, RT * 0.6, 40, ctx.taken);
    ctx.taken.push(...pts);
    return pts.map((p) => {
      const r = 15 + rnd() * 3;
      let s = `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r)}" fill="#A33441"/>`;
      for (let i = 0; i < 7; i++) s += `<circle cx="${f(p[0] + (rnd() - 0.5) * r * 1.3)}" cy="${f(p[1] + (rnd() - 0.5) * r * 1.3)}" r="${f(1 + rnd() * 1.4)}" fill="#EFC8C3"/>`;
      return s;
    }).join('');
  },
  champinones(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 8, RT * 0.62, 38, ctx.taken).map((p) => `<g ${tr(p, rnd() * 360, 1 + rnd() * 0.3)}><path d="M-13,2C-13,-11 13,-11 13,2C9,3 6,2 4.5,4L4.5,12C2,14.5 -2,14.5 -4.5,12L-4.5,4C-6,2 -9,3 -13,2Z" fill="#DCC6A7" stroke="#9C7A55" stroke-width="1.4"/><path d="M-8,0L8,0M-6,-4L6,-4" stroke="#B89B78" stroke-width=".9" opacity=".7"/></g>`).join('');
  },
  aceitunas(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 9, RT * 0.66, 28).map((p) => {
      const r = 5.6 + rnd() * 1.2;
      return `<path d="M${f(p[0] - r)},${f(p[1])}a${f(r)},${f(r)} 0 1,0 ${f(r * 2)},0a${f(r)},${f(r)} 0 1,0 ${f(-r * 2)},0ZM${f(p[0] - 2.2)},${f(p[1])}a2.2,2.2 0 1,0 4.4,0a2.2,2.2 0 1,0 -4.4,0Z" fill="#2A221E" fill-rule="evenodd"/><path d="M${f(p[0] - r * 0.6)},${f(p[1] - r * 0.5)}q${f(r * 0.5)},${f(-r * 0.4)} ${f(r * 1.1)},0" stroke="#7D706A" stroke-width="1" fill="none"/>`;
    }).join('');
  },
  alcachofa(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 6, RT * 0.6, 40, ctx.taken).map((p) => `<g ${tr(p, rnd() * 360, 1 + rnd() * 0.3)}><path d="M0,-14C9,-9 11,6 0,14C-11,6 -9,-9 0,-14Z" fill="#8C9A57"/><path d="M0,-9C5,-6 6,4 0,9C-6,4 -5,-6 0,-9Z" fill="#C7C78E"/><path d="M0,-12L0,12" stroke="#6B7840" stroke-width="1"/></g>`).join('');
  },
  atun(ctx) {
    const { rnd } = ctx;
    let s = '';
    for (const p of scatter(rnd, 8, RT * 0.62, 36)) {
      for (let i = 0; i < 3; i++) s += `<path d="${blob(rnd, p[0] + (rnd() - 0.5) * 14, p[1] + (rnd() - 0.5) * 14, 5 + rnd() * 3, 0.5, 6)}" fill="${rnd() > 0.5 ? '#CCA88B' : '#B78E6F'}"/>`;
    }
    return s;
  },
  cebollaRoja(ctx) { return onions(ctx, '#8C2D66', '#C77CA6'); },
  cebollaBlanca(ctx) { return onions(ctx, '#F4EADA', '#FFFFFF'); },
  cebollaCaramelizada(ctx) {
    const { rnd } = ctx;
    let s = '';
    for (const p of scatter(rnd, 16, RT * 0.64, 22)) {
      const a = rnd() * Math.PI * 2, l = 10 + rnd() * 8;
      s += `<path d="M${f(p[0])},${f(p[1])}q${f(Math.cos(a + 1) * l * 0.6)},${f(Math.sin(a + 1) * l * 0.6)} ${f(Math.cos(a) * l)},${f(Math.sin(a) * l)}" stroke="#9A5722" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".92"/>`;
    }
    return s;
  },
  anchoas(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 6, RT * 0.55, 46, ctx.taken).map((p) => `<g ${tr(p, rnd() * 360)}><rect x="-15" y="-2.8" width="30" height="5.6" rx="2.8" fill="#6A4F3E"/><path d="M-12,-.5L12,-.5" stroke="#BDB4A6" stroke-width="1.2"/></g>`).join('');
  },
  alcaparras(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 18, RT * 0.66, 18).map((p) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(2.6 + rnd() * 0.8)}" fill="#66772A"/><circle cx="${f(p[0] - 0.8)}" cy="${f(p[1] - 0.8)}" r=".9" fill="#A9B868"/>`).join('');
  },
  cherry(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 7, RT * 0.6, 40, ctx.taken).map((p) => {
      const r = 8.5 + rnd() * 1.5;
      let s = `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r)}" fill="#CE2E1A"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r * 0.68)}" fill="#E8634A"/>`;
      for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.7; s += `<ellipse cx="${f(p[0] + Math.cos(a) * r * 0.38)}" cy="${f(p[1] + Math.sin(a) * r * 0.38)}" rx="1.5" ry="1" fill="#F4D27A"/>`; }
      return s;
    }).join('');
  },
  tomateSeco(ctx) {
    return scatter(ctx.rnd, 6, RT * 0.6, 40, ctx.taken).map((p) => `<path d="${blob(ctx.rnd, p[0], p[1], 8 + ctx.rnd() * 3, 0.45, 7)}" fill="#7A1D13"/>`).join('');
  },
  rucula(ctx) {
    const { rnd } = ctx;
    let s = '';
    for (const p of scatter(rnd, 11, RT * 0.6, 30)) {
      s += `<g ${tr(p, rnd() * 360, 0.9 + rnd() * 0.5)}><path d="M0,-20L4,-15L3,-10L8,-7L5,-2L9,2L4,6L6,11L1,14L0,20L-1,14L-6,11L-4,6L-9,2L-5,-2L-8,-7L-3,-10L-4,-15Z" fill="#3F7D2A"/><path d="M0,-18L0,18" stroke="#2A5A1A" stroke-width="1"/></g>`;
    }
    return s;
  },
  balsamica(ctx) { return drizzle(ctx, '#3B1E14', 2.4, 3); },
  miel(ctx) { return drizzle(ctx, '#E8AD35', 1.8, 2, 0.6); },
  sriracha(ctx) { return drizzle(ctx, '#D7381C', 2.6, 2); },
  parmesano(ctx) {
    const { rnd } = ctx;
    let s = '';
    for (const p of scatter(rnd, ctx.detail ? 22 : 10, RT * 0.68, 14)) {
      s += `<path d="${blob(rnd, p[0], p[1], 3 + rnd() * 2.5, 0.5, 5)}" fill="#F7EDC9" stroke="#E0CC92" stroke-width=".6"/>`;
    }
    return s;
  },
  carnePicada(ctx) {
    const { rnd } = ctx;
    let s = '';
    for (const p of scatter(rnd, 34, RT * 0.66, 14)) s += `<path d="${blob(rnd, p[0], p[1], 3.2 + rnd() * 2.6, 0.5, 6)}" fill="${rnd() > 0.5 ? '#6E3A22' : '#87492A'}"/>`;
    return s;
  },
  bacon(ctx) {
    const { rnd } = ctx;
    const pts = scatter(rnd, 7, RT * 0.6, 40, ctx.taken);
    ctx.taken.push(...pts);
    return pts.map((p) => `<g ${tr(p, rnd() * 360, 1 + rnd() * 0.2)}><path d="M-16,-6C-8,-9 0,-3 8,-6C12,-7 15,-6 17,-5L16,5C12,7 8,4 2,6C-6,8 -10,4 -17,6Z" fill="#B44A42"/><path d="M-15,-1C-7,-4 1,1 9,-1C12,-2 14,-1 16,0" stroke="#F2D2C6" stroke-width="2.2" fill="none"/></g>`).join('');
  },
  huevo(ctx) {
    const { rnd } = ctx;
    const p = [(rnd() - 0.5) * 30, (rnd() - 0.5) * 30];
    ctx.taken.push(p);
    return `<path d="${blob(rnd, p[0], p[1], 34, 0.18, 12)}" fill="#FFFCF2"/><circle cx="${f(p[0] + 3)}" cy="${f(p[1] - 2)}" r="12.5" fill="#F2A51A"/><circle cx="${f(p[0] + 3)}" cy="${f(p[1] - 2)}" r="12.5" fill="none" stroke="#E08A0E" stroke-width="1.6"/><ellipse cx="${f(p[0])}" cy="${f(p[1] - 6)}" rx="4" ry="2.4" fill="#FFE29A"/>`;
  },
  pina(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 9, RT * 0.62, 34, ctx.taken).map((p) => `<g ${tr(p, rnd() * 360)}><path d="M-11,8L0,-12L11,8Q0,12 -11,8Z" fill="#F3C845" stroke="#DDA52A" stroke-width="1.2" stroke-linejoin="round"/><path d="M-5,6L0,-5L5,6" stroke="#E2B13A" stroke-width=".9" fill="none"/></g>`).join('');
  },
  pollo(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 10, RT * 0.62, 30, ctx.taken).map((p) => `<path d="${blob(rnd, p[0], p[1], 7.5 + rnd() * 2.5, 0.35, 7)}" fill="#D7A46A" stroke="#AD763C" stroke-width="1.4"/>`).join('');
  },
  cabra(ctx) {
    const { rnd } = ctx;
    const pts = scatter(rnd, 6, RT * 0.58, 44, ctx.taken);
    return pts.map((p) => {
      const r = 10.5 + rnd() * 2;
      return `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r)}" fill="#FBF8EE" stroke="#E5D8BB" stroke-width="2.4"/><ellipse cx="${f(p[0] + 2)}" cy="${f(p[1] + 2)}" rx="${f(r * 0.5)}" ry="${f(r * 0.35)}" fill="#EED7A6" opacity=".6"/>`;
    }).join('');
  },
  roquefort(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 9, RT * 0.62, 30).map((p) => {
      let s = `<path d="${blob(rnd, p[0], p[1], 6.5 + rnd() * 2.5, 0.4, 7)}" fill="#F3F0E5"/>`;
      for (let i = 0; i < 3; i++) s += `<circle cx="${f(p[0] + (rnd() - 0.5) * 8)}" cy="${f(p[1] + (rnd() - 0.5) * 8)}" r="1" fill="#6F8D82"/>`;
      return s;
    }).join('');
  },
  sobrasada(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 9, RT * 0.62, 34, ctx.taken).map((p) => `<path d="${blob(rnd, p[0], p[1], 10 + rnd() * 4, 0.35, 8)}" fill="#CF5428"/><path d="${blob(rnd, p[0] - 2, p[1] - 2, 5, 0.4, 6)}" fill="#E8875A" opacity=".8"/>`).join('');
  },
  berenjena(ctx) {
    const { rnd } = ctx;
    const pts = scatter(rnd, 6, RT * 0.58, 44, ctx.taken);
    ctx.taken.push(...pts);
    return pts.map((p) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(11 + rnd() * 2)}" fill="#E7D9B6" stroke="#4A1F3F" stroke-width="3.2"/><circle cx="${f(p[0] + 2)}" cy="${f(p[1] - 1)}" r="5" fill="none" stroke="#CDB98C" stroke-width="1" stroke-dasharray="1.5 2"/>`).join('');
  },
  calabacin(ctx) {
    const { rnd } = ctx;
    return scatter(rnd, 7, RT * 0.6, 38, ctx.taken).map((p) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(9.5 + rnd() * 1.5)}" fill="#E4E8B6" stroke="#4C7A26" stroke-width="2.6"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="4.5" fill="none" stroke="#C9CF88" stroke-width="1" stroke-dasharray="1.5 2"/>`).join('');
  },
  perejil(ctx) { return flecks(ctx, ['#3E7A22', '#2F6419'], 50, 1.2, 1.2); },
  oregano(ctx) { return flecks(ctx, ['#5E6B2A', '#77693A', '#4A5A22'], 70, 0.9, 1.1); },
  pimienta(ctx) { return flecks(ctx, ['#1E1712'], 60, 0.8, 0.8); },
  aceite(ctx) {
    const { rnd } = ctx;
    let s = '';
    for (const p of scatter(rnd, 7, RT * 0.6, 40)) s += `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(5 + rnd() * 5)}" ry="${f(2 + rnd() * 2)}" fill="#F2C94C" opacity=".35" transform="rotate(${f(rnd() * 180)} ${f(p[0])} ${f(p[1])})"/>`;
    return s;
  },
};

function onions(ctx, stroke, inner) {
  const { rnd } = ctx;
  let s = '';
  for (const p of scatter(rnd, 7, RT * 0.6, 34)) {
    const r = 8 + rnd() * 6;
    const a0 = rnd() * Math.PI * 2, a1 = a0 + Math.PI * (1 + rnd() * 0.9);
    const arc = (rr) => `M${f(p[0] + Math.cos(a0) * rr)},${f(p[1] + Math.sin(a0) * rr)}A${f(rr)},${f(rr)} 0 ${a1 - a0 > Math.PI ? 1 : 0},1 ${f(p[0] + Math.cos(a1) * rr)},${f(p[1] + Math.sin(a1) * rr)}`;
    s += `<path d="${arc(r)}" stroke="${stroke}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="${arc(r - 2.4)}" stroke="${inner}" stroke-width="1" fill="none" opacity=".8"/>`;
  }
  return s;
}

function drizzle(ctx, color, width, lines, opacity = 0.9) {
  const { rnd } = ctx;
  let s = '';
  for (let l = 0; l < lines; l++) {
    const pts = [];
    const ang = rnd() * Math.PI;
    const ox = Math.cos(ang + Math.PI / 2) * (l - (lines - 1) / 2) * 34;
    const oy = Math.sin(ang + Math.PI / 2) * (l - (lines - 1) / 2) * 34;
    for (let i = 0; i <= 12; i++) {
      const t = (i / 12 - 0.5) * RT * 1.3;
      const w = Math.sin(i * 1.7 + rnd()) * 16;
      pts.push([Math.cos(ang) * t + Math.cos(ang + Math.PI / 2) * w + ox, Math.sin(ang) * t + Math.sin(ang + Math.PI / 2) * w + oy]);
    }
    s += `<path d="${openPath(pts)}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round" opacity="${opacity}"/>`;
  }
  return s;
}

function flecks(ctx, cols, n, rmin, rvar) {
  const { rnd } = ctx;
  let s = '';
  const count = ctx.detail ? n : Math.round(n * 0.4);
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * RT * 0.74;
    s += `<circle cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r)}" r="${f(rmin + rnd() * rvar)}" fill="${cols[Math.floor(rnd() * cols.length)]}"/>`;
  }
  return s;
}

// Orden de pintado: lo que va debajo primero.
const LAYER_ORDER = [
  'barbacoa', 'aceite', 'provolone', 'cheddar', 'mozzarella', 'huevo', 'mortadela', 'jamonYork', 'serrano',
  'salami', 'pepperoni', 'salamiPicante', 'sobrasada', 'berenjena', 'calabacin', 'bacon', 'pollo', 'atun',
  'carnePicada', 'champinones', 'alcachofa', 'cherry', 'tomateSeco', 'pina', 'cabra', 'roquefort',
  'stracciatella', 'cebollaRoja', 'cebollaBlanca', 'cebollaCaramelizada', 'anchoas', 'aceitunas',
  'alcaparras', 'albahaca', 'rucula', 'balsamica', 'miel', 'sriracha', 'parmesano', 'pistacho',
  'perejil', 'oregano', 'pimienta',
];

let uid = 0;

/**
 * @param {{id:string, base:string, draw:string[]}} pizza
 * @param {{detail?:boolean, title?:string, idPrefix?:string}} opts
 */
export function renderPizza(pizza, opts = {}) {
  const detail = opts.detail !== false;
  const rnd = seeded(pizza.id);
  const id = (opts.idPrefix || 'pz') + (++uid);
  const base = BASES[pizza.base] || BASES.tomate;
  const ctx = { rnd, detail, taken: [], blur: `url(#${id}b)` };

  // Borde (cornicione)
  const crust = blob(rnd, 0, 0, R, 0.035, 22);
  const sauce = blob(rnd, 0, 0, R * 0.79, 0.05, 18);

  let s = `<svg class="pz" viewBox="-200 -200 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opts.title ? escapeAttr(opts.title) : 'Pizza ' + escapeAttr(pizza.name || '')}">`;
  s += `<defs><radialGradient id="${id}c" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F6DCA6"/><stop offset=".72" stop-color="#EEC683"/><stop offset=".86" stop-color="#E2A75C"/><stop offset=".95" stop-color="#C47B35"/><stop offset="1" stop-color="#93531F"/></radialGradient>`;
  s += `<radialGradient id="${id}s" cx="50%" cy="50%" r="50%"><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#7A3E14" stop-opacity="${pizza.base === 'nata' || pizza.base === 'sin' ? .28 : .45}"/></radialGradient>`;
  if (detail) s += `<filter id="${id}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="${id}bb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`;
  s += `</defs>`;

  // Sombra de contacto
  if (detail) s += `<ellipse cx="6" cy="10" rx="${R}" ry="${R}" fill="#000" opacity=".35" filter="url(#${id}bb)"/>`;
  s += `<path d="${crust}" fill="url(#${id}c)"/>`;

  // Brillo del borde inflado
  if (detail) s += `<circle r="${f(R * 0.9)}" fill="none" stroke="#FCEBC6" stroke-width="10" opacity=".5" filter="url(#${id}b)"/>`;

  // Salsa
  s += `<path d="${sauce}" fill="${base.fill}"/>`;
  for (const p of scatter(rnd, detail ? 16 : 7, R * 0.66, 26)) {
    s += `<path d="${blob(rnd, p[0], p[1], 10 + rnd() * 16, 0.35, 8)}" fill="${base.mottle[Math.floor(rnd() * 3)]}" opacity=".6"${detail ? ` filter="url(#${id}b)"` : ''}/>`;
  }
  // Sombra donde la masa sube hacia el borde
  s += `<path d="${sauce}" fill="url(#${id}s)"/>`;
  if (detail) s += `<path d="${sauce}" fill="none" stroke="${base.edge}" stroke-width="4" opacity=".55" filter="url(#${id}b)"/>`;

  // Ingredientes
  const layers = LAYER_ORDER.filter((k) => pizza.draw.includes(k));
  s += `<g transform="scale(${TS})">`;
  for (const k of layers) if (T[k]) s += `<g class="pz-${k}">${T[k](ctx)}</g>`;
  s += `</g>`;

  // Leopardatura: manchas de horno en el borde
  s += `<g class="pz-char">`;
  const nSpots = detail ? 74 : 40;
  for (let i = 0; i < nSpots; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = R * (0.85 + rnd() * 0.14);
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    const big = rnd() < 0.25;
    const rx = big ? 5 + rnd() * 6 : 1.6 + rnd() * 3.2;
    const ry = rx * (0.55 + rnd() * 0.4);
    const deg = (a * 180) / Math.PI + 90;
    if (detail && big) s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx * 2)}" ry="${f(ry * 1.8)}" fill="#7A3D14" opacity=".35" transform="rotate(${f(deg)} ${f(x)} ${f(y)})" filter="url(#${id}b)"/>`;
    s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="#2A150A" opacity="${f(0.6 + rnd() * 0.35)}" transform="rotate(${f(deg)} ${f(x)} ${f(y)})"/>`;
  }
  s += `</g>`;

  // Brillo final
  if (detail) s += `<ellipse cx="-60" cy="-80" rx="90" ry="40" fill="#fff" opacity=".07" transform="rotate(-30 -60 -80)"/>`;
  return s + `</svg>`;
}

// Tabla de madera redonda con mango: así sirven la pizza en el local (fotos de clientes).
export function renderBoard() {
  return `<svg class="board" viewBox="-240 -240 480 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="bw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C99257"/><stop offset=".55" stop-color="#B47C42"/><stop offset="1" stop-color="#8F5E2E"/></linearGradient></defs><rect x="-34" y="180" width="68" height="200" rx="26" fill="url(#bw)"/><circle cx="0" cy="372" r="9" fill="#5A3A1C"/><circle r="232" fill="url(#bw)"/><g fill="none" stroke="#8F5E2E" stroke-width="2" opacity=".35"><path d="M-200,-110C-60,-140 80,-90 210,-120"/><path d="M-225,-30C-80,-60 70,-10 228,-40"/><path d="M-228,50C-70,20 90,70 226,40"/><path d="M-205,130C-60,100 80,150 205,120"/><path d="M-150,200C-40,175 60,215 150,195"/></g><circle r="232" fill="none" stroke="#7A4E25" stroke-width="3" opacity=".6"/></svg>`;
}

// Borde de masa con leopardatura, para separar secciones.
export function renderCrustEdge(seed = 'edge', color = '#E9B977', withSpots = true) {
  const rnd = seeded(seed);
  const W = 1440, H = 56;
  const pts = [[0, H]];
  for (let x = 0; x <= W; x += 36) pts.push([x, 18 + rnd() * 14 + Math.sin(x / 90) * 4]);
  pts.push([W, H]);
  let d = `M0,${H}L0,${f(pts[1][1])}`;
  for (let i = 1; i < pts.length - 2; i++) {
    const p = pts[i], q = pts[i + 1];
    d += `Q${f(p[0] + 18)},${f(Math.min(p[1], q[1]) - 12 - rnd() * 6)} ${f(q[0])},${f(q[1])}`;
  }
  d += `L${W},${H}Z`;
  let spots = '';
  for (let i = 0; i < (withSpots ? 70 : 0); i++) {
    const x = rnd() * W, y = 14 + rnd() * 22;
    const rx = rnd() < 0.2 ? 4 + rnd() * 5 : 1.4 + rnd() * 2.4;
    spots += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * 0.6)}" fill="#2A150A" opacity="${f(0.55 + rnd() * 0.4)}"/>`;
  }
  return `<svg class="edge" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><path d="${d}" fill="${color}"/>${spots}</svg>`;
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
