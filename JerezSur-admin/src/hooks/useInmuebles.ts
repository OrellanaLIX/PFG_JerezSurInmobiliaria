import { useState, useEffect, useCallback } from 'react';
import { inmuebleService } from '../services/inmuebleService';
import type { Inmueble, NuevoInmueble, InmuebleDetalle } from '../types/inmueble';

export const useInmuebles = () => {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState<InmuebleDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inmuebleService.getTodos();
      setInmuebles(data);
    } catch {
      setError('Error al cargar el catálogo de inmuebles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cargarDetalle = async (id: number) => {
    try {
      setLoadingDetalle(true);
      const data = await inmuebleService.getPorId(id);
      setInmuebleSeleccionado(data);
    } catch {
      setError('Error al recuperar la ficha del inmueble');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const limpiarSeleccionado = () => setInmuebleSeleccionado(null);

  const crear = async (inmueble: NuevoInmueble) => {
    await inmuebleService.crear(inmueble);
    await cargar();
  };

  const actualizar = async (id: number, inmuebleData: Partial<InmuebleDetalle>) => {
    await inmuebleService.actualizar(id, inmuebleData);
    await cargar();
    if (inmuebleSeleccionado?.id === id) {
      await cargarDetalle(id);
    }
  };

  const eliminar = async (id: number) => {
    await inmuebleService.eliminar(id);
    await cargar();
  };

  return {
    inmuebles,
    inmuebleSeleccionado,
    loading,
    loadingDetalle,
    error,
    cargar,
    cargarDetalle,
    limpiarSeleccionado,
    crear,
    actualizar,
    eliminar,
  };
};