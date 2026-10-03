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
- En la carta, las pizzas con foto se ven grandes arriba y la lista completa lleva una miniatura real cuando existe. Los filtros van en una fila con desplazamiento lateral.
- El hero pone la foto del horno arriba, sin tapar, y el titular debajo. La caja ocupa 2,4 pantallas de scroll. Sin movimiento si el sistema pide reducirlo.

## Comportamiento escritorio

- La carta empieza con la estrella a dos columnas, sigue con tres destacadas y el cartel de la Trufa, y termina con la lista completa en dos columnas.
- La cabecera muestra estado y teléfono en todo momento.

## Elementos diferenciales (v2)

- **El horno dice la verdad**: sobre la foto real del horno va pegado un cartel que cambia con el horario («Encendido», «Hoy a las 19:00», «Descansa»). Cuando está abierto, la llama brilla.
- **Del horno a la caja**: la pizza real entra en su caja kraft y la tapa queda impresa con el teléfono. Es el modelo de negocio (para llevar) convertido en el momento firma.
- **Carta editada con fotos del negocio**: una estrella (Mortadela y pistacho, de Bronte), las más pedidas, la Trufa fuera de Glovo y la lista completa filtrable.
- **Personas**: las manos del pizzero en vídeo, con sus propios rótulos.
- **Reseñas pegadas al producto**: la cita va junto a la pizza de la que habla, y las menciones se cuentan por pizza.

## Cambios de arquitectura en la v2
Hero (foto) → **Del horno a la caja** (nuevo) → Carta (reorganizada) → **Así sale una del barrio** (nuevo, vídeo) → ¿Cómo la quieres? (con WhatsApp) → En el Saladar → Pie kraft.
