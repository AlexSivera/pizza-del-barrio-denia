// Prepara las fotos de la web en WebP a varios tamaños usando Chrome (canvas), sin dependencias.
// Uso: node scripts/images.mjs   (lee de .qa/photos, escribe en src/img)
// Necesita Playwright y Chrome instalados en la máquina (solo para preparar imágenes, no para el build).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, '.qa', 'photos');
const OUT = path.join(root, 'src', 'img');
const PW = process.env.PLAYWRIGHT_CORE || 'C:/Users/Alex Sivera/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright-core';
const { chromium } = require(PW);

// [origen, nombre, anchos, opciones]  crop: [x, y, w, h] en px de origen. ellipse: [cx, cy, rx, ry] recorte con borde suave.
const JOBS = [
  ['owner/horno-llama.jpg', 'hero-horno', [800, 1400, 2200], { q: 0.8 }],
  ['ig-hd/DRSqiRzjPMM.jpg', 'hero-horno-movil', [700, 1100], { crop: [180, 0, 1260, 1440], q: 0.8 }],
  ['glovo/Pepperoni.png', 'caja-pepperoni', [600, 1000], { ellipse: [500, 482, 440, 398], q: 0.85 }],
  ['glovo/Mortadela-Y-Pistacho.png', 'pz-mortadela-pistacho', [480, 600, 1000], {}],
  ['glovo/Prosciutto.png', 'pz-prosciutto', [480, 900], {}],
  ['glovo/Pepperoni.png', 'pz-pepperoni', [480, 900], {}],
  ['glovo/Italiana.png', 'pz-italiana', [480, 900], {}],
  ['glovo/4-Estaciones.png', 'pz-cuatro-estaciones', [480, 900], {}],
  ['glovo/Reina.png', 'pz-reina', [480, 900], {}],
  ['glovo/Barbacoa.jpg', 'pz-barbacoa', [480, 900], {}],
  ['glovo/Calabría.png', 'pz-calabria', [480, 900], {}],
  ['glovo/5-Quesos.jpg', 'pz-cinco-quesos', [480, 900], {}],
  ['ig-hd/DMfq9JeoSH5.jpg', 'pz-margherita', [480, 900], { crop: [0, 200, 1440, 1440] }],
  ['ig-hd/DT-_--jjBUu.jpg', 'pz-trufa', [480, 900], { crop: [0, 420, 1200, 780] }],
  ['ig-hd/DT-_--jjBUu.jpg', 'local-interior', [600, 1100], {}],
  ['owner/fachada-bocca.png', 'fachada-bocca', [545], { q: 0.85 }],
];

const toUrl = (p) => 'file:///' + p.split(path.sep).join('/');

const browser = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
fs.writeFileSync(path.join(root, '.qa', 'img.html'), '<canvas id=c></canvas>');
await page.goto(toUrl(path.join(root, '.qa', 'img.html')));
fs.mkdirSync(OUT, { recursive: true });

for (const [src, name, widths, opt] of JOBS) {
  for (const w of widths) {
    const data = await page.evaluate(async ({ url, w, opt }) => {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const [sx, sy, sw, sh] = opt.crop || [0, 0, img.naturalWidth, img.naturalHeight];
      const scale = Math.min(1, w / sw);
      const cw = Math.round(sw * scale), ch = Math.round(sh * scale);
      const c = document.getElementById('c');
      c.width = cw; c.height = ch;
      const g = c.getContext('2d');
      g.imageSmoothingQuality = 'high';
      g.clearRect(0, 0, cw, ch);
      g.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
      if (opt.ellipse) {
        const [ex, ey, rx, ry] = opt.ellipse.map((v) => v * scale);
        g.globalCompositeOperation = 'destination-in';
        const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1);
        grad.addColorStop(0, '#000'); grad.addColorStop(0.97, '#000'); grad.addColorStop(1, 'rgba(0,0,0,0)');
        g.save(); g.translate(ex, ey); g.scale(rx, ry); g.fillStyle = grad; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore();
        g.globalCompositeOperation = 'source-over';
      }
      return c.toDataURL('image/webp', opt.q || 0.78);
    }, { url: toUrl(path.join(SRC, src)), w, opt });
    const file = path.join(OUT, `${name}-${w}.webp`);
    fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
    console.log(path.basename(file), (fs.statSync(file).size / 1024).toFixed(0) + ' KB');
  }
}
await browser.close();
