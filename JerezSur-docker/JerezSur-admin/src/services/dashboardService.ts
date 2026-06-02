// Servicio que conecta el dashboard del admin con los endpoints del backend.
// Cada método corresponde a una operación en DashboardController.java.
import api from './api';
import type { Dashboard, Tarea, NuevaTarea } from '../types/dashboard';

export const dashboardService = {
  // Carga los datos del panel: KPIs (inmuebles, clientes, citas, contratos) y lista de tareas
  get: async (): Promise<Dashboard> => {
    const { data } = await api.get<Dashboard>('/dashboard');
    return data;
  },

  // Crea una tarea manual en el panel (además de las automáticas del sistema)
  crearTarea: async (tarea: NuevaTarea): Promise<Tarea> => {
    const { data } = await api.post<Tarea>('/dashboard/tareas', tarea);
    return data;
  },

  // Marca una tarea como completada — en el backend esto la elimina de la BD
  completarTarea: async (id: number): Promise<Tarea> => {
    const { data } = await api.patch<Tarea>(`/dashboard/tareas/${id}/completar`);
    return data;
  },

  // Elimina una tarea directamente sin marcarla como completada
  eliminarTarea: async (id: number): Promise<void> => {
    await api.delete(`/dashboard/tareas/${id}`);
  },
};