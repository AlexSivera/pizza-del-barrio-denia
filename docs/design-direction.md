# Dirección artística (v2)

> La v1 (horno ilustrado y pizzas dibujadas en SVG) se sustituyó el 3 de octubre de 2026. El porqué está en `rectificacion-v2.md`.

## Concepto: «Napolitana para llevar, del barrio»

Son las palabras del propio negocio (bio de Instagram y logo, «Pizza del Barrio · PARA LLEVAR»). La web cuenta el viaje de la pizza: **horno → manos → caja → tu casa**.

## Signature moment: «Del horno a la caja»

Una sección fija mientras se hace scroll, con una caja de cartón kraft construida en CSS 3D:

1. La caja vacía y abierta. Paso 1: **Encárgala** (teléfono o WhatsApp).
2. Una Pepperoni real (foto del negocio en Glovo, recortada) cae dentro girando. Paso 2: **Al horno**, a 400–450 °C.
3. La tapa se cierra y deja ver la impresión: «PIZZA DEL BARRIO · Napolitana para llevar · Passeig del Saladar 67 · 611 77 65 51», con un sello «400–450 °C». Paso 3: **A la caja**.
4. Aparece una pegatina escrita a rotulador: «¡recién salida!».

Sale de su modelo de negocio (para llevar), de su logo y de su bio, y acaba en la acción de pedir. Con movimiento reducido, la caja se queda abierta con la pizza dentro.

## Fotografía

| Uso | Imagen | Origen |
|---|---|---|
| Hero escritorio | Pizza en el horno junto a la llama | Google Maps, subida por el negocio (2024) |
| Hero móvil y tablet | Llama y pizza, en vertical | Instagram del negocio (nov 2025) |
| Caja | Pepperoni cenital recortada | Glovo (restaurante) |
| Carta | Mortadela y pistacho, Prosciutto, Pepperoni, Italiana, 4 Estaciones, Reina, Barbacoa, Calabria, 5 Quesos | Glovo (restaurante) |
| Margherita en su caja | Mano con la caja abierta | Instagram del negocio |
| Pizza Trufa y local | Interior con barra | Instagram del negocio |
| Proceso | 3 clips (masa, horno, jamón y rúcula) | Reel de @ivan.g.lpz para el negocio, con crédito |
| Antes Bocca di Forno | Fachada antigua | Web oficial archivada |

Reglas: producto grande, cenital y sin manipular. El proceso va en vertical y en movimiento. Nada de stock ni de ilustraciones en lugar del producto.

## Color

| Token | Hex | Origen | Uso |
|---|---|---|---|
| `--noche` | `#120D0A` | Solo abren de noche, interior del horno | Hero, caja, proceso, barrio |
| `--crema` | `#F6EBD7` | Carteles | Texto sobre oscuro (16:1) |
| `--fuego` | `#FFC86A` | Llama | Destacados del titular, precios |
| `--kraft` | `#C79D66` | Caja de cartón | Caja, cartel de la Trufa, pie |
| `--tinta` | `#3B2414` | Impresión de la caja | Texto sobre kraft (5,8:1) |
| `--albahaca` | `#1E3A26` | Verde de sus carteles | Carta (crema encima: 10,5:1) |
| `--tomate` | `#B52E18` | Rojo de sus carteles | Botón principal (5,8:1), sección de pedido |
| `--marker` | `#FF8A3D` | Rótulos de sus reels | Anotaciones y pasos (8,2:1 sobre noche) |

## Tipografía

| Uso | Familia | Por qué |
|---|---|---|
| Titulares, precios, impresión de la caja | **Big Shoulders Display** 900 | Mayúsculas condensadas de cartel, como sus avisos («CERRADO POR VACACIONES») y como las cajas impresas |
| Anotaciones | **Permanent Marker** | El rotulador de sus reels («MASSAGE TIME», «TIME TO GET A TAN»). Una o dos por pantalla |
| Texto e interfaz | **Onest** | Legible, con buenas cifras. Se mantiene de la v1 |

Las tres están alojadas en local, con woff2 latino (98 KB en total).

## Composición
- Ritmo de color: noche (horno) → noche con caja kraft → verde (carta) → noche (proceso) → tomate (pedido) → noche (barrio) → kraft (pie, el fondo de la caja).
- La carta está editada: 1 estrella grande, 3 destacadas, 1 «fuera de Glovo» en formato cartel y la lista completa en dos columnas con miniaturas reales cuando hay foto.

## Movimiento
- Caja ligada al scroll (momento firma).
- Clips en bucle, sin sonido, que solo se cargan y reproducen cuando están en pantalla.
- Brillo de la llama en el hero solo cuando el horno está encendido. El cartel del hero cambia según el horario real.
- Con `prefers-reduced-motion` no hay sticky, la caja queda estática y los vídeos llevan controles.

## Lo que se mantiene de la v1
El estado en vivo (ahora como cartel pegado sobre la foto), la arquitectura one-page, el teléfono gigante, el mapa esquemático, el horario con el día marcado, el consejo para aparcar, «Bocca di Forno» tachado (ahora con la foto de la fachada) y «¡Hasta pronto! 🍀».

## Anti-repetición
Este proyecto no usa papel crema, tickets ni comandas, cortinas, fachadas que se abren ni nubes de reseñas. Las tipografías no se han usado antes en la agencia. La caja kraft es un objeto propio de este negocio, no un fondo de papel genérico.

## Referencias (principios)
| Referencia | Principio |
|---|---|
| Rudy's (Reino Unido) | Datos concretos que dan confianza (60 s de horno, AVPN). Aquí: 400–450 °C y Bronte |
| Franco Manca (Londres) | Voz con descaro («No corners cut. Just crusts.»). Aquí: los rótulos del propio pizzero |
| Pizza Pilgrims (Londres) | Pedir siempre a un toque, con humor |
| Grosso Napoletano (España) | Pedir y reservar visibles en todo momento |
| Una Pizza Napoletana (NYC) | Avisos de abierto o cerrado en primer plano |
