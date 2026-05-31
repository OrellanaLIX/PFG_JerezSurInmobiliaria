import api from './api';
import type { LoginRequest, LoginResponse } from '../types/auth';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const payload = {
      username: credentials.email,
      password: credentials.password
    };
    const { data } = await api.post<LoginResponse>('/usuarios/login', payload);

    if (!data.token) {
      throw new Error(data.email || 'Credenciales inválidas');
    }

    // Guardar en localStorage
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      userId: data.userId,
      nombre: data.nombre,
      email: data.email,
      role: data.role,
    }));

    return data;
  },

  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};