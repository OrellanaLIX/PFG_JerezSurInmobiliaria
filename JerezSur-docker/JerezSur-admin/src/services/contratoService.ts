// Servicio de contratos del admin: peticiones al backend para crear y gestionar contratos.
import api from './api';
import type { ContratoDetalle, CrearContratoData } from '../types/operacion';

export const contratoService = {
  generarBorrador: async (operacionId: number, datos: CrearContratoData): Promise<ContratoDetalle> => {
    const { data } = await api.post(`/contratos/operacion/${operacionId}/generar`, datos);
    return data;
  },

  listarPorOperacion: async (operacionId: number): Promise<ContratoDetalle[]> => {
    const { data } = await api.get(`/contratos/operacion/${operacionId}`);
    return Array.isArray(data) ? data : [];
  },

  subirPdf: async (contratoId: number, archivo: File) => {
    const form = new FormData();
    form.append('archivo', archivo);
    const { data } = await api.post(`/media/contrato/${contratoId}/documento`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
