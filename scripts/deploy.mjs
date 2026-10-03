// Publica la web en GitHub Pages (rama gh-pages): npm run deploy
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const REPO = 'https://github.com/AlexSivera/pizza-del-barrio-denia.git';
const SITE_URL = 'https://alexsivera.github.io/pizza-del-barrio-denia';
const run = (cmd, cwd = ROOT, env = {}) => execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });

run('node scripts/build.mjs', ROOT, { SITE_URL });
const sha = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
fs.rmSync(path.join(DIST, '.git'), { recursive: true, force: true });
run('git init -q -b gh-pages', DIST);
run('git -c core.autocrlf=false add -A', DIST);
run(`git commit -q -m "Publicación GitHub Pages (${sha})"`, DIST);
run(`git push -q -f ${REPO} gh-pages`, DIST);
fs.rmSync(path.join(DIST, '.git'), { recursive: true, force: true });
console.log(`✓ Publicado en ${SITE_URL}/`);
