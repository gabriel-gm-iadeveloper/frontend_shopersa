// Fallback estático para detalle de producto cuando el backend no responde
// Mantén este archivo pequeño y representativo. Puedes ampliarlo si necesitas más casos.
const STATIC_PRODUCTS = [
  {
    id: 101,
    nombre: 'Polera Negra',
    precio: 12990,
    es_oferta: true,
    precio_oferta: 9990,
    stock: 12,
    categoria: 'Ropa',
    imagenes: ['/img/polera1.1.jpg', '/img/polera1.2.jpg', '/img/polera1.3.jpg'],
    descripcion: 'Polera negra básica de algodón.',
  },
  {
    id: 102,
    nombre: 'Polera Blanca',
    precio: 13990,
    es_oferta: false,
    stock: 8,
    categoria: 'Ropa',
    imagenes: ['/img/polera2.1.jpg', '/img/polera2.2.jpg', '/img/polera2.3.jpg'],
    descripcion: 'Polera blanca clásica, cómoda y versátil.',
  },
  {
    id: 103,
    nombre: 'Polera Estampada',
    precio: 14990,
    es_oferta: true,
    precio_oferta: 11990,
    stock: 5,
    categoria: 'Ropa',
    imagenes: ['/img/polera3.1.jpg', '/img/polera3.2.jpg', '/img/polera3.3.jpg'],
    descripcion: 'Polera con estampado original.',
  },
  {
    id: 104,
    nombre: 'Polera Azul',
    precio: 12990,
    es_oferta: false,
    stock: 20,
    categoria: 'Ropa',
    imagenes: ['/img/polera4.1.jpg', '/img/polera4.2.jpg', '/img/polera4.3.jpg'],
    descripcion: 'Polera azul de algodón suave.',
  },
];

export default STATIC_PRODUCTS;