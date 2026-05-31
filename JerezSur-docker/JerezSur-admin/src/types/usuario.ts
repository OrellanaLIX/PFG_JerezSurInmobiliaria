// ==========================================
// ENUMS Y TIPOS AUXILIARES
// ==========================================

export type OrigenUsuario =
  | 'AUTOREGISTRO'
  | 'OAUTH'
  | 'CRM_TRABAJADOR'
  | 'WEB_CITA'
  | 'WEB_VENTA';

export type Role =
  | 'ROLE_ADMIN' // Administradores de la Web (YO)
  | 'ROLE_TRABAJADOR' // Trabajadores de JerezSur
  | 'ROLE_INTERESADO' // Interesados y/o compradores de inmuebles
  | 'ROLE_VENDEDOR' // Vendedores de inmuebles
  | 'ROLE_AMBOS' // Usuarios que son tanto interesados como vendedores
  | 'ROLE_NOROLE'; // Usuarios sin rol asignado (posible estado inicial o error)

export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'FACEBOOK' | 'APPLE'; // Ajusta según tu backend

// ==========================================
// INTERFAZ PRINCIPAL (EQUIVALENTE A LA ENTIDAD)
// ==========================================

export interface Usuario {
  id: number;
  nombre: string;
  cuentaActivada: boolean;
  verified: boolean;
  cambiarPasswd: boolean;
  origen: OrigenUsuario;
  role: Role;
  fechaRegistro: string;           // ISO 8601: "2026-05-27T08:42:00"
  fechaUltimaActualizacion: string; // ISO 8601

  // Campos opcionales (nullable = true o relaciones)
  email?: string;
  telefono?: string;
  apellidos?: string;
  password?: string; // Normalmente no se envía al frontend, pero se incluye por la entidad
  dni?: string;
  imagenPerfilUrl?: string;
  comentarios?: string;
  provider?: AuthProvider;
  providerId?: string;

  // IDs de relaciones (en el frontend es mejor manejar IDs que el objeto completo anidado)
  trabajadorId?: number;
  interesadoId?: number;
  vendedorId?: number;
  citasIds?: number[];
}

// ==========================================
// DTO PARA CREACIÓN / REGISTRO
// ==========================================

export interface NuevoUsuario {
  nombre: string;
  email?: string;
  telefono?: string;
  apellidos?: string;
  password?: string;
  dni?: string;
  origen?: OrigenUsuario;
}

// ==========================================
// SUB-PERFILES ESPECÍFICOS
// ==========================================

export interface TrabajadorPerfil {
  id: number;
  dni: string;
  cargo?: string;
  fechaInicioContrato: string; // ISO Date "YYYY-MM-DD"
  fechaFinContrato?: string;
  activo: boolean;
  observacionesLaborales?: string;
}

export interface InteresadoPerfil {
  id: number;
  estado: 'INTERESADO' | 'ACTIVO' | 'NEGOCIACION' | 'CONTRATADO' | 'DESCARTADO'; // Ajusta según tu EstadoComprador
  requiereHipoteca: boolean;
  detallesHipoteca?: string;
  presupuestoMaximo?: number;
  zonaInteres?: string;
  habitacionesMinimas?: number;
  banosMinimos?: number;
  tipoInmueblePreferido?: string;
  tipoBusqueda?: 'VENTA' | 'ALQUILER' | 'CUALQUIERA'; // Ajusta según tu TipoOperacion
  observaciones?: string;
}

export interface VendedorPerfil {
  id: number;
  observaciones?: string;
}

// ==========================================
// INTERFAZ EXTENDIDA PARA DETALLE
// ==========================================

export interface UsuarioDetalle extends Usuario {
  // Ahora el backend nos inyectará el objeto completo cuando lo pidamos por ID
  trabajador?: TrabajadorPerfil;
  interesado?: InteresadoPerfil;
  vendedor?: VendedorPerfil;
}