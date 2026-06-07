// Tipos del usuario para el frontend público de JerezSur

export interface StoredUser {
  id: number | string;
  nombre?: string;
  email?: string;
  telefono?: string;
  token?: string;
  role?: string;
  [key: string]: unknown;
}

export interface AuthUser {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  token?: string;
  role?: string;
}

export type UserRole =
  | 'ROLE_ADMIN'
  | 'ROLE_TRABAJADOR'
  | 'ROLE_NOROL'
  | 'ROLE_INTERESADO'
  | 'ROLE_VENDEDOR'
  | 'ROLE_AMBOS';

export type Perfil = '' | 'interesado' | 'propietario' | 'ambos';

export interface UsuarioPerfil {
  id: number;
  email: string | null;
  telefono: string | null;
  nombre: string | null;
  apellidos: string | null;
  dni: string | null;
  imagenPerfilUrl: string | null;
  role: string;
  cambiarPasswd: boolean;
  interesadoId: number | null;
  vendedorId: number | null;
  zonaInteres: string | null;
  presupuestoMaximo: string | null;
  habitacionesMinimas: number | null;
  banosMinimos: number | null;
  tipoBusqueda: string | null;
  observacionesInteresado: string | null;
  observacionesVendedor: string | null;
}
