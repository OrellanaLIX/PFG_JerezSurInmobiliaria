// Servicio de inmuebles para el frontend público de JerezSur.
// Encapsula todas las llamadas al backend relacionadas con el catálogo de propiedades.
import api from './api';

// ── Tipos de respuesta del backend ──────────────────────────────────────────

export interface InmuebleBackend {
  id: number;
  referencia: string;
  titulo: string;
  descripcion?: string;
  precio: number;
  operacion?: 'VENTA' | 'ALQUILER' | 'CUALQUIERA';
  estado?: 'DISPONIBLE' | 'VENDIDO' | 'RESERVADO' | 'RETIRADO';
  tipo?: string;
  superficieUtil?: number;
  mConstruidos?: number;
  habitaciones?: number;
  banos?: number;
  ciudad: string;
  zona?: string;
  imagenPortadaUrl?: string | null;
  destacado?: boolean;
  tieneAscensor?: boolean;
  tieneGaraje?: boolean;
  tieneJardin?: boolean;
  tienePiscina?: boolean;
}

export interface InmueblePage {
  content: InmuebleBackend[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface InmuebleDestacado {
  id: number;
  referencia: string;
  titulo: string;
  precio: number;
  operacion?: string;
  ciudad?: string;
  zona?: string;
  habitaciones?: number;
  banos?: number;
  superficieUtil?: number;
  imagenPortadaUrl?: string;
}

export interface FiltrosInmueble {
  operacion?: string;
  estado?: string;
  tipo?: string;
  precioMin?: string;
  precioMax?: string;
  habitaciones?: string;
  banos?: string;
  superficieMin?: string;
  superficieMax?: string;
  zona?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

// ── Funciones del servicio ───────────────────────────────────────────────────

export const inmuebleService = {
  // Lista inmuebles con filtros opcionales y paginación
  listar: (filtros: FiltrosInmueble = {}): Promise<InmueblePage> => {
    const params = new URLSearchParams();
    if (filtros.operacion)     params.set('operacion',    filtros.operacion);
    if (filtros.estado)        params.set('estado',       filtros.estado);
    if (filtros.tipo)          params.set('tipo',         filtros.tipo);
    if (filtros.precioMin)     params.set('precioMin',    filtros.precioMin);
    if (filtros.precioMax)     params.set('precioMax',    filtros.precioMax);
    if (filtros.habitaciones)  params.set('habitaciones', filtros.habitaciones);
    if (filtros.superficieMin) params.set('superficieMin', filtros.superficieMin);
    if (filtros.superficieMax) params.set('superficieMax', filtros.superficieMax);
    if (filtros.zona)          params.set('zona',         filtros.zona);
    params.set('page',    String(filtros.page    ?? 0));
    params.set('size',    String(filtros.size    ?? 200));
    params.set('sortBy',  filtros.sortBy  ?? 'id');
    params.set('sortDir', filtros.sortDir ?? 'desc');
    return api.get<InmueblePage>(`/inmuebles?${params}`);
  },

  // Obtiene los detalles públicos de un inmueble (incluye imágenes, cargadas transaccionalmente)
  detalle: (id: number): Promise<any> =>
    api.get<any>(`/inmuebles/${id}/detalle`),

  // Obtiene los inmuebles marcados como destacados para la portada
  destacados: (): Promise<InmuebleDestacado[]> =>
    api.get<InmuebleDestacado[]>('/inmuebles/destacados'),

  // Obtiene los inmuebles de un vendedor/propietario específico
  porVendedor: (vendedorId: number): Promise<InmuebleBackend[]> =>
    api.get<InmuebleBackend[]>(`/inmuebles/vendedor/${vendedorId}`),
};
