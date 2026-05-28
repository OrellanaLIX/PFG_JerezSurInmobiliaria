import { useState, useEffect, useCallback } from 'react';
import { operacionService } from '../services/operacionService';
import type { OperacionBase, NuevaOperacion, OperacionDetalle } from '../types/operacion';

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
      const data = await operacionService.getTodas();
      setOperaciones(data);
    } catch {
      setError('Error al cargar el histórico de operaciones');
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
      const data = await operacionService.getPorId(id);
      setOperacionSeleccionada(data);
    } catch {
      setError('Error al recuperar los contratos de la operación');
    } finally {
      setLoadingDetalle(false);
    }
  };

  const limpiarSeleccionada = () => setOperacionSeleccionada(null);

  const crear = async (operacion: NuevaOperacion) => {
    await operacionService.crear(operacion);
    await cargar();
  };

  const actualizar = async (id: number, operacionData: Partial<OperacionDetalle>) => {
    await operacionService.actualizar(id, operacionData);
    await cargar();
    if (operacionSeleccionada?.id === id) {
      await cargarDetalle(id);
    }
  };

  const eliminar = async (id: number) => {
    await operacionService.eliminar(id);
    await cargar();
  };

  const subirDocumentoContrato = async (contratoId: number, archivo: File) => {
    await operacionService.subirContratoPdf(contratoId, archivo);
    // refrescar detalles si el contrato pertenece a la operación seleccionada
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
    actualizar,
    eliminar,
    subirDocumentoContrato,
  };
};