# Pizza del Barrio — web

Pizzería napolitana de barrio en el Passeig del Saladar, 67 (Dénia). Antes se llamaba Bocca di Forno.

Web estática de una sola página, sin dependencias. El build genera la carta, el horario, el JSON-LD y los gráficos a partir de un único archivo de datos.

```bash
npm run build     # genera dist/
npm run preview   # sirve dist/ en http://localhost:4321
```

Publicada en GitHub Pages: https://alexsivera.github.io/pizza-del-barrio-denia/

```bash
npm run deploy    # compila y publica dist/ en la rama gh-pages
```

## Cambiar la carta, los precios o el horario

Todo está en **`src/data/menu.mjs`**. Para cada pizza: nombre, precio, base (`tomate`, `nata`, `pesto` o `sin`), ingredientes tal y como se muestran, y `draw`, la lista de ingredientes que usa el dibujo. Después hay que ejecutar `npm run build`.

Ingredientes que se pueden dibujar: ver `LAYER_ORDER` en `src/js/pizza.js`.

## Estructura

```
src/
  index.html        plantilla ({{TOKENS}} que rellena el build)
  styles.css
  data/menu.mjs     carta, horario y contacto (fuente: Glovo y Google Maps, 2 oct 2026)
  js/pizza.js       generador SVG de pizzas, tabla de madera y bordes de masa
  js/main.js        estado en vivo, horno, scroll del hero, carta, hoja móvil
  fonts/            Bagel Fat One y Onest (woff2, alojadas en local)
scripts/
  build.mjs         genera dist/
  serve.mjs         servidor estático local
docs/               investigación, estrategia, dirección artística y QA
```

## Pendiente del cliente

Ver `docs/business-brief.md` → «Pendiente de confirmar»: precios del local, tipo de horno, trufa y postres, reservas o WhatsApp, datos legales, logo y fotos propias.
