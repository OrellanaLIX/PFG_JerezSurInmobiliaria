// Instancia de Axios configurada para el panel de administración.
// Todos los servicios del admin importan este objeto en lugar de usar fetch() directamente,
// así la URL base y el token JWT se añaden automáticamente a cada petición.
import axios from 'axios';

// Creamos la instancia con la URL base del backend y el tipo de contenido por defecto
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de PETICIÓN: añade el JWT a la cabecera Authorization de cada llamada
// El token se guarda con la clave 'accessToken' en localStorage al hacer login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de RESPUESTA: si el servidor devuelve 401 (no autenticado) o 403 (sin permisos),
// borramos la sesión y redirigimos al login para que el trabajador vuelva a identificarse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;