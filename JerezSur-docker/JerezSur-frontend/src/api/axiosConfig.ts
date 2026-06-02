// Configuración global de Axios para el frontend público.
// Todos los servicios del frontend importan este objeto para que la URL base sea siempre /api.
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;