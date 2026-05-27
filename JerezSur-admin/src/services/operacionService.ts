import api from './api';
import type { OperacionBase, NuevaOperacion, OperacionDetalle } from '../types/operacion';

export const operacionService = {
  getTodas: async (): Promise<OperacionBase[]> => {
    const { data } = await api.get<OperacionBase[]>('/operaciones');
    return Array.isArray(data) ? data : (data as any).content || [];
  },

  getPorId: async (id: number): Promise<OperacionDetalle> => {
    const { data } = await api.get<OperacionDetalle>(`/operaciones/${id}`);
    return data;
  },

  crear: async (operacion: NuevaOperacion): Promise<OperacionBase> => {
    const payload: any = {
      categoria_operacion: operacion.categoria_operacion,
      precioAcordado: Number(operacion.precioAcordado),
      tipo: operacion.tipo,
      inmueble: { id: operacion.inmuebleId },
      representanteVendedor: { id: operacion.vendedorId },
      representanteComprador: { id: operacion.interesadoId }
    };

    if (operacion.categoria_operacion === 'VENTA') {
      payload.depositoArras = operacion.depositoArras ?? 0;
      payload.fechaLimiteEscritura = operacion.fechaLimiteEscritura || undefined;
      payload.incluyeMobiliario = !!operacion.incluyeMobiliario;
    }

    if (operacion.categoria_operacion === 'ALQUILER') {
      payload.fianza = operacion.fianza ?? 0;
      payload.duracionMeses = operacion.duracionMeses ?? 12;
      payload.admiteMascotas = !!operacion.admiteMascotas;
    }

    const { data } = await api.post<OperacionBase>('/operaciones', payload);
    return data;
  },

  actualizar: async (id: number, operacionData: Partial<OperacionDetalle>): Promise<OperacionBase> => {
    const { data } = await api.put<OperacionBase>(`/operaciones/${id}`, operacionData);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/operaciones/${id}`);
  }
};