// Hook que gestiona el estado del catálogo de inmuebles en el panel admin.
// Carga todos los inmuebles al montarse y expone funciones CRUD para que las páginas no llamen al servicio directamente.
import { useState, useEffect, useCallback } from 'react';
import { inmuebleService } from '../services/inmuebleService';
import type { Inmueble, NuevoInmueble, InmuebleDetalle } from '../types/inmueble';

// Helper para extraer el mensaje de error de la respuesta del backend
const extractError = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object') {
    const e = err as any;
    return e?.response?.data?.error || e?.message || fallback;
  }
  return fallback;
};

export const useInmuebles = () => {
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState<InmuebleDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [creando, setCreando] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inmuebleService.getTodos();
      setInmuebles(data);
    } catch (err) {
      setError(extractError(err, 'Error al cargar el catálogo de inmuebles.'));
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
      setError(null);
      const data = await inmuebleService.getPorId(id);
      setInmuebleSeleccionado(data);
    } catch (err) {
      setError(extractError(err, 'Error al recuperar la ficha del inmueble.'));
      throw err;
    } finally {
      setLoadingDetalle(false);
    }
  };

  const limpiarSeleccionado = () => setInmuebleSeleccionado(null);

  const crear = async (inmueble: NuevoInmueble) => {
    try {
      setCreando(true);
      setError(null);
      const created = await inmuebleService.crear(inmueble);
      await cargar();
      return created;
    } catch (err) {
      setError(extractError(err, 'Error al crear el inmueble.'));
      throw err;
    } finally {
      setCreando(false);
    }
  };

  const actualizar = async (id: number, inmuebleData: Partial<InmuebleDetalle>) => {
    try {
      setActualizando(true);
      setError(null);
      await inmuebleService.actualizar(id, inmuebleData);
      await cargar();
      if (inmuebleSeleccionado?.id === id) {
        await cargarDetalle(id);
      }
    } catch (err) {
      setError(extractError(err, 'Error al actualizar el inmueble.'));
      throw err;
    } finally {
      setActualizando(false);
    }
  };

  const eliminar = async (id: number) => {
    try {
      setEliminando(true);
      setError(null);
      await inmuebleService.eliminar(id);
      await cargar();
      if (inmuebleSeleccionado?.id === id) {
        limpiarSeleccionado();
      }
    } catch (err) {
      setError(extractError(err, 'Error al eliminar el inmueble.'));
      throw err;
    } finally {
      setEliminando(false);
    }
  };

  return {
    inmuebles,
    inmuebleSeleccionado,
    loading,
    loadingDetalle,
    creando,
    actualizando,
    eliminando,
    error,
    cargar,
    cargarDetalle,
    limpiarSeleccionado,
    crear,
    actualizar,
    eliminar,
  };
};
