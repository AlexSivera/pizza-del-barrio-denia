// Recorta clips cortos y sin sonido del reel con Chrome (canvas + MediaRecorder), sin ffmpeg.
// Uso: node scripts/clips.mjs   (lee .qa/photos/video, escribe src/media)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = process.env.PLAYWRIGHT_CORE || 'C:/Users/Alex Sivera/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright-core';
const { chromium } = require(PW);
const SRC = path.join(root, '.qa', 'photos', 'video', 'DYu7IiOODqQ-1.mp4');
const OUT = path.join(root, 'src', 'media');

// [nombre, inicio s, fin s]
const CLIPS = [
  ['masa', 3.0, 9.4],
  ['horno', 30.2, 36.6],
  ['jamon', 43.0, 49.4],
];
const W = 540, H = 960;
const toUrl = (p) => 'file:///' + p.split(path.sep).join('/');

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
fs.writeFileSync(path.join(root, '.qa', 'clip.html'), `<video id=v muted playsinline preload=auto src="${toUrl(SRC)}"></video><canvas id=c width=${W} height=${H}></canvas>`);
await page.goto(toUrl(path.join(root, '.qa', 'clip.html')));
await page.waitForFunction(() => document.getElementById('v').readyState >= 2);

for (const [name, t0, t1] of CLIPS) {
  const res = await page.evaluate(async ({ t0, t1, W, H }) => {
    const v = document.getElementById('v');
    const c = document.getElementById('c');
    const g = c.getContext('2d');
    const types = ['video/mp4;codecs=avc1.42E01F', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9'];
    const mime = types.find((t) => MediaRecorder.isTypeSupported(t));
    await new Promise((r) => { v.onseeked = r; v.currentTime = t0; });
    g.drawImage(v, 0, 0, W, H);
    const poster = c.toDataURL('image/webp', 0.8);
    const stream = c.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1_600_000 });
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const done = new Promise((r) => (rec.onstop = r));
    let raf = true;
    const draw = () => { g.drawImage(v, 0, 0, W, H); if (raf) v.requestVideoFrameCallback(draw); };
    v.requestVideoFrameCallback(draw);
    rec.start();
    await v.play();
    await new Promise((r) => { const tick = () => (v.currentTime >= t1 ? r() : requestAnimationFrame(tick)); tick(); });
    raf = false;
    v.pause();
    rec.stop();
    await done;
    const blob = new Blob(chunks, { type: mime });
    const buf = new Uint8Array(await blob.arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return { mime, data: btoa(bin), poster };
  }, { t0, t1, W, H });
  const ext = res.mime.includes('mp4') ? 'mp4' : 'webm';
  fs.writeFileSync(path.join(OUT, `${name}.${ext}`), Buffer.from(res.data, 'base64'));
  fs.writeFileSync(path.join(OUT, `${name}.webp`), Buffer.from(res.poster.split(',')[1], 'base64'));
  console.log(name, res.mime, (fs.statSync(path.join(OUT, `${name}.${ext}`)).size / 1024).toFixed(0) + ' KB');
}
await browser.close();
