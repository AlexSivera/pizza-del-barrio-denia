// Carta de Pizza del Barrio.
// Fuente: tienda en Glovo «Pizza del Barrio» (Dénia), consultada el 2 oct 2026.
// Los ingredientes se copian tal cual de la carta; solo se normalizan mayúsculas y comas.
// base: 'tomate' | 'nata' | 'pesto' | 'sin' (sin salsa en la carta).
// photo: nombre de la foto en src/img (pz-<photo>-480/900.webp). Fotos del propio negocio (Glovo e Instagram).
// level: 'star' (la estrella), 'feature' (destacada grande), 'card' (ficha con foto). Sin level = lista compacta.

export const SOURCE = {
  label: 'Carta publicada en Glovo',
  checked: '2026-10-02',
  url: 'https://glovoapp.com/es/es/denia/stores/bocca-di-forno-denia',
};

export const GROUPS = [
  { id: 'roja', name: 'Con tomate', note: 'Base de tomate', bases: ['tomate'] },
  { id: 'blanca', name: 'Blancas', note: 'Con nata o sin salsa', bases: ['nata', 'sin'] },
  { id: 'verde', name: 'Con pesto', note: 'Base de pesto', bases: ['pesto'] },
];

export const PIZZAS = [
  // --- Con tomate
  { id: 'margherita', name: 'Margherita', price: 10.5, base: 'tomate', veg: true, photo: 'margherita', level: 'feature',
    ingredients: 'Tomate, mozzarella fior di latte D.O.P. y albahaca',
    note: 'La de siempre, en su caja.' },
  { id: 'rossa', name: 'Rossa', price: 13, base: 'tomate',
    ingredients: 'Tomate, mozzarella, roquefort, salami y cebolla roja' },
  { id: 'campestre', name: 'Campestre', price: 13.5, base: 'tomate',
    ingredients: 'Tomate, mozzarella, bacon, huevo y pimienta negra' },
  { id: 'prosciutto', name: 'Prosciutto', price: 13.9, base: 'tomate', top: true, photo: 'prosciutto', level: 'feature',
    ingredients: 'Tomate, mozzarella fior di latte D.O.P., jamón york y orégano' },
  { id: 'napolitana', name: 'Napolitana', price: 14, base: 'tomate',
    ingredients: 'Tomate, mozzarella fior di latte, anchoas y alcaparras' },
  { id: 'atun', name: 'Atún', price: 14, base: 'tomate',
    ingredients: 'Tomate, mozzarella fior di latte, atún, cebolla roja, aceitunas, pimienta negra y orégano' },
  { id: 'sobrasada', name: 'Sobrasada', price: 14, base: 'tomate',
    ingredients: 'Tomate, mozzarella, sobrasada, cabra, miel, aceite y orégano' },
  { id: 'vegetariana', name: 'Vegetariana', price: 14, base: 'tomate', veg: true,
    ingredients: 'Tomate, mozzarella fior di latte D.O.P., berenjena, champiñones, calabacín, alcachofa y cebolla caramelizada' },
  { id: 'calabria', name: 'Calabria', price: 14.5, base: 'tomate', photo: 'calabria', level: 'card',
    ingredients: 'Tomate, mozzarella fior di latte, atún, cebolla blanca y pimienta negra' },
  { id: 'pepperoni', name: 'Pepperoni', price: 14.5, base: 'tomate', top: true, photo: 'pepperoni', level: 'feature',
    ingredients: 'Tomate, mozzarella fior di latte D.O.P. y pepperoni' },
  { id: 'cuatro-quesos', name: '4 Quesos', price: 14.5, base: 'tomate', veg: true,
    ingredients: 'Tomate, mozzarella fior di latte D.O.P., roquefort, provolone, cabra y orégano' },
  { id: 'diavola', name: 'Diavola', price: 14.5, base: 'tomate',
    ingredients: 'Tomate, mozzarella fior di latte D.O.P., salami picante, cebolla roja y sriracha' },
  { id: 'reina', name: 'Reina', price: 14.9, base: 'tomate', photo: 'reina', level: 'card',
    ingredients: 'Tomate, mozzarella fior di latte D.O.P., jamón york, champiñones, aceitunas y orégano' },
  { id: 'cuatro-estaciones', name: '4 Estaciones', price: 15, base: 'tomate', photo: 'cuatro-estaciones', level: 'card',
    ingredients: 'Tomate, mozzarella fior di latte D.O.P., jamón york, champiñones, aceitunas, alcachofas y orégano' },
  { id: 'barbacoa', name: 'Barbacoa', price: 15, base: 'tomate', photo: 'barbacoa', level: 'card',
    ingredients: 'Tomate, salsa barbacoa, mozzarella fior di latte D.O.P., carne picada y bacon' },

  // --- Blancas
  { id: 'hawaiana', name: 'Hawaiana', price: 12, base: 'nata',
    ingredients: 'Nata, mozzarella, jamón york, piña y aceite de oliva' },
  { id: 'paisana', name: 'Paisana', price: 13, base: 'nata',
    ingredients: 'Nata, mozzarella fior di latte D.O.P., parmigiano, cebolla blanca y bacon' },
  { id: 'verona', name: 'Verona', price: 13, base: 'nata', veg: true,
    ingredients: 'Nata, mozzarella fior di latte, queso de cabra, calabacín y miel' },
  { id: 'funghi', name: 'Funghi', price: 14, base: 'nata',
    ingredients: 'Nata, mozzarella fior di latte, champiñones, pollo asado, perejil y parmesano' },
  { id: 'cabra', name: 'Cabra', price: 14.5, base: 'nata', veg: true,
    ingredients: 'Nata, mozzarella fior di latte D.O.P., queso de cabra, cebolla caramelizada, aceitunas y miel' },
  { id: 'americana', name: 'Americana', price: 14.5, base: 'sin',
    ingredients: 'Mozzarella fior di latte, champiñones, carne picada, jamón cocido, cebolla, huevo, aceitunas y orégano' },
  { id: 'cinco-quesos', name: '5 Quesos', price: 15, base: 'sin', veg: true, photo: 'cinco-quesos', level: 'card',
    ingredients: 'Mozzarella, cheddar, queso de cabra, roquefort, provolone y orégano' },

  // --- Con pesto
  { id: 'italiana', name: 'Italiana', price: 15, base: 'pesto', photo: 'italiana', level: 'card',
    ingredients: 'Pesto, mozzarella fior di latte, tomate cherry, jamón serrano, rúcula, tomate seco, parmesano y crema balsámica',
    quote: { text: 'Pedimos cuatro pizzas (italiana, mortadela, trufa y sobrasada) y todas estaban riquísimas', source: 'Reseña en Google' } },
  { id: 'mortadela-pistacho', name: 'Mortadela y pistacho', price: 16, base: 'pesto', top: true, photo: 'mortadela-pistacho', level: 'star',
    ingredients: 'Pesto, mozzarella fior di latte, parmigiano, mortadela, stracciatella y pistachos',
    note: 'Los pistachos del pesto y de encima son de Bronte, en Sicilia.', mentions: 7 },
];

// Fuera de Glovo: publicada por el negocio en Instagram (26 ene 2026) y citada en 8 reseñas de Google.
export const LOCAL_ONLY = {
  id: 'trufa', name: 'Trufa', photo: 'trufa',
  ingredients: 'Masa napolitana, crema de trufa, mozzarella fior di latte, champiñones, jamón serrano, stracciatella y aceite de trufa',
  note: 'No está en Glovo. Pregunta por ella al encargar.',
  mentions: 8,
};

export const DRINKS = [
  { name: 'Agua 500 ml', price: 2 },
  { name: 'Agua 1,5 l', price: 3.5 },
  { name: 'Refrescos en lata (Coca-Cola, Coca-Cola Zero, Fanta naranja y limón, Aquarius limón)', price: 2 },
  { name: 'Cerveza Amstel 330 ml', price: 2.5 },
];

export const HOURS = {
  // 0 = domingo … 6 = sábado. Fuente: Google Maps, 2 oct 2026.
  0: ['19:00', '22:30'],
  1: null,
  2: ['19:00', '22:30'],
  3: ['19:00', '22:30'],
  4: ['19:00', '22:30'],
  5: ['19:00', '23:00'],
  6: ['19:00', '23:00'],
};

export const CONTACT = {
  phone: '611 77 65 51',
  tel: '+34611776551',
  whatsapp: 'https://wa.me/34611776551?text=' + encodeURIComponent('¡Hola! Quiero encargar para recoger: '),
  instagram: 'https://www.instagram.com/pizzadelbarriodenia/',
  instagramHandle: '@pizzadelbarriodenia',
  street: 'Pg. del Saladar, 67, E',
  streetLong: 'Passeig del Saladar, 67',
  postal: '03700',
  city: 'Dénia',
  region: 'Alicante',
  lat: 38.8386301,
  lng: 0.1094873,
  glovo: 'https://glovoapp.com/es/es/denia/stores/bocca-di-forno-denia',
  maps: 'https://www.google.com/maps/search/?api=1&query=Pizza%20del%20Barrio%2C%20Pg.%20del%20Saladar%2067%2C%20D%C3%A9nia',
  rating: '4,9',
  reviews: 262,
};
