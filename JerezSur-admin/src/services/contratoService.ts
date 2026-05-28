import api from './api';

export const contratoService = {
  generarBorrador: async (operacionId: number, modelo: string, trabajador: any) => {
    const { data } = await api.post(`/contratos/operacion/${operacionId}/generar?modelo=${encodeURIComponent(modelo)}`, trabajador);
    return data;
  },

  listarPorOperacion: async (operacionId: number) => {
    const { data } = await api.get(`/contratos/operacion/${operacionId}`);
    return Array.isArray(data) ? data : (data as any);
  }
};
