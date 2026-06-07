// Cliente base para las peticiones al backend de JerezSur.
// Añade automáticamente el token JWT si el usuario está autenticado.

const API_BASE = '/api';

// Lee el token del localStorage — soporta 'token' y 'accessToken'
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

// Función genérica de petición con manejo de errores consistente
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers as object) },
  });

  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    let msg = `HTTP ${res.status}`;
    try {
      if (ct.includes('json')) {
        const data = await res.json();
        msg = data?.error || data?.message || msg;
      }
    } catch { /* ignorar error de parseo */ }
    throw new Error(msg);
  }

  // 204 No Content: no hay cuerpo que parsear
  if (res.status === 204) return null as T;

  return res.json();
}

// Interfaz del cliente API
export const api = {
  get:    <T>(url: string) =>
    request<T>(url),
  post:   <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch:  <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
};

export default api;
