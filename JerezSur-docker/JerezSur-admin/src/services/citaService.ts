// Servicio de citas para el panel de administración.
// Llama a los endpoints del backend para gestionar el ciclo de vida de cada cita.
import api from './api';
import { authService } from './authService';
import type { Cita, NuevaCita } from '../types/cita';

// Obtiene el ID del trabajador logueado desde localStorage
// Se usa para asignar la cita al trabajador que la acepta
const getTrabajadorId = (): number => {
  const user = authService.getUser();
  return user?.trabajadorId ?? 1;
};

export const citaService = {
  // Carga todas las citas del sistema (no solo las del trabajador logueado)
  getMisCitas: async (): Promise<Cita[]> => {
    const { data } = await api.get<Cita[]>('/citas/todas');
    return data;
  },

  // Crea una nueva cita desde el panel admin (el trabajador la crea manualmente)
  crear: async (cita: NuevaCita): Promise<Cita> => {
    const { data } = await api.post<Cita>('/citas/solicitar', {
      ...cita,
      aceptaPrivacidad: true,
    });
    return data;
  },

  // Acepta una cita pendiente y la asigna al trabajador logueado
  aceptar: async (citaId: number): Promise<Cita> => {
    const { data } = await api.patch<Cita>(
      `/citas/${citaId}/aceptar?trabajadorId=${getTrabajadorId()}`
    );
    return data;
  },

  // Marca la cita como completada (la visita tuvo lugar)
  completar: async (citaId: number): Promise<Cita> => {
    const { data } = await api.patch<Cita>(`/citas/${citaId}/completar`);
    return data;
  },

  // Cancela la cita (queda en BD para el histórico)
  cancelar: async (citaId: number): Promise<Cita> => {
    const { data } = await api.patch<Cita>(`/citas/${citaId}/cancelar`);
    return data;
  },

  // Marca la cita como "no presentado" cuando el cliente no acudió
  noPresentado: async (citaId: number): Promise<Cita> => {
    const { data } = await api.patch<Cita>(`/citas/${citaId}/no-presentado`);
    return data;
  },
};
