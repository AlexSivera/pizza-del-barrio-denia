# Pizza del Barrio — web

Pizza napolitana para llevar en el Passeig del Saladar, 67 (Dénia). Antes se llamaba Bocca di Forno.

Publicada en GitHub Pages: https://alexsivera.github.io/pizza-del-barrio-denia/

Web estática de una sola página, sin dependencias. El build genera la carta, el horario y el JSON-LD a partir de un único archivo de datos.

```bash
npm run build     # genera dist/
npm run preview   # sirve dist/ en http://localhost:4321
npm run deploy    # compila y publica dist/ en la rama gh-pages
```

## Cambiar la carta, los precios o el horario

Todo está en **`src/data/menu.mjs`**. Para cada pizza: nombre, precio, base, ingredientes y, si tiene foto, `photo` y `level`:

- `star`: la estrella
- `feature`: las destacadas
- `card`: miniatura en la lista

Después hay que ejecutar `npm run build`.

## Fotos y vídeo

- `src/img/`: WebP ya optimizados. Se generan con `node scripts/images.mjs` a partir de los originales de `.qa/photos/`, que no se suben al repositorio.
- `src/media/`: clips de 6 s sin sonido, recortados del reel de @ivan.g.lpz con `node scripts/clips.mjs`.
- Los dos scripts usan Chrome mediante Playwright. Solo hacen falta para preparar material, no para el build.

El origen de cada imagen está en `docs/design-direction.md`. Para pasar de demo a producción hay que confirmar los permisos con el propietario y pedirle los originales.

## Estructura

```
src/
  index.html        plantilla ({{TOKENS}} que rellena el build)
  styles.css
  data/menu.mjs     carta, horario y contacto
  js/main.js        estado en vivo, caja 3D con el scroll, filtros, vídeos y barra móvil
  img/  media/  fonts/
scripts/
  build.mjs  deploy.mjs  serve.mjs  images.mjs  clips.mjs
docs/               investigación, rectificación v2, dirección, contenido y QA
```
