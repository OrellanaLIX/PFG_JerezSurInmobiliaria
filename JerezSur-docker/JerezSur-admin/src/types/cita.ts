// Tipos TypeScript para las citas: estructura de datos que devuelve el backend.
export type EstadoCita =
  | 'PENDIENTE_ASIGNACION'
  | 'CONFIRMADA'
  | 'COMPLETADA'
  | 'CANCELADA'
  | 'NO_PRESENTADO';

export interface Cita {
  id: number;
  nombreCliente: string;
  telefonoCliente: string;
  fechaHora: string; // ISO 8601: "2026-05-25T17:30:00"
  motivo?: string;
  estado: EstadoCita;
  nombreTrabajador?: string;
  direccionInmueble?: string;
  inmuebleId?: number;
}

export interface NuevaCita {
  telefono: string;
  nombre: string;
  email?: string;
  fechaHora: string;
  motivo?: string;
  inmuebleId?: number;
}