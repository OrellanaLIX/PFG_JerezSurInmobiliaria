import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// USAREMOS SIEMPRE 'accessToken'
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // 👈 Asegúrate que sea este nombre
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/dashboard/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;