// Hook que gestiona el estado de las operaciones inmobiliarias en el panel admin.
import { useState, useEffect, useCallback } from 'react';
import { operacionService } from '../services/operacionService';
import type { OperacionBase, NuevaOperacion, OperacionDetalle, EstadoOperacion } from '../types/operacion';

export const useOperaciones = () => {
  const [operaciones, setOperaciones] = useState<OperacionBase[]>([]);
  const [operacionSeleccionada, setOperacionSeleccionada] = useState<OperacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setOperaciones(await operacionService.getTodas());
    } catch {
      setError('Error al cargar el histórico de operaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cargarDetalle = async (id: number) => {
    try {
      setLoadingDetalle(true);
      setOperacionSeleccionada(await operacionService.getPorId(id));
    } catch {
      setError('Error al recuperar los detalles de la operación');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const limpiarSeleccionada = () => setOperacionSeleccionada(null);

  const crear = async (operacion: NuevaOperacion) => {
    await operacionService.crear(operacion);
    await cargar();
  };

  const actualizarEstado = async (id: number, estado: EstadoOperacion) => {
    await operacionService.actualizarEstado(id, estado);
    await cargar();
    if (operacionSeleccionada?.id === id) await cargarDetalle(id);
  };

  const eliminar = async (id: number) => {
    await operacionService.eliminar(id);
    await cargar();
  };

  const subirDocumentoContrato = async (contratoId: number, archivo: File) => {
    await operacionService.subirContratoPdf(contratoId, archivo);
    if (operacionSeleccionada) await cargarDetalle(operacionSeleccionada.id);
    await cargar();
  };

  return {
    operaciones,
    operacionSeleccionada,
    loading,
    loadingDetalle,
    error,
    cargar,
    cargarDetalle,
    limpiarSeleccionada,
    crear,
    actualizarEstado,
    eliminar,
    subirDocumentoContrato,
  };
};
