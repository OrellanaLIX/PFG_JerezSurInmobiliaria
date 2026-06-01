import { useState, useEffect, useCallback } from 'react';
import { citaService } from '../services/citaService';
import type { Cita, NuevaCita } from '../types/cita';

export const useCitas = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Todas las mutaciones propagan el error al componente que llama
  // para que pueda mostrarlo con FeedbackBanner

  const crear = async (cita: NuevaCita) => {
    await citaService.crear(cita);
    await cargar();
  };

  const aceptar = async (id: number) => {
    await citaService.aceptar(id);
    await cargar();
  };

  const completar = async (id: number) => {
    await citaService.completar(id);
    await cargar();
  };

  const cancelar = async (id: number) => {
    await citaService.cancelar(id);
    await cargar();
  };

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
