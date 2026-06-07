// Helpers para leer y escribir en localStorage de forma segura.
// Centraliza toda la lógica de persistencia de sesión en un solo lugar.
import type { StoredUser } from '../types/user';

// ── Claves usadas en localStorage ───────────────────────────────────────────
const USUARIO_KEY  = 'usuario';
const TOKEN_KEY    = 'token';
const TOKEN_KEY_ALT = 'accessToken';

// ── Usuario ──────────────────────────────────────────────────────────────────

/** Lee el usuario del localStorage y lo parsea. Devuelve null si no existe o si el JSON está corrupto. */
export function getStoredUser(): StoredUser | null {
  const json = localStorage.getItem(USUARIO_KEY);
  if (!json) return null;
  try {
    return JSON.parse(json) as StoredUser;
  } catch {
    // Si el JSON está mal formado (p.ej. localStorage corrupto) no rompemos la app
    return null;
  }
}

/** Serializa el usuario completo y lo guarda en localStorage para mantener la sesión entre recargas. */
export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USUARIO_KEY, JSON.stringify(user));
}

/**
 * Actualiza solo los campos que han cambiado del usuario en localStorage (p.ej. nombre o foto de perfil).
 * Usamos spread para no sobreescribir los campos que no se modifican, como el token o el rol.
 */
export function updateStoredUser(updates: Partial<StoredUser>): void {
  const current = getStoredUser();
  if (!current) return;
  setStoredUser({ ...current, ...updates });
}

// ── Token JWT ────────────────────────────────────────────────────────────────

/**
 * Lee el token JWT del localStorage. Soporta dos claves porque los flujos de login social
 * guardan el token como 'accessToken' mientras que el login local usa 'token'.
 */
export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY_ALT) || '';
}

/** Guarda el token JWT tras un login exitoso para que las siguientes peticiones lo incluyan. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// ── Sesión completa ──────────────────────────────────────────────────────────

/**
 * Elimina todos los datos de sesión del localStorage.
 * Se llama al hacer logout o cuando el backend devuelve 401 (token expirado).
 * Limpiamos las dos claves del token para que no queden restos de sesiones antiguas.
 */
export function clearSession(): void {
  localStorage.removeItem(USUARIO_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY_ALT);
}

// Comprueba si hay una sesión activa (hay usuario y token en localStorage)
export function hasActiveSession(): boolean {
  return !!(getStoredUser()?.id && getToken());
}
