// Servicio de mensajes de contacto para el frontend público de JerezSur.
// Usado por el formulario de contacto, la página de vender y el onboarding.
import type { MensajeContactoPayload } from '../types/contacto';

export const contactoService = {
  // Envía un mensaje de contacto desde cualquier formulario de la web
  // El backend lo guarda en BD y manda una notificación al admin por WhatsApp
  enviar: async (data: MensajeContactoPayload): Promise<void> => {
    const res = await fetch('/api/contactos/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        msg = body?.error || body?.message || msg;
      } catch { /* ignorar */ }
      throw new Error(msg);
    }
  },
};
