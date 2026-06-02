// Servicio de inmuebles del panel admin: agrupa todas las llamadas al backend relacionadas con el catálogo.
// Usa la instancia de Axios configurada en api.ts para incluir el token JWT automáticamente.
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
      // ✅ Tipamos correctamente la respuesta esperada de Spring Boot
      const { data } = await api.get<SpringPageResponse<Inmueble>>('/inmuebles?size=200&sortBy=id&sortDir=desc');

      if (data && Array.isArray(data.content)) {
        return data.content;
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener lista de inmuebles:', error);
      throw error; // Relanzamos el error para no perder el contexto en los componentes
    }
  },

  getPorId: async (id: number): Promise<InmuebleDetalle> => {
    try {
      const { data } = await api.get<InmuebleDetalle>(`/inmuebles/${id}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener inmueble ${id}:`, error);
      throw error;
    }
  },

  crear: async (inmueble: NuevoInmueble): Promise<Inmueble> => {
    try {
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
        propietariosPorcentaje: Object.entries(inmueble.propietariosPorcentaje).reduce((acc, [key, val]) => {
          acc[key] = Number(val);
          return acc;
        }, {} as Record<string, number>),
        imagenesUrls: inmueble.imagenesUrls ?? [],
      };

      const { data } = await api.post<Inmueble>('/inmuebles', payload);
      return data;
    } catch (error) {
      console.error('Error al crear inmueble:', error);
      throw error; // 🛠️ DEJAMOS QUE AXIOS LLEVE EL ERROR COMPLETO AL MODAL
    }
  },

  actualizar: async (id: number, inmuebleData: Partial<InmuebleDetalle>): Promise<Inmueble> => {
    try {
      // 🛠️ MAPEADO COMPLETO: Aseguramos la conversión numérica de todos los posibles campos editables
      const payload = {
        ...inmuebleData,
        ...(inmuebleData.precio !== undefined && { precio: Number(inmuebleData.precio) }),
        ...(inmuebleData.comunidad !== undefined && { comunidad: Number(inmuebleData.comunidad) }),
        ...(inmuebleData.ibi !== undefined && { ibi: Number(inmuebleData.ibi) }),
        ...(inmuebleData.valorDerrama !== undefined && { valorDerrama: Number(inmuebleData.valorDerrama) }),
        ...(inmuebleData.superficieUtil !== undefined && { superficieUtil: Number(inmuebleData.superficieUtil) }),
        ...(inmuebleData.mConstruidos !== undefined && { mConstruidos: Number(inmuebleData.mConstruidos) }),
        ...(inmuebleData.habitaciones !== undefined && { habitaciones: Number(inmuebleData.habitaciones) }),
        ...(inmuebleData.banos !== undefined && { banos: Number(inmuebleData.banos) }),
        ...(inmuebleData.propietariosPorcentaje !== undefined && {
          propietariosPorcentaje: Object.entries(inmuebleData.propietariosPorcentaje).reduce((acc, [key, val]) => {
            acc[key] = Number(val);
            return acc;
          }, {} as Record<string, number>),
        }),
      };

      const { data } = await api.put<Inmueble>(`/inmuebles/${id}`, payload);
      return data;
    } catch (error) {
      console.error(`Error al actualizar inmueble ${id}:`, error);
      throw error; // 🛠️ EL MODAL LEERÁ EL 'error.response.data.message' DE SPRING PERFECTAMENTE
    }
  },

  eliminar: async (id: number): Promise<void> => {
    try {
      await api.delete(`/inmuebles/${id}`);
    } catch (error) {
      console.error(`Error al eliminar inmueble ${id}:`, error);
      throw error;
    }
  }
};