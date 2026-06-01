import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { Dashboard, NuevaTarea } from '../types/dashboard';

export const useDashboard = () => {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crearTarea = async (tarea: NuevaTarea) => {
    await dashboardService.crearTarea(tarea);
    await cargar();
  };

  const completarTarea = async (id: number) => {
    await dashboardService.completarTarea(id);
    await cargar();
  };

  const eliminarTarea = async (id: number) => {
    await dashboardService.eliminarTarea(id);
    await cargar();
  };

  return { data, loading, error, cargar, crearTarea, completarTarea, eliminarTarea };
};
