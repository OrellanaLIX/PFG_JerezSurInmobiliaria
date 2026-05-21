// =============================================================================
// CLIENTE HTTP CENTRALIZADO — Axios con interceptores JWT
// Toda petición al backend pasa por aquí
// =============================================================================
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

// --- Configuración base ---
const API_BASE_URL = 'http://localhost:8080/api'; // Nginx redirige a http://localhost:8080
const REQUEST_TIMEOUT_MS = 30_000; // 30 segundos
const TOKEN_STORAGE_KEY = 'accessToken';

// --- Instancia de Axios ---
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// =============================================================================
// INTERCEPTOR DE PETICIONES — Inyecta el token JWT automáticamente
// =============================================================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Si se envía FormData (subida de imágenes), eliminar Content-Type
    // para que el navegador asigne el boundary automáticamente
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// =============================================================================
// INTERCEPTOR DE RESPUESTAS — Manejo de errores globales
// =============================================================================
api.interceptors.response.use(
  (response: AxiosResponse) => response,

  (error: AxiosError<ApiErrorResponse>) => {
    // ── Sin respuesta del servidor (timeout o caída) ──
    if (!error.response) {
      const networkError: ApiError = {
        status: 0,
        message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
        timestamp: new Date().toISOString(),
      };
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // ── Sesión expirada o sin permisos ──
    if (status === 401 || status === 403) {
      handleSessionExpired();
    }

    // ── Construir error normalizado ──
    const apiError: ApiError = {
      status,
      message: data?.message ?? getDefaultErrorMessage(status),
      errors: data?.errors,
      timestamp: data?.timestamp ?? new Date().toISOString(),
    };

    return Promise.reject(apiError);
  }
);

// =============================================================================
// UTILIDADES INTERNAS
// =============================================================================

/**
 * Limpia la sesión y redirige al login.
 * Solo redirige si no estamos ya en /login (evita loops).
 */
function handleSessionExpired(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem('user');

  const currentPath = window.location.pathname;
  if (!currentPath.includes('/login')) {
    window.location.href = '/dashboard/login';
  }
}

/**
 * Mensajes legibles por código HTTP.
 */
function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Solicitud incorrecta. Verifica los datos enviados.',
    401: 'Sesión expirada. Inicia sesión nuevamente.',
    403: 'No tienes permisos para realizar esta acción.',
    404: 'Recurso no encontrado.',
    409: 'Conflicto: el recurso ya existe o está en uso.',
    422: 'Datos inválidos. Revisa el formulario.',
    500: 'Error interno del servidor. Inténtalo más tarde.',
    502: 'Servidor no disponible.',
    503: 'Servicio temporalmente fuera de servicio.',
  };
  return messages[status] ?? `Error inesperado (${status}).`;
}

// =============================================================================
// TIPOS PÚBLICOS
// =============================================================================

/**
 * Estructura estándar de respuesta de error desde Spring Boot.
 */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string>; // Errores de validación por campo
  timestamp?: string;
  path?: string;
}

/**
 * Error normalizado que reciben los componentes/hooks.
 */
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
  timestamp: string;
}

/**
 * Type guard para detectar errores de API en bloques catch.
 *
 * @example
 * try {
 *   await api.get('/inmuebles');
 * } catch (err) {
 *   if (isApiError(err)) {
 *     console.error(err.status, err.message);
 *   }
 * }
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
}

export default api;