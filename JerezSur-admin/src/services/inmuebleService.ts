import api from './api';
import type { Inmueble, NuevoInmueble, InmuebleDetalle } from '../types/inmueble';

export const inmuebleService = {
  getTodos: async (): Promise<Inmueble[]> => {
    const { data } = await api.get<{ content: Inmueble[] }>('/inmuebles');
    return Array.isArray((data as any).content) ? (data as any).content : (data as unknown as Inmueble[]);
  },

  getPorId: async (id: number): Promise<InmuebleDetalle> => {
    const { data } = await api.get<InmuebleDetalle>(`/inmuebles/${id}`);
    return data;
  },

  crear: async (inmueble: NuevoInmueble): Promise<Inmueble> => {
    const payload = {
      ...inmueble,
      precio: Number(inmueble.precio)
    };
    const { data } = await api.post<Inmueble>('/inmuebles', payload);
    return data;
  },

  actualizar: async (id: number, inmuebleData: Partial<InmuebleDetalle>): Promise<Inmueble> => {
    const { data } = await api.put<Inmueble>(`/inmuebles/${id}`, inmuebleData);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/inmuebles/${id}`);
  }
};