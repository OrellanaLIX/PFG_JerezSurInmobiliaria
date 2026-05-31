import api from './api';
import type { OperacionBase, NuevaOperacion, OperacionDetalle } from '../types/operacion';

const mapOperacionToBase = (operacion: any): OperacionBase => ({
  id: operacion.id,
  categoria_operacion: operacion.categoria_operacion,
  precioAcordado: Number(operacion.precioAcordado ?? 0),
  tipo: operacion.tipo,
  estadoActual: operacion.estadoActual,
  inmuebleId: operacion.inmueble?.id ?? 0,
  inmuebleReferencia:
    operacion.inmueble?.referencia || operacion.inmueble?.direccion || `#${operacion.inmueble?.id ?? 'N/A'}`,
  vendedorNombre:
    operacion.vendedores?.[0]?.vendedor?.usuario?.nombre ||
    operacion.vendedores?.[0]?.vendedor?.usuario?.email ||
    undefined,
  compradorNombre:
    operacion.compradores?.[0]?.comprador?.usuario?.nombre ||
    operacion.compradores?.[0]?.comprador?.usuario?.email ||
    undefined,
});

export const operacionService = {
  getTodas: async (): Promise<OperacionBase[]> => {
    try {
      const { data } = await api.get<OperacionBase[]>('/operaciones');
      const raw = Array.isArray(data) ? data : (data as any).content || [];
      return raw.map(mapOperacionToBase);
    } catch (error) {
      console.error('Error al obtener operaciones:', error);
      throw new Error('No se pudieron cargar las operaciones.');
    }
  },

  getPorId: async (id: number): Promise<OperacionDetalle> => {
    try {
      const { data } = await api.get<OperacionDetalle>(`/operaciones/${id}`);
      return {
        ...data,
        documentos: Array.isArray((data as any).documentos) ? (data as any).documentos : [],
      } as OperacionDetalle;
    } catch (error) {
      console.error(`Error al obtener operación ${id}:`, error);
      throw new Error('No se pudo cargar la operación.');
    }
  },

  crear: async (operacion: NuevaOperacion): Promise<OperacionBase> => {
    try {
      const payload: any = {
        categoria_operacion: operacion.categoria_operacion,
        precioAcordado: Number(operacion.precioAcordado),
        tipo: operacion.tipo,
        inmueble: { id: operacion.inmuebleId },
        vendedores: [{ vendedor: { id: operacion.vendedorId } }],
        compradores: [{ comprador: { id: operacion.interesadoId } }],
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

      const { data } = await api.post('/operaciones', payload);
      return mapOperacionToBase(data);
    } catch (error) {
      console.error('Error al crear operación:', error);
      if ((error as any)?.response?.data?.message) {
        throw new Error((error as any).response.data.message);
      }
      throw new Error('No se pudo crear la operación.');
    }
  },

  actualizar: async (id: number, operacionData: Partial<OperacionDetalle>): Promise<OperacionBase> => {
    try {
      const { data } = await api.put<OperacionBase>(`/operaciones/${id}`, operacionData);
      return mapOperacionToBase(data);
    } catch (error) {
      console.error(`Error al actualizar operación ${id}:`, error);
      throw new Error('No se pudo actualizar la operación.');
    }
  },

  eliminar: async (id: number): Promise<void> => {
    try {
      await api.delete(`/operaciones/${id}`);
    } catch (error) {
      console.error(`Error al eliminar operación ${id}:`, error);
      throw new Error('No se pudo eliminar la operación.');
    }
  },

  subirContratoPdf: async (contratoId: number, archivo: File) => {
    try {
      const form = new FormData();
      form.append('archivo', archivo);
      const { data } = await api.post(`/media/contrato/${contratoId}/documento`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (error) {
      console.error('Error al subir contrato:', error);
      throw new Error('No se pudo subir el archivo del contrato.');
    }
  }
};