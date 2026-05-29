import type { TipoOperacion, EstadoInmueble, TipoInmueble } from '../Enum/InmuebleEnum';
import type { ImagenInmueble } from './imagen';

// Re-exportamos los tipos por si algún componente antiguo importaba todo desde 'inmueble'
export * from '../Enum/InmuebleEnum';

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
  
  // 🌟 Mapa real proveniente de la BD: { "id_vendedor": porcentaje_participacion }
  propietariosPorcentaje?: Record<string, number>; 
  
  fechaUltimaActualizacion?: string;
}

// ==========================================
// DTO PARA CREACIÓN / REGISTRO
// ==========================================
export interface NuevoInmueble {
  // Campos obligatorios
  titulo: string;
  precio: number;
  operacion: TipoOperacion;
  estado: EstadoInmueble;
  tipo: TipoInmueble; // Lo marcamos obligatorio ya que el modal lo inicializa en 'PISO'
  
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

  // 🌟 Mapa requerido para el envío al controlador de Spring Boot: e.g. {"1": 50.0, "2": 50.0}
  propietariosPorcentaje: Record<string, number>;
}