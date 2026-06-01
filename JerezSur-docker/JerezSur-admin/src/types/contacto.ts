// ==========================================
// INTERFAZ PRINCIPAL (LISTADO LIGERO)
// ==========================================
export interface MensajeContacto {
  id: number;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  leido: boolean;
  fechaEnvio?: string | null;
}

// ==========================================
// INTERFAZ EXTENDIDA PARA DETALLE
// ==========================================
export interface MensajeContactoDetalle extends MensajeContacto {
  mensaje: string;
  
  // Relación opcional con el inmueble de interés
  inmueble?: {
    id: number;
    referencia: string;
    titulo: string;
    precio: number;
  };
}

// DTO para simular un envío desde el formulario público de la web
export interface NuevoMensajeContacto {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
  inmuebleId?: number; // Opcional por si es consulta general
}