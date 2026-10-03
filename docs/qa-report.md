# QA — v2 (3 de octubre de 2026)

Revisado con Playwright y Chrome sobre `dist/` servido en local. Después se comprobó la URL pública.

## Viewports
| Tamaño | Resultado |
|---|---|
| 1440×900 | Hero a sangre con la foto real; caja 3D completa en sus cuatro fases (vacía, pizza dentro, cerrándose, cerrada con pegatina); carta, proceso, pedido, barrio y pie bien |
| 1280×720 | Hero completo en pantalla, sin desbordes |
| 768×1024 | Hero en formato móvil (foto vertical arriba, texto debajo). Barra fija |
| 390×844 y 360×740 | Sin desbordes horizontales. La caja cabe con la tapa abierta. Filtros con desplazamiento lateral. Clips en carrusel con *snap* |

## Funciones
| Prueba | Resultado |
|---|---|
| Estado con reloj simulado: lunes 12:00, domingo 23:00, viernes 22:45, martes 18:00 | Correcto. Cabecera, cartel del hero («Descansa», «Apagado», «Encendido», «Hoy a las 19:00»), brillo de la llama y día marcado |
| Secuencia de la caja | Pasos 1 → 2 → 3 sincronizados con la pizza que cae, la tapa que se cierra y la pegatina |
| Filtros | Con pesto 2 · Vegetarianas 6 · Blancas 7 · Todas 24. Se ocultan los grupos vacíos |
| Vídeos | No se cargan al abrir la página. Al llegar a la sección se cargan y reproducen (540×960, H.264). Al salir se pausan |
| WhatsApp | `wa.me/34611776551` con un mensaje inicial |
| Enlaces externos | Todos con `noopener` y aviso para lector de pantalla |
| JSON-LD | `Restaurant` con 24 `MenuItem` (10 con imagen) e Instagram en `sameAs` |
| Recursos | 0 errores 404 (se corrigió una miniatura que faltaba). 0 errores de consola |

## Accesibilidad
- Un H1 (con «Pizza … en Dénia» para lectores de pantalla), H2 por sección y H3 dentro. Ninguna imagen sin `alt`; las decorativas llevan `alt=""`.
- Foco visible en naranja en todos los controles. La escena 3D va con `aria-hidden` porque los pasos están en texto.
- `prefers-reduced-motion`: sin sticky, caja estática con la pizza dentro, los tres pasos visibles y vídeos con controles y sin reproducción automática. Comprobado.
- Contrastes AA (ver `design-direction.md`).

## Peso
HTML 50 KB, CSS 36 KB, JS 6 KB y fuentes 98 KB. El hero pesa 28 KB en móvil (800 px) y 67 KB en escritorio (1400 px). Las fotos son WebP con `srcset` y carga diferida. Los vídeos (unos 600 KB cada uno) solo se descargan al llegar a su sección.

## Errores encontrados y corregidos
1. «PARA LLEVAR» se partía en dos líneas → `nowrap` y tamaño según la altura.
2. La pegatina «time to get a tan» tapaba el titular → ahora apunta a la pizza.
3. La tapa abierta se salía por arriba → caja más pequeña y más baja, y apertura de 104°.
4. El sello «400–450 °C» pisaba el texto de la tapa → esquina inferior.
5. Se veía el borde del plato en el recorte de la pizza → máscara elíptica más ajustada.
6. «Las que más salen» incluía la Margherita, que no está entre las más vendidas de Glovo → «Las más pedidas y la de siempre».
7. La nota de la Margherita («la que mejor viaja») no se podía comprobar → «La de siempre, en su caja».
8. En móvil, el hero tapaba la pizza con el texto → foto arriba sin tapar y titular encima del borde.
9. Filtros en tres filas en móvil → una fila con desplazamiento.
10. La foto del local salía estirada (el atributo `height` anulaba el `aspect-ratio`) → `height: auto`.
11. La foto del local repetía la de la Trufa y dejaba un hueco en escritorio → «Aquí» ocupa todo el ancho, con un recorte del interior.
12. Faltaba la miniatura de 480 px de Mortadela y pistacho (404) → generada.
13. Con el horno apagado, el hero se oscurecía demasiado → oscurecimiento más suave.

## Autocrítica final (mirada del propietario)
- **¿«Hostia, qué web»?** Sí, por dos momentos: la foto real de su horno a pantalla completa con «NAPOLITANA PARA LLEVAR», y su caja cerrándose sobre una pizza real con su teléfono impreso.
- **¿Es suya?** Sí. Usa su lema, sus fotos, su horno, sus manos y sus rótulos, su local, su fachada antigua, su Instagram y el trébol de sus respuestas.
- **¿Dan hambre las pizzas?** Sí: 10 fotos reales de producto. La ilustración ha desaparecido.
- **¿Algo hecho «porque sí»?** La fila de datos (400–450 °C, a mano, Bronte) se parece a un patrón habitual, pero los tres datos son concretos y verificados, así que se queda. El trébol que gira es un guiño mínimo.
- **¿Algo útil pero mediocre?** Hay 14 pizzas sin foto en la lista, que solo llevan un punto de color. Se resolverá con fotos del cliente; inventarlas sería peor.

## Comparación v1 → v2
| | v1 | v2 |
|---|---|---|
| Producto | Pizzas dibujadas en SVG | 10 fotos reales del negocio y 3 clips |
| Hero | Horno ilustrado | Foto real del horno, con el estado en un cartel |
| WOW | La pizza dibujada sale del horno | La pizza real entra en su caja y la tapa queda impresa con el teléfono |
| Identidad | Inventada (verde oliva, Bagel Fat One, logo propio) | Basada en sus materiales: carteles, rotulador, caja kraft, «para llevar» |
| Carta | 24 filas iguales | Estrella, destacadas, cartel de la Trufa y lista con miniaturas |
| Personas | Ninguna | Manos del pizzero en vídeo |
| Pedido | Teléfono y Glovo | Teléfono, WhatsApp y Glovo |
| Se conserva | — | Estado en vivo, arquitectura, teléfono gigante, mapa, horario, aparcar, Bocca di Forno, «¡Hasta pronto! 🍀», SEO y accesibilidad |

## Reproducir
```bash
npm run build
npm run preview
```
`?horno=on` / `?horno=off` fuerzan el estado del horno. `node scripts/images.mjs` y `node scripts/clips.mjs` regeneran fotos y clips desde `.qa/photos` (material de investigación que no se sube al repositorio).
