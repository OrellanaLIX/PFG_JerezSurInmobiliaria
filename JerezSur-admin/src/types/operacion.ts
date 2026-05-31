// ==========================================
// ENUMS
// ==========================================
export type TipoOperacionContrato = 'VENTA' | 'ALQUILER' | 'TRASPASO';
export type EstadoOperacion = 'ABIERTA' | 'EN_TRAMITE' | 'CERRADA' | 'CANCELADA';
export type CategoriaOperacion = 'VENTA' | 'ALQUILER';

export interface DocumentoContrato {
  id: number;
  urlArchivo: string;
  tipoDocumento: string; // Arras, Contrato Final, Anexo...
  fechaFirma: string;
}

// ==========================================
// INTERFAZ BASE COMPARTIDA
// ==========================================
export interface OperacionBase {
  id: number;
  categoria_operacion: CategoriaOperacion; // El discriminador de Jackson
  precioAcordado: number;
  tipo: TipoOperacionContrato;
  estadoActual: EstadoOperacion;
  
  // Guardamos referencias simples para los listados ligeros
  inmuebleId: number;
  inmuebleReferencia: string;
  vendedorNombre?: string;
  compradorNombre?: string;
}

// ==========================================
// UNIÓN DISCRIMINADA (POLIMORFISMO EN TS)
// ==========================================
export interface OperacionVentaDetalle extends OperacionBase {
  categoria_operacion: 'VENTA';
  // Añade aquí campos específicos de tu clase OperacionVenta de Java, ej:
  gastosNotariaComprador?: boolean;
  importeArras?: number;
}

export interface OperacionAlquilerDetalle extends OperacionBase {
  categoria_operacion: 'ALQUILER';
  // Añade aquí campos específicos de tu clase OperacionAlquiler de Java, ej:
  fianzaMeses: number;
  incluyeGastosComunidad: boolean;
}

// El tipo definitivo para detalles profundos
export type OperacionDetalle = (OperacionVentaDetalle | OperacionAlquilerDetalle) & {
  documentos: DocumentoContrato[];
  vendedoresIds: number[];
  compradoresIds: number[];
};

// DTO para la creación de un nuevo trámite
export interface NuevaOperacion {
  categoria_operacion: CategoriaOperacion;
  precioAcordado: number;
  tipo: TipoOperacionContrato;
  inmuebleId: number;
  interesadoId: number;
  depositoArras?: number;
  fechaLimiteEscritura?: string;
  incluyeMobiliario?: boolean;
  fianza?: number;
  duracionMeses?: number;
  admiteMascotas?: boolean;
}