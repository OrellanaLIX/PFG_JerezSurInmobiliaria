import api from './api';
import type { Cita, NuevaCita } from '../types/cita';
import { TRABAJADOR_ID_TEMPORAL } from '../config/constants';

export const citaService = {
  getMisCitas: async (): Promise<Cita[]> => {
    const { data } = await api.get<Cita[]>('/citas/todas');
    return data;
  },

  crear: async (cita: NuevaCita): Promise<Cita> => {
    // Reutilizamos el endpoint público porque la lógica es idéntica:
    // crear/buscar usuario por teléfono + generar tarea global
    const { data } = await api.post<Cita>('/citas/solicitar', {
      ...cita,
      aceptaPrivacidad: true, // el trabajador asume el consentimiento
    });
    return data;
  },

  aceptar: async (citaId: number): Promise<Cita> => {
    const { data } = await api.patch<Cita>(
      `/citas/${citaId}/aceptar?trabajadorId=${TRABAJADOR_ID_TEMPORAL}`
    );
    return data;
  },

  completar: async (citaId: number): Promise<Cita> => {
    const { data } = await api.patch<Cita>(`/citas/${citaId}/completar`);
    return data;
  },

  cancelar: async (citaId: number): Promise<Cita> => {
    const { data } = await api.patch<Cita>(`/citas/${citaId}/cancelar`);
    return data;
  },

  noPresentado: async (citaId: number): Promise<Cita> => {
    const { data } = await api.patch<Cita>(`/citas/${citaId}/no-presentado`);
    return data;
  },
};