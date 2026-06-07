// Tipos para el sistema de citas del frontend público de JerezSur

export type EstadoCita =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'REALIZADA'
  | 'CANCELADA'
  | 'NO_PRESENTADO';

export interface CitaDTO {
  id: number;
  fechaHora: string;
  motivo?: string;
  estado: EstadoCita;
  nombreTrabajador?: string;
  direccionInmueble?: string;
  inmuebleId?: number;
  inmuebleTitulo?: string;
  nombreCliente?: string;
  telefonoCliente?: string;
}

export interface NuevaCitaUsuario {
  usuarioId: number;
  fechaHora: string;
  inmuebleId?: number | null;
  motivo?: string | null;
}

export interface NuevaCitaAnonima {
  nombre: string;
  telefono: string;
  email?: string | null;
  fechaHora: string;
  inmuebleId?: number | null;
  motivo?: string | null;
  aceptaPrivacidad: boolean;
}

export interface NuevaCitaForm {
  fechaDate: string;
  fechaTime: string;
  motivo: string;
}
