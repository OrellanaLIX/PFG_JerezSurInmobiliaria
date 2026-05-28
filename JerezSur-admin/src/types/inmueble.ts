// ==========================================
// ENUMS / TIPOS LITERALES
// ==========================================
export type TipoOperacion = 'VENTA' | 'ALQUILER' | 'CUALQUIERA';
export type EstadoInmueble = 'DISPONIBLE' | 'VENDIDO' | 'RESERVADO';
export type TipoInmueble = 'PISO' | 'CASA' | 'CHALET' | 'ADOSADO' | 'APARTAMENTO' | 'ESTUDIO' | 'DUPLEX' | 'ATICO' | 'LOCAL_COMERCIAL' | 'OFICINA' | 'GARAJE' | 'TRASTERO' | 'TERRENO' | 'NAVE_INDUSTRIAL' | 'FINCA';

// Sub-interfaz para las imágenes asociadas
export interface ImagenInmueble {
  id: number;
  url: string;
  nombreArchivo: string;
  esPortada: boolean;
  inmuebleId?: number;
}

// ==========================================
// INTERFAZ PRINCIPAL (LISTADO LIGERO)
// ==========================================
export interface Inmueble {
  id: number;
  referencia: string;
  titulo: string;
  precio: number;
  operacion: TipoOperacion;
  estado: EstadoInmueble;
  tipo: TipoInmueble;
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
  caracteristicasExtra?: Record<string, string>; // Mapea el Map<String, String> de Java

  // Gastos y Cargas
  comunidad?: number;
  tieneDerrama?: boolean;
  valorDerrama?: number;
  ibi?: number;

  // Documentos y Notas Privadas (Solo trabajadores)
  refCatastral?: string;
  urlNotaSimple?: string;
  urlCertificadoEnergetico?: string;
  urlPlanoInmueble?: string;
  notasPrivadas?: string;

  // Relaciones
  imagenes?: ImagenInmueble[];
  fechaUltimaActualizacion?: string;
}

// ==========================================
// DTO PARA CREACIÓN / REGISTRO
// ==========================================
export interface NuevoInmueble {
  // Campos obligatorios
  referencia: string;
  titulo: string;
  precio: number;
  operacion: TipoOperacion;
  estado: EstadoInmueble;
  tipo?: TipoInmueble;
  
  // Características
  superficieUtil?: number;
  mConstruidos?: number;
  habitaciones?: number;
  banos?: number;
  
  // Ubicación
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  
  // Gastos y cargas
  comunidad?: number;
  tieneDerrama?: boolean;
  valorDerrama?: number;
  ibi?: number;
  
  // Documentos y notas (solo trabajadores)
  refCatastral?: string;
  urlNotaSimple?: string;
  urlCertificadoEnergetico?: string;
  urlPlanoInmueble?: string;
  notasPrivadas?: string;
  
  // Descripción
  descripcion?: string;
}