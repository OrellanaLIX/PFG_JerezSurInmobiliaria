// Hook personalizado que gestiona el estado de las citas en el panel admin.
// Carga las citas del backend y expone funciones para cada acción posible sobre ellas.
// Después de cada mutación recarga la lista para que los cambios se vean al momento.
import { useState, useEffect, useCallback } from 'react';
import { citaService } from '../services/citaService';
import type { Cita, NuevaCita } from '../types/cita';

export const useCitas = () => {
  // Lista completa de citas cargadas del backend
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carga todas las citas del sistema desde la API
  const cargar = useCallback(async () => {
    try {
      setError(null);
      const data = await citaService.getMisCitas();
      setCitas(data);
    } catch {
      setError('No se pudieron cargar las citas. Comprueba tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargamos las citas la primera vez que el componente que usa el hook se monta
  useEffect(() => {
    cargar();
  }, [cargar]);

  // Todas las mutaciones propagan el error al componente que llama
  // para que pueda mostrarlo con FeedbackBanner

  // Crea una nueva cita y recarga la lista
  const crear = async (cita: NuevaCita) => {
    await citaService.crear(cita);
    await cargar();
  };

  // Acepta una cita (la asigna al trabajador logueado) y recarga
  const aceptar = async (id: number) => {
    await citaService.aceptar(id);
    await cargar();
  };

  // Marca la cita como realizada y recarga
  const completar = async (id: number) => {
    await citaService.completar(id);
    await cargar();
  };

  // Cancela la cita y recarga
  const cancelar = async (id: number) => {
    await citaService.cancelar(id);
    await cargar();
  };

  // Marca la cita como "cliente no presentado" y recarga
  const noPresentado = async (id: number) => {
    await citaService.noPresentado(id);
    await cargar();
  };

  return {
    citas,
    loading,
    error,
    cargar,
    crear,
    aceptar,
    completar,
    cancelar,
    noPresentado,
  };
};
