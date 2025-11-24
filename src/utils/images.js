// Helper para construir URLs de imagen del backend
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_HOST = API_BASE.replace(/\/api\/?$/, '');

export const resolveImageUrl = (src) => {
  if (!src) return '/img/modelo.jpg';
  // Si ya es absoluta, úsala tal cual
  if (/^https?:\/\//i.test(src)) return src;
  // Si comienza con '/', la convertimos a absoluta usando el host del backend
  if (src.startsWith('/')) return `${API_HOST}${src}`;
  // Si es relativa (sin '/'), úsala tal cual (o ajusta si tu backend lo requiere)
  return src;
};
export default resolveImageUrl;