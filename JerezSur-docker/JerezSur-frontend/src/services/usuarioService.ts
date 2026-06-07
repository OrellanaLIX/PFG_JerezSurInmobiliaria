// Servicio de perfil de usuario para el frontend público de JerezSur.
// Gestiona la carga y actualización del perfil del usuario autenticado.
import type { UsuarioPerfil } from '../types/user';

const API = '/api';

function getToken(): string {
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
}

function authHeaders(): HeadersInit {
  const t = getToken();
  const base: HeadersInit = { 'Content-Type': 'application/json' };
  return t ? { ...base, Authorization: `Bearer ${t}` } : base;
}

export const usuarioService = {
  // Obtiene el perfil completo del usuario por ID
  getPerfil: async (id: number): Promise<UsuarioPerfil> => {
    const res = await fetch(`${API}/usuarios/${id}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Completa el perfil en el onboarding (primer acceso tras registro/verificación)
  completarPerfil: async (payload: Record<string, unknown>): Promise<void> => {
    const res = await fetch(`${API}/usuarios/completar`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(payload),
    });
    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      let msg = `Error ${res.status}`;
      try {
        if (ct.includes('json')) {
          const d = await res.json();
          msg = d?.error || d?.message || msg;
        }
      } catch { /* ignorar */ }
      throw new Error(msg);
    }
  },

  // Actualiza los datos del perfil del usuario
  actualizarPerfil: async (id: number, payload: Record<string, unknown>): Promise<UsuarioPerfil> => {
    const res = await fetch(`${API}/usuarios/${id}`, {
      method:  'PUT',
      headers: authHeaders(),
      body:    JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Sube la foto de perfil del usuario a Cloudinary
  subirFoto: async (usuarioId: number, archivo: File): Promise<{ url: string }> => {
    const fd = new FormData();
    fd.append('archivo', archivo);
    const t = getToken();
    const res = await fetch(`${API}/media/usuario/${usuarioId}/foto`, {
      method:  'POST',
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      body:    fd,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Elimina la cuenta del usuario (soft delete)
  eliminarCuenta: async (id: number): Promise<void> => {
    const res = await fetch(`${API}/usuarios/${id}`, {
      method:  'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  },
};
