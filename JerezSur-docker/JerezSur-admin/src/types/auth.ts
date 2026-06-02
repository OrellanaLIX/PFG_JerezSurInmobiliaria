// Tipos TypeScript para la autenticación del panel de administración.
// Estas interfaces describen la forma de los datos que enviamos y recibimos del backend.

// Lo que mandamos al endpoint de login
export interface LoginRequest {
  email: string;
  password: string;
}

// Lo que nos devuelve el backend si el login tiene éxito
export interface LoginResponse {
  // JWT que incluimos en cada petición como "Authorization: Bearer <token>"
  token: string;
  userId: number;
  // trabajadorId es opcional porque un admin podría no tener perfil de trabajador
  trabajadorId?: number;
  nombre: string;
  email: string;
  // Rol del usuario: ROLE_ADMIN, ROLE_TRABAJADOR, etc.
  role: string;
  esTrabajador: boolean;
}

// Datos del usuario que guardamos en el contexto de React tras el login
export interface AuthUser {
  userId: number;
  trabajadorId?: number;
  nombre: string;
  email: string;
  role: string;
}