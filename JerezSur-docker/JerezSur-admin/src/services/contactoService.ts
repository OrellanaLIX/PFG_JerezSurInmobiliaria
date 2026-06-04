// Servicio de mensajes de contacto del panel admin: peticiones al backend para listar,
// actualizar (marcar como leído) y eliminar mensajes recibidos desde la web pública.
import api from './api';
import type { MensajeContacto, NuevoMensajeContacto, MensajeContactoDetalle } from '../types/contacto';

export const contactoService = {
  getTodos: async (): Promise<MensajeContacto[]> => {
    const { data } = await api.get<{ content: MensajeContacto[] }>('/contactos');
    return Array.isArray((data as any).content) ? (data as any).content : (data as unknown as MensajeContacto[]);
  },

  getPorId: async (id: number): Promise<MensajeContactoDetalle> => {
    const { data } = await api.get<MensajeContactoDetalle>(`/contactos/${id}`);
    return data;
  },

  crear: async (contacto: NuevoMensajeContacto): Promise<MensajeContacto> => {
    const payload = {
      nombre: contacto.nombre,
      email: contacto.email,
      telefono: contacto.telefono,
      mensaje: contacto.mensaje,
      inmueble: contacto.inmuebleId ? { id: contacto.inmuebleId } : null
    };

    const { data } = await api.post<MensajeContacto>('/contactos/enviar', payload);
    return data;
  },

  // Actualiza el estado leído/no leído — el backend devuelve {id, leido, ok}
  actualizar: async (id: number, contactoData: Partial<MensajeContactoDetalle>): Promise<any> => {
    const { data } = await api.put(`/contactos/${id}`, contactoData);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/contactos/${id}`);
  }
};