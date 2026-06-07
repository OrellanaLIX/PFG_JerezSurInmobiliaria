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

  // Crea una nueva cita desde el panel admin usando el endpoint dedicado que no deduplica por teléfono
  crear: async (cita: NuevaCita): Promise<Cita> => {
    const { data } = await api.post<Cita>('/citas/admin/crear', cita);
    return data;
  },

  // Acepta una cita pendiente y la asigna al trabajador indicado (o al logueado si no se especifica)
  aceptar: async (citaId: number, trabajadorId?: number | null): Promise<Cita> => {
    const tid = trabajadorId ?? getTrabajadorId();
    const { data } = await api.patch<Cita>(
      `/citas/${citaId}/aceptar?trabajadorId=${tid}`
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
