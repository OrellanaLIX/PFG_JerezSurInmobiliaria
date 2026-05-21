import api from './api';
import type { Dashboard, Tarea, NuevaTarea } from '../types/dashboard';

export const dashboardService = {
  get: async (): Promise<Dashboard> => {
    const { data } = await api.get<Dashboard>('/dashboard');
    return data;
  },

  crearTarea: async (tarea: NuevaTarea): Promise<Tarea> => {
    const { data } = await api.post<Tarea>('/dashboard/tareas', tarea);
    return data;
  },

  completarTarea: async (id: number): Promise<Tarea> => {
    const { data } = await api.patch<Tarea>(`/dashboard/tareas/${id}/completar`);
    return data;
  },

  eliminarTarea: async (id: number): Promise<void> => {
    await api.delete(`/dashboard/tareas/${id}`);
  },
};