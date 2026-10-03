# QA — 2 de octubre de 2026

Revisado con Playwright (Chromium) sobre `dist/` servido en local.

## Viewports

| Tamaño | Resultado |
|---|---|
| 1440×900 | Hero sticky con salida del horno, carta en dos columnas con la pala fija, todas las secciones bien |
| 1280×720 | Hero completo en pantalla. Pala y botones de la carta visibles (tras reducir la tabla a `38vh`) |
| 768×844 (tablet) | Sin desbordes. Teléfono gigante a ancho completo. Barra fija inferior |
| 390×844 (móvil) | Sin desbordes horizontales. Hero apilado, filtros con scroll lateral, hoja inferior por pizza, barra fija Llamar/Glovo |

## Funciones

| Prueba | Resultado |
|---|---|
| Estado en vivo (reloj simulado): lunes 12:00, domingo 23:00, viernes 22:45, martes 18:00, sábado 23:05 | Textos, horno encendido/apagado y día marcado correctos en todos |
| Horneado al cargar con el horno encendido | Correcto. Fuera de horario la pizza sale ya horneada |
| Scroll del hero (`--p` de 0 a 1) | La pizza se endereza, crece y sale. El texto se desvanece y aparece el pie «Mortadela y pistacho» |
| Hover y foco en filas (escritorio) | Actualizan la pala |
| Filtros | Con pesto → 2, Vegetarianas → 6 (Margherita, 4 Quesos, Vegetariana, Verona, Cabra, 5 Quesos). Se ocultan los grupos vacíos |
| Toque en fila (móvil) | Abre `<dialog>` con pizza, ingredientes, precio y cita. Cierra con ×, con Escape y tocando fuera |
| Barra fija móvil | Se oculta al llegar a «¿Cómo la quieres?» |
| Enlaces externos | Todos con `rel="noopener"` y aviso para lector de pantalla |
| `tel:` | +34611776551 en cabecera, hero, pala, hoja, sección de pedido, barra y pie |
| JSON-LD | Se parsea bien: `Restaurant` con 24 `MenuItem` |
| Consola | 0 errores, 0 avisos |

## Accesibilidad

- Orden de tabulación lógico, empezando por «Saltar a la carta». Foco visible (contorno de 3 px en color fuego) en todos los controles.
- Un solo H1. H2 por sección y H3 por grupo. El nombre de la pala dejó de ser un H3 para no romper el orden de encabezados.
- Filtros con `aria-pressed`. La pala se anuncia con `aria-live`. Mapa con `title` y `desc`.
- Contrastes AA comprobados (ver `design-direction.md`). El más justo es el precio en fuego claro sobre oliva, con 5,25:1.
- `prefers-reduced-motion`: sin llamas, sin horneado, sin sticky y sin giros. Comprobado.
- Botones y enlaces táctiles de 44 a 50 px de alto.

## Rendimiento

- Sin frameworks ni dependencias. HTML 64 KB, CSS 26 KB, JS 33 KB (sin comprimir), fuentes 58 KB.
- Sin imágenes rasterizadas: todo es SVG generado.
- Las miniaturas de la carta se dibujan en versión ligera y solo cuando la carta se acerca a la pantalla (IntersectionObserver).

## Errores encontrados y corregidos durante la revisión

1. El letrero del horno se montaba sobre el titular → ahora va dentro de la boca del horno.
2. El texto del hero rozaba el arco → horno desplazado al 58 % y texto limitado a `27vw`.
3. El teléfono gigante partía el «51» en otra línea → `nowrap` y tamaño ajustado por ancho.
4. «aparcabicis» se solapaba con el nombre de la calle en el mapa → marcador y etiquetas recolocados.
5. El trébol del pie bajaba a otra línea → `nowrap` y tamaño ajustado.
6. El borde de masa del pie quedaba tapado por la sección anterior → `z-index`.
7. La pala de la carta no cabía a 720 px de alto → tabla más pequeña.
8. Ingredientes demasiado pequeños, mozzarella con aspecto de algodón y espiral de barbacoa poco natural → generador ajustado.
9. Con `?horno=off` el texto seguía diciendo «Abierto» → corregido.

## Autocrítica final

- **¿Parece hecha para este negocio?** Sí. El horno remite a su nombre antiguo, el verde es el de su pared, la tabla de madera es como la sirven, la despedida es la del dueño y la carta es la suya, con sus 24 pizzas.
- **¿Qué provoca el WOW?** El horno que está encendido o apagado según la hora real y la pizza que sale hacia ti al hacer scroll. Además, cada pizza se dibuja con sus ingredientes.
- **Test de intercambiabilidad**: si se cambia de pizzería, el horario del horno, la carta dibujada, «Bocca di Forno» tachado, el cruce del Saladar y el «¡Hasta pronto! 🍀» dejan de tener sentido.
- **Pendiente honesto**: hacen falta fotos propias del local, y los precios del local están sin confirmar (la web avisa de que son los de Glovo). La sección «¿Cómo la quieres?» sigue siendo una fila de tres columnas. Se mantiene porque son tres canales reales con pesos distintos (el teléfono domina), pero es la parte más convencional de la web.

## Cómo reproducir

```bash
npm run build
npm run preview
```

Para ver los dos estados del horno fuera de horario: `http://localhost:4321/?horno=on` y `?horno=off`.
