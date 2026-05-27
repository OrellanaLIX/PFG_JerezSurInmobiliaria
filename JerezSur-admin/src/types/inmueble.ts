// ==========================================
// ENUMS
// ==========================================
export type TipoOperacionInmueble = 'VENTA' | 'ALQUILER' | 'AMBOS';
export type EstadoInmueble = 'DISPONIBLE' | 'VENDIDO' | 'RESERVADO';

// Sub-interfaz para las imágenes asociadas
export interface ImagenInmueble {
  id: number;
  url: string;
  descripcion?: string;
}

// ==========================================
// INTERFAZ PRINCIPAL (LISTADO LIGERO)
// ==========================================
export interface Inmueble {
  id: number;
  referencia: string;
  titulo: string;
  precio: number;
  operacion: TipoOperacionInmueble;
  estado: EstadoInmueble;
  superficieUtil: number;
  mConstruidos: number;
  habitaciones: number;
  banos: number;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  fechaRegistro: string;
}

// ==========================================
// INTERFAZ EXTENDIDA PARA DETALLE PROFUNDO
// ==========================================
export interface InmuebleDetalle extends Inmueble {
  descripcion?: string;
  caracteristicasExtra: Record<string, string>; // Mapea el Map<String, String> de Java
  
  // Gastos y Cargas
  comunidad: number;
  tieneDerrama: boolean;
  valorDerrama?: number;
  ibi: number;
  
  // Documentos y Notas Privadas (Solo trabajadores)
  refCatastral?: string;
  urlNotaSimple?: string;
  urlCertificadoEnergetico?: string;
  urlPlanoInmueble?: string;
  notasPrivadas?: string;

  // Relaciones
  imagenes: ImagenInmueble[];
  propietariosIds?: number[];
  operacionesIds?: number[];
  fechaUltimaActualizacion: string;
}

// ==========================================
// DTO PARA CREACIÓN / REGISTRO
// ==========================================
export interface NuevoInmueble {
  referencia: string;
  titulo: string;
  precio: number;
  operacion: TipoOperacionInmueble;
  estado: EstadoInmueble;
  superficieUtil: number;
  mConstruidos: number;
  habitaciones: number;
  banos: number;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  descripcion?: string;
}