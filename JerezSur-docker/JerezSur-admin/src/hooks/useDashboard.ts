// Hook personalizado que gestiona el estado del dashboard del admin.
// Encapsula la carga de datos y las operaciones CRUD de tareas para que
// el componente DashboardResumen no tenga que saber cómo funciona la API.
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { Dashboard, NuevaTarea } from '../types/dashboard';

export const useDashboard = () => {
  // Datos del dashboard (KPIs + tareas) que vienen del backend
  const [data, setData] = useState<Dashboard | null>(null);
  // true mientras se está cargando la primera vez (muestra spinner)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useCallback evita recrear la función en cada render, importante porque se usa en useEffect
  const cargar = useCallback(async () => {
    try {
      setError(null);
      const dashboard = await dashboardService.get();
      setData(dashboard);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo cargar el dashboard. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargamos los datos la primera vez que el hook se monta
  useEffect(() => {
    cargar();
  }, [cargar]);

  // Crea una tarea y recarga los datos para que la lista se actualice
  const crearTarea = async (tarea: NuevaTarea) => {
    await dashboardService.crearTarea(tarea);
    await cargar();
  };

  // Marca una tarea como completada (la elimina del backend) y recarga
  const completarTarea = async (id: number) => {
    await dashboardService.completarTarea(id);
    await cargar();
  };

  // Elimina una tarea directamente y recarga la lista
  const eliminarTarea = async (id: number) => {
    await dashboardService.eliminarTarea(id);
    await cargar();
  };

  return { data, loading, error, cargar, crearTarea, completarTarea, eliminarTarea };
};
