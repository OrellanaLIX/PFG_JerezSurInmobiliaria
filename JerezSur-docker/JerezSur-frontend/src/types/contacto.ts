// Tipos para los formularios de contacto del frontend público de JerezSur

export interface MensajeContactoPayload {
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  mensaje: string;
  inmuebleId?: number | null;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
}

export type FormStatus = 'idle' | 'sending' | 'success' | 'error';
