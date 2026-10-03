# Product Experience Blueprint

## Situación real de uso

Son las 19:40 de un jueves. Alguien del Saladar, o un veraneante que ha buscado «pizza napolitana Dénia», abre la web en el móvil. Quiere saber cuatro cosas, en este orden:

1. **¿Está abierto ahora?**
2. **¿Qué pizzas hay y cuánto cuestan?**
3. **¿Cómo la pido?** Llamando para recoger, por Glovo o cenando allí.
4. **¿Dónde está y se puede aparcar?**

Todo lo demás es secundario.

## Expectativas del sector (lo mínimo)

| Necesidad | Cómo se resuelve |
|---|---|
| Estado abierto/cerrado | Calculado en vivo con la hora de Madrid y el horario de Google. Aparece en la cabecera y **también en el horno del hero**, que está encendido o apagado |
| Carta completa con precios | 24 pizzas en HTML (indexables), filtrables por base y por vegetariana, con aviso de precios y alérgenos |
| Pedir | Teléfono como acción principal (sin comisión). Glovo como segunda opción. Barra fija abajo en móvil |
| Llegar | Dirección, esquema del cruce, consejo de aparcamiento (la queja de las reseñas), botón a Google Maps |
| Confianza | 4,9 con 262 reseñas en Google. Citas cortas y reales unidas a la pizza de la que hablan |
| Continuidad | Aviso «Antes Bocca di Forno» para quien buscaba el nombre antiguo |

## Acción principal

**Llamar para encargar** (611 77 65 51). Secundaria: Glovo. Terciaria: cómo llegar.

## Arquitectura

**One-page**, y es una decisión, no un hábito: el negocio tiene una sola carta, un solo local y un solo horario, y todo el uso es móvil y rápido. Una multipágina solo añadiría clics. La página se ordena como el camino de la pizza:

1. **El horno** (hero): qué es, dónde, si está abierto y la acción principal. Al bajar, la pizza sale del horno.
2. **La carta**: la pizza elegida se dibuja con sus ingredientes reales. Filtros: Con tomate · Blancas · Con pesto · Vegetarianas.
3. **¿Cómo la quieres?**: recoger (el teléfono en grande), a domicilio (Glovo) o cenar aquí.
4. **En el barrio**: esquema del cruce, horario de la semana con el día de hoy marcado, aparcamiento, «antes Bocca di Forno».
5. **Despedida**: «¡Hasta pronto! 🍀», en la voz del propietario.

## Comportamiento móvil

- Barra fija inferior con **Llamar** y **Glovo**, que se oculta mientras se ve la sección de pedido para no duplicar.
- En la carta, cada fila lleva una miniatura de su pizza. Al tocarla se abre una hoja inferior (`<dialog>`) con la pizza grande, los ingredientes y los botones de pedido.
- El hero ocupa como mucho una pantalla y media de scroll. Sin movimiento si el sistema pide reducirlo.

## Comportamiento escritorio

- La carta se divide en dos: la pala con la pizza a la izquierda (fija) y la lista a la derecha. Al pasar el ratón o el foco por una fila, la pizza de la pala cambia.
- La cabecera muestra estado y teléfono en todo momento.

## Elementos diferenciales

- **Un horno que dice la verdad**: el fuego del hero está encendido en horario de apertura y en brasas cuando está cerrado («El horno se enciende a las 19:00»).
- **Pizzas dibujadas a partir de la carta**: cada una de las 24 se genera con sus ingredientes (leopardatura en el borde, salsa según la base, mozzarella, toppings). No se usan fotos de otros restaurantes haciéndolas pasar por suyas, y el visitante ve qué lleva cada pizza antes de pedirla.
- **Reseñas pegadas al producto**: no hay una sección de testimonios suelta. Cada cita aparece junto a la pizza de la que habla.
