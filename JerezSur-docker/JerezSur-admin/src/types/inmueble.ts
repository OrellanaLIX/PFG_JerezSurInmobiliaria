import type { TipoOperacion, EstadoInmueble, TipoInmueble } from '../Enum/inmuebleEnum';
import type { ImagenInmueble } from './imagen';

// Re-exportamos los tipos por si algún componente antiguo importaba todo desde 'inmueble'
export * from '../Enum/inmuebleEnum';

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
  zona?: string;
  codigoPostal: string;
  ciudad: string;
  destacado?: boolean;
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

  zona?: string;
  destacado?: boolean;

  // Documentos y Notas Privadas (Solo trabajadores)
  refCatastral?: string;
  urlNotaSimple?: string;
  urlCertificadoEnergetico?: string;
  urlPlanoInmueble?: string;
  notasPrivadas?: string;

  // Relaciones
  imagenes?: ImagenInmueble[];

  // 🌟 Mapa real proveniente de la BD: { "id_vendedor": porcentaje_participacion }
  propietariosPorcentaje?: Record<string, number>;

  fechaUltimaActualizacion?: string;
}

// ==========================================
// DTO PARA CREACIÓN / REGISTRO
// ==========================================
export interface NuevoInmueble {
  titulo: string;
  precio: number;
  operacion: TipoOperacion;
  estado: EstadoInmueble;
  tipo: TipoInmueble;
  superficieUtil?: number;
  mConstruidos?: number;
  habitaciones?: number;
  banos?: number;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  comunidad?: number;
  tieneDerrama?: boolean;
  valorDerrama?: number;
  ibi?: number;
  refCatastral?: string;
  urlNotaSimple?: string;
  urlCertificadoEnergetico?: string;
  urlPlanoInmueble?: string;
  notasPrivadas?: string;
  descripcion?: string;
  zona?: string;
  destacado?: boolean;
  propietariosPorcentaje: Record<string, number>;
  imagenesUrls?: string[];
  caracteristicasExtra?: Record<string, string>;
}