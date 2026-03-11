import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true // Necesario para sesiones y seguridad
});

export const getInmuebles = () => api.get('/inmuebles');
export default api;