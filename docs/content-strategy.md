# Estrategia de contenido

## Voz

La de un vecino que hace muy buena pizza. Directa, cercana y sin palabras de folleto. Tutea y habla en plural cuando habla del negocio («Hemos cambiado el nombre»). Cierra como cierra el propietario en Google: **«¡Hasta pronto!»**.

Evitado: «calidad y profesionalidad», «experiencia gastronómica», «auténtica tradición italiana desde…».

## Qué se afirma y de dónde sale

| Texto en la web | Fuente |
|---|---|
| Pizza napolitana, Saladar, Dénia | Google Maps, Tripadvisor («Pizzeria Napolitana») |
| «Borde inflado y manchado por el horno» | Fotos de clientes; reseñas («crujiente por fuera y suave por dentro») |
| «Ingredientes frescos» | Tema «frescos» en 5 reseñas de Google |
| «Trato de vecino» | Reseñas («el trato increíble», «el cocinero muy majo y muy atento») |
| «Horno a alta temperatura» (docs) | Pie de foto en Tripadvisor. **No** se dice «de leña» porque no está confirmado |
| 24 pizzas, ingredientes y precios | Carta en Glovo, 2 oct 2026. Con aviso de que en el local pueden variar |
| «Lo más pedido» (Prosciutto, Pepperoni, Mortadela y pistacho) | Sección «Lo más vendido» de Glovo |
| Trufa (8 reseñas), tiramisú (5), vegetarianas (9), mortadela (7) | Temas de reseñas de Google con su número |
| Cita en Italiana | Reseña de Google, literal |
| «¡La joya del barrio!» | Título de una reseña en Tripadvisor, sep. 2026 |
| 4,9 con 262 reseñas | Google Maps, 2 oct 2026 |
| Mesas dentro, ambiente tranquilo, buena música | Reseñas (tipo de pedido «Comí allí», ruido «muy bajo», «buena música») |
| Cuesta aparcar | Reseña («Es algo difícil aparcar») |
| Aparcabicis en el cruce | Mapa de Google |
| Antes Bocca di Forno | Misma dirección y teléfono en Restaurant Guru, Mindtrip, Tripadvisor y Glovo |

## Qué no se ha inventado

No se han puesto años de historia, nombre del pizzero, horas de fermentación, origen de la harina, premios, reservas online ni WhatsApp. Tampoco precios del local ni testimonios con nombre. Todo eso queda pendiente en `business-brief.md`.

## SEO local

- `title`: «Pizza del Barrio · Pizzería napolitana en Dénia (Saladar) · Para llevar y a domicilio»
- `description` con dirección, rango de precios, teléfono, horario y «Antes Bocca di Forno», para captar a quien busque el nombre antiguo
- H1 «Pizza napolitana, de barrio.» con «Saladar, Dénia» justo encima
- Carta completa en HTML (indexable, no en imagen ni PDF)
- JSON-LD `Restaurant` con `alternateName: Bocca di Forno`, dirección, coordenadas, horario y `hasMenu` con las 24 pizzas y precios
- **No** se incluye `aggregateRating` en el schema: Google no permite marcar como propias las valoraciones recogidas en otra plataforma

## Próximos contenidos recomendados

1. Fotos propias: horno, pizzero trabajando, local de noche. Sustituirían a los dibujos solo en el hero o en una banda, no en la carta.
2. Versión en inglés (Dénia tiene mucho residente extranjero).
3. Confirmar la pizza de trufa, los postres y los precios del local.
4. Aviso legal y privacidad con los datos fiscales.
