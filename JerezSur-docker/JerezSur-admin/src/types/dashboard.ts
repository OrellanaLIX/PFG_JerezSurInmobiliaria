// Tipos TypeScript para el dashboard: KPIs, tareas y datos del panel de control.
export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  enlace?: string;
  etiquetaEnlace?: string;
  fechaCreacion: string;
}

export interface Dashboard {
  inmueblesActivos: number;
  clientesNuevos: number;
  visitasProgramadas: number;
  contratosPendientes: number;
  tareas: Tarea[];
}

export interface NuevaTarea {
  titulo: string;
  descripcion?: string;
  fecha: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  enlace?: string;
  etiquetaEnlace?: string;
}