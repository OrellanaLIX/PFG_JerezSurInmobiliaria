import api from './api';
import type { Inmueble, NuevoInmueble, InmuebleDetalle } from '../types/inmueble';

// Interfaz para mapear la paginación típica de un Page de Spring Boot/Hibernate
interface SpringPageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export const inmuebleService = {
  getTodos: async (): Promise<Inmueble[]> => {
    try {
      // ✅ REFACTORIZADO: Tipamos correctamente la respuesta esperada de Spring Boot ({ content: [...] })
      const { data } = await api.get<SpringPageResponse<Inmueble>>('/inmuebles');
      
      // Validamos de forma segura si la API devolvió la envoltura de paginación o el array plano
      if (data && Array.isArray(data.content)) {
        return data.content;
      }
      return Array.isArray(data) ? data : [];
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
      // Normalizar valores numéricos para BigDecimal/Double en el backend de Java
      const payload: NuevoInmueble = {
        ...inmueble,
        precio: Number(inmueble.precio),
        comunidad: inmueble.comunidad ? Number(inmueble.comunidad) : 0,
        valorDerrama: inmueble.valorDerrama ? Number(inmueble.valorDerrama) : undefined,
        ibi: inmueble.ibi ? Number(inmueble.ibi) : 0,
        superficieUtil: inmueble.superficieUtil ? Number(inmueble.superficieUtil) : 0,
        mConstruidos: inmueble.mConstruidos ? Number(inmueble.mConstruidos) : 0,
        habitaciones: inmueble.habitaciones ? Number(inmueble.habitaciones) : 1,
        banos: inmueble.banos ? Number(inmueble.banos) : 1,
        // Forzamos el mapeo asegurando que los valores de los porcentajes viajen como Number y no como String
        propietariosPorcentaje: Object.entries(inmueble.propietariosPorcentaje).reduce((acc, [key, val]) => {
          acc[key] = Number(val);
          return acc;
        }, {} as Record<string, number>)
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
        ...(inmuebleData.precio !== undefined && { precio: Number(inmuebleData.precio) }),
        ...(inmuebleData.comunidad !== undefined && { comunidad: Number(inmuebleData.comunidad) }),
        ...(inmuebleData.ibi !== undefined && { ibi: Number(inmuebleData.ibi) }),
        ...(inmuebleData.propietariosPorcentaje !== undefined && {
          propietariosPorcentaje: Object.entries(inmuebleData.propietariosPorcentaje).reduce((acc, [key, val]) => {
            acc[key] = Number(val);
            return acc;
          }, {} as Record<string, number>)
        }),
      };
      
      const { data } = await api.put<Inmueble>(`/inmuebles/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Error al actualizar inmueble ${id}:`, error);
      if ((error as any)?.response?.data?.message) {
        throw new Error((error as any).response.data.message);
      }
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