import { useState, useEffect, useCallback } from 'react';
import { inmuebleService } from '../services/inmuebleService';
import type { Inmueble, NuevoInmueble, InmuebleDetalle } from '../types/inmueble';

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
      const message = err instanceof Error ? err.message : 'Error al cargar el catálogo de inmuebles';
      setError(message);
      console.error(message, err);
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
      const message = err instanceof Error ? err.message : 'Error al recuperar la ficha del inmueble';
      setError(message);
      console.error(message, err);
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
      const message = err instanceof Error ? err.message : 'Error al crear el inmueble';
      setError(message);
      console.error(message, err);
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
      const message = err instanceof Error ? err.message : 'Error al actualizar el inmueble';
      setError(message);
      console.error(message, err);
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
      const message = err instanceof Error ? err.message : 'Error al eliminar el inmueble';
      setError(message);
      console.error(message, err);
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