// Servicio de autenticación para el panel de administración.
// Gestiona el login, logout y la persistencia de la sesión en localStorage.
import api from './api';
import type { LoginRequest, LoginResponse } from '../types/auth';

// Claves usadas en localStorage para guardar la sesión del trabajador
const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export const authService = {
  // Hace la petición de login al backend y guarda el token en localStorage si tiene éxito
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // El backend espera 'username' aunque nosotros tengamos el campo como 'email'
    const payload = {
      username: credentials.email,
      password: credentials.password
    };
    const { data } = await api.post<LoginResponse>('/usuarios/login', payload);

    // Si no viene token en la respuesta, el login falló
    if (!data.token) {
      throw new Error(data.email || 'Credenciales inválidas');
    }

    // Guardamos el token y los datos del usuario para que persistan al recargar la página
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      userId: data.userId,
      trabajadorId: data.trabajadorId,
      nombre: data.nombre,
      email: data.email,
      role: data.role,
    }));

    return data;
  },

  // Limpia los datos de sesión de localStorage (cierra sesión localmente)
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Devuelve el token JWT guardado o null si no hay sesión activa
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Devuelve los datos del usuario guardados o null si no hay sesión
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  // Comprueba si hay un token en localStorage (no verifica su validez en el servidor)
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};