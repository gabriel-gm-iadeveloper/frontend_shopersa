import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const AUTH_STORAGE_PREFIX = import.meta.env.VITE_AUTH_STORAGE_KEY || 'SHOPERSA';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper para obtener token (localStorage primero, luego sessionStorage)
const getToken = () => {
  const fromLocal = localStorage.getItem(`${AUTH_STORAGE_PREFIX}:authToken`);
  const fromSession = sessionStorage.getItem('authToken');
  return fromLocal || fromSession || null;
};

// Request interceptor: añade Authorization Bearer
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: manejo de errores y 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Limpia sesión y redirige a login
      localStorage.removeItem(`${AUTH_STORAGE_PREFIX}:authToken`);
      localStorage.removeItem(`${AUTH_STORAGE_PREFIX}:usuarioLogueado`);
      sessionStorage.clear();
      // Evita la redirección si ya estamos en login
      const isLogin = window.location.pathname.includes('iniciosesion');
      if (!isLogin) {
        window.location.href = '/iniciosesion';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;