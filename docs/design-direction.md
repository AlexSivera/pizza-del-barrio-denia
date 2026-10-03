# Dirección artística

## Concepto: «La napolitana de barrio»

El negocio cambió su nombre italiano (**Bocca di Forno**, «boca del horno») por **Pizza del Barrio**. La web junta los dos nombres: la *boca del horno* es la imagen principal y *el barrio* marca el tono, la arquitectura y el texto.

**Idea visual en una frase:** *una noche en el Saladar: el horno se enciende a las 19:00, la pizza sale hacia ti y la pides como en el mostrador.*

## Signature moment: el horno que dice la verdad

1. El hero es la boca de un horno de ladrillo con una pizza de mortadela y pistacho dentro, vista en perspectiva.
2. **El fuego depende del horario real** (hora de Madrid): en horario de apertura hay llamas y la pizza se hornea al cargar la página (las manchas del borde aparecen). Fuera de horario solo quedan brasas y el letrero dice «El horno se enciende hoy a las 19:00» o «Los lunes el horno descansa».
3. **Al hacer scroll la pizza sale del horno**: se endereza hasta quedar vista desde arriba, crece y el horno se apaga detrás. Después llega la carta.

No es un efecto de adorno. Responde a la pregunta número uno («¿está abierto?»), recuerda el nombre antiguo y enseña el producto.

## Las pizzas se dibujan desde la carta

No hay fotos propias con licencia, y usar fotos de otros restaurantes sería engañar. Por eso cada una de las 24 pizzas se **genera en SVG a partir de sus ingredientes reales** (`src/js/pizza.js`):

- borde inflado con **leopardatura** (las manchas de horno que se ven en las fotos de los clientes)
- salsa según la base: tomate, nata, pesto o sin salsa
- mozzarella fundida y 40 ingredientes dibujados (mortadela, stracciatella, pistacho, rúcula, crema balsámica, anchoas…)
- la semilla es el nombre de la pizza, así que cada pizza sale siempre igual

En la carta, la pizza aparece sobre una **tabla de madera con mango**, como la sirven en el local según las fotos de los clientes.

## Color

Sale de la noche (solo abren a partir de las 19:00), del local (paredes verde oliva en las fotos de clientes) y del producto.

| Token | Hex | Origen | Uso |
|---|---|---|---|
| `--horno` | `#17100B` | Interior del horno, noche | Fondo general, hero, barrio |
| `--masa` | `#F4E4C4` | Masa | Texto sobre oscuro (15:1) |
| `--dough` | `#E9B977` | Borde horneado | Bordes de masa entre secciones, marca |
| `--fuego` | `#FFB33C` | Llama | Acción principal (llamar). Texto oscuro encima: 10,5:1 |
| `--oliva` | `#4A5520` | Pared del local | Fondo de la carta. Masa encima: 6,4:1 |
| `--tomate` | `#B8301A` | Salsa | Sección «¿Cómo la quieres?». Blanco encima: 5,7:1 |
| `--pesto` | `#9DC45A` | Pesto/albahaca | Abierto ahora, vegetariana, trébol |

Las bases de la carta usan su propio color en los filtros: rojo para tomate, blanco para las blancas y verde para el pesto.

## Tipografía

| Uso | Familia | Por qué |
|---|---|---|
| Titulares, marca, teléfono | **Bagel Fat One** | Letra hinchada y redonda, como el borde de una napolitana. Desenfadada, de barrio y nada de lujo. No se ha usado en ningún proyecto anterior |
| Texto e interfaz | **Onest** | Grotesca clara y cálida, con buenas cifras para precios, horarios y teléfono |

Las dos están alojadas en el propio dominio (woff2 latino, 58 KB en total). No se carga nada de Google Fonts.

## Recursos gráficos

- **Borde de masa con manchas** como separador de secciones (entrada a la carta y al pie), y un borde de salsa en la sección de pedido.
- **Arco de ladrillo** con dovelas de tonos distintos, iluminadas por el fuego.
- **«Bocca di Forno» tachado**: el nombre antiguo, perfilado y con un trazo de fuego encima. Cuenta el cambio de nombre sin esconderlo.
- **Trébol de cuatro hojas**: el propietario firma todas sus respuestas a reseñas con «¡Hasta pronto! 🍀». El pie de la web usa esa misma despedida.
- **Esquema del cruce** Passeig del Saladar × C/ Carlos Sentí, con el aparcabicis real.

## Movimiento

Llamas (oscilación en CSS), horneado al cargar (2,2 s), salida del horno ligada al scroll, pizza que «aterriza» en la tabla al cambiar de pizza y halo del mapa. Con `prefers-reduced-motion` todo queda quieto y el hero deja de ser sticky.

## Lo que se descartó para no repetir proyectos anteriores

Se revisaron las webs de Basilico, Gula, Pegolí, Xato, Peluquería Silvia y HaryThai. Se evitó a propósito:

- fondos de **papel crema**: aquí la base es oscura (horno) y verde (pared)
- **tickets o comandas** de papel (ya usados en Gula, Xato, Basilico y HaryThai)
- **fachadas y cortinas** que se abren (Silvia, HaryThai)
- **nubes de temas de reseñas**: aquí las reseñas se unen a la pizza concreta de la que hablan
- tipografías anteriores (Yellowtail, Young Serif, Libre Franklin, Bodoni Moda, Hanken, Barlow, Schibsted…)
- **platos recortados en círculo** sobre mantel (Basilico): aquí la pizza va dibujada y sobre su tabla

## Referencias estudiadas (principios, no layouts)

| Referencia | Qué aprendemos | Qué no copiamos |
|---|---|---|
| Pizza Pilgrims (Londres) | Voz con humor, la masa como lema, pedir a un clic | Su universo de marca y su ilustración |
| Grosso Napoletano (España) | Reservar y pedir siempre a mano | Fidelización y estructura de cadena |
| Una Pizza Napoletana (NYC) | Avisos de cierre en primer plano, tono personal | Esconder la carta |
| Casa Papat (Dénia, competencia) | En Dénia se espera Glovo, teléfono y horario visibles | Hero partido y tres bloques genéricos |
| La Vecchia Roma (Dénia) | La historia del producto convence | Tono de restaurante de puerto |
| L'Antica Pizzeria da Michele | Poca carta y mucha identidad | La solemnidad |
