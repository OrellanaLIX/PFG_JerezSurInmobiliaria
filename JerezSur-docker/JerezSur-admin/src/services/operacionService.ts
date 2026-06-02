// Servicio de operaciones del admin: peticiones al backend para el CRUD de operaciones.
import api from './api';
import type { OperacionBase, NuevaOperacion, OperacionDetalle, EstadoOperacion, RolParticipante } from '../types/operacion';

const mapOperacionToBase = (o: any): OperacionBase => {
  // compradoresRol llega como { "1": "TITULAR", "3": "AVALISTA" }
  const rolEntries = Object.entries(o.compradoresRol ?? {}) as [string, RolParticipante][];
  const [primerInteresadoId, primerInteresadoRol] = rolEntries[0] ?? [undefined, undefined];

  return {
    id: o.id,
    categoria_operacion: o.categoria_operacion,
    precioAcordado: Number(o.precioAcordado ?? 0),
    estadoActual: o.estadoActual,
    inmuebleId: o.inmueble?.id ?? 0,
    inmuebleReferencia: o.inmueble?.referencia || o.inmueble?.direccion || `#${o.inmueble?.id ?? 'N/A'}`,
    primerInteresadoId: primerInteresadoId ? Number(primerInteresadoId) : undefined,
    primerInteresadoRol,
  };
};

export const operacionService = {
  getTodas: async (): Promise<OperacionBase[]> => {
    const { data } = await api.get('/operaciones');
    const raw: any[] = Array.isArray(data) ? data : (data as any).content ?? [];
    return raw.map(mapOperacionToBase);
  },

  getPorId: async (id: number): Promise<OperacionDetalle> => {
    const { data } = await api.get(`/operaciones/${id}`);
    return {
      ...mapOperacionToBase(data),
      compradoresRol: (data as any).compradoresRol ?? {},
      documentos: Array.isArray((data as any).documentos) ? (data as any).documentos : [],
      // campos específicos de subclase
      depositoArras: (data as any).depositoArras,
      fechaLimiteEscritura: (data as any).fechaLimiteEscritura,
      incluyeMobiliario: (data as any).incluyeMobiliario,
      fianza: (data as any).fianza,
      duracionMeses: (data as any).duracionMeses,
      admiteMascotas: (data as any).admiteMascotas,
    } as OperacionDetalle;
  },

  crear: async (operacion: NuevaOperacion): Promise<OperacionBase> => {
    const payload = {
      categoria_operacion: operacion.categoria_operacion,
      precioAcordado: operacion.precioAcordado,
      inmuebleId: operacion.inmuebleId,
      interesadosRol: operacion.interesadosRol,
      ...(operacion.categoria_operacion === 'VENTA' && {
        depositoArras: operacion.depositoArras ?? 0,
        fechaLimiteEscritura: operacion.fechaLimiteEscritura || null,
        incluyeMobiliario: !!operacion.incluyeMobiliario,
      }),
      ...(operacion.categoria_operacion === 'ALQUILER' && {
        fianza: operacion.fianza ?? 0,
        duracionMeses: operacion.duracionMeses ?? 12,
        admiteMascotas: !!operacion.admiteMascotas,
      }),
    };

    const { data } = await api.post('/operaciones', payload);
    return mapOperacionToBase(data);
  },

  // Sólo actualiza el estado via PATCH
  actualizarEstado: async (id: number, estado: EstadoOperacion): Promise<OperacionBase> => {
    const { data } = await api.patch(`/operaciones/${id}/estado?estado=${estado}`);
    return mapOperacionToBase(data);
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/operaciones/${id}`);
  },

  subirContratoPdf: async (contratoId: number, archivo: File) => {
    const form = new FormData();
    form.append('archivo', archivo);
    const { data } = await api.post(`/media/contrato/${contratoId}/documento`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
