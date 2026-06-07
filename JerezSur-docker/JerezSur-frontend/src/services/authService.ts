// Servicio de autenticación para el frontend público de JerezSur.
// Gestiona login, registro, recuperación de contraseña y auth social.
import type { LoginResponse, RegistroRequest } from '../types/auth';

const API = '/api';

export const authService = {
  // Login con email/teléfono y contraseña local
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(`${API}/usuarios/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'Credenciales incorrectas');
    }
    return res.json();
  },

  // Registro de nuevo usuario con email y contraseña
  registro: async (data: RegistroRequest): Promise<LoginResponse> => {
    const res = await fetch(`${API}/usuarios/registro`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || 'Error al registrarse');
    }
    return res.json();
  },

  // Login con token de Google OAuth
  loginGoogle: async (token: string): Promise<LoginResponse> => {
    const res = await fetch(`${API}/usuarios/auth/google`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || 'Error con Google');
    }
    return res.json();
  },

  // Login con token de Facebook
  loginFacebook: async (token: string): Promise<LoginResponse> => {
    const res = await fetch(`${API}/usuarios/auth/facebook`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || 'Error con Facebook');
    }
    return res.json();
  },

  // Login con datos de Apple Sign In
  loginApple: async (email: string | null, name: string | null, token: string): Promise<LoginResponse> => {
    const res = await fetch(`${API}/usuarios/auth/apple`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, name, token }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || 'Error con Apple');
    }
    return res.json();
  },

  // Solicita el email de recuperación de contraseña
  solicitarRecuperacion: async (email: string): Promise<void> => {
    const res = await fetch(`${API}/auth/solicitar-recuperacion`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Error al solicitar recuperación');
  },

  // Restablece la contraseña usando el token del email
  resetPassword: async (token: string, nuevaPassword: string): Promise<void> => {
    const res = await fetch(`${API}/auth/reset-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, nuevaPassword }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || 'Error al restablecer contraseña');
    }
  },
};
