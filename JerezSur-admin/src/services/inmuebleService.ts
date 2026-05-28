import api from './api';
import type { Inmueble, NuevoInmueble, InmuebleDetalle } from '../types/inmueble';

export const inmuebleService = {
  getTodos: async (): Promise<Inmueble[]> => {
    try {
      const { data } = await api.get<{ content: Inmueble[] }>('/inmuebles');
      return Array.isArray((data as any).content) ? (data as any).content : (data as unknown as Inmueble[]);
    } catch (error) {
      console.error('Error al obtener lista de inmuebles:', error);
      throw new Error('No se pudieron cargar los inmuebles. Intenta de nuevo más tarde.');
    }
  },

  getPorId: async (id: number): Promise<InmuebleDetalle> => {
    try {
      const { data } = await api.get<InmuebleDetalle>(`/inmuebles/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener inmueble ${id}:`, error);
      throw new Error(`No se pudo cargar el inmueble. Intenta de nuevo más tarde.`);
    }
  },

  crear: async (inmueble: NuevoInmueble): Promise<Inmueble> => {
    try {
      // Normalizar valores numéricos para BigDecimal en backend
      const payload = {
        ...inmueble,
        precio: Number(inmueble.precio),
        comunidad: inmueble.comunidad ? Number(inmueble.comunidad) : 0,
        valorDerrama: inmueble.valorDerrama ? Number(inmueble.valorDerrama) : null,
        ibi: inmueble.ibi ? Number(inmueble.ibi) : 0,
        superficieUtil: inmueble.superficieUtil ? Number(inmueble.superficieUtil) : 0,
        mConstruidos: inmueble.mConstruidos ? Number(inmueble.mConstruidos) : 0,
        habitaciones: inmueble.habitaciones ? Number(inmueble.habitaciones) : 1,
        banos: inmueble.banos ? Number(inmueble.banos) : 1,
      };
      const { data } = await api.post<Inmueble>('/inmuebles', payload);
      return data;
    } catch (error) {
      console.error('Error al crear inmueble:', error);
      if ((error as any)?.response?.data?.message) {
        throw new Error((error as any).response.data.message);
      }
      throw new Error('No se pudo crear el inmueble. Verifica los datos e intenta de nuevo.');
    }
  },

  actualizar: async (id: number, inmuebleData: Partial<InmuebleDetalle>): Promise<Inmueble> => {
    try {
      // Normalizar valores numéricos
      const payload = {
        ...inmuebleData,
        ...(inmuebleData.precio && { precio: Number(inmuebleData.precio) }),
        ...(inmuebleData.comunidad && { comunidad: Number(inmuebleData.comunidad) }),
        ...(inmuebleData.ibi && { ibi: Number(inmuebleData.ibi) }),
      };
      const { data } = await api.put<Inmueble>(`/inmuebles/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Error al actualizar inmueble ${id}:`, error);
      throw new Error('No se pudo actualizar el inmueble. Intenta de nuevo más tarde.');
    }
  },

  eliminar: async (id: number): Promise<void> => {
    try {
      await api.delete(`/inmuebles/${id}`);
    } catch (error) {
      console.error(`Error al eliminar inmueble ${id}:`, error);
      throw new Error('No se pudo eliminar el inmueble. Intenta de nuevo más tarde.');
    }
  }
};