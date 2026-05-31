// ==========================================
// ENUMS — deben coincidir exactamente con el backend
// ==========================================
export type CategoriaOperacion = 'VENTA' | 'ALQUILER';
export type EstadoOperacion = 'ABIERTA' | 'EN_TRAMITE' | 'CERRADA' | 'CANCELADA';
export type RolParticipante = 'TITULAR' | 'APODERADO' | 'AVALISTA';
export type ModeloContrato = 'ARRAS' | 'ALQUILER_VIVIENDA';

// ==========================================
// VISTAS DE LISTA (ligeras)
// ==========================================
export interface OperacionBase {
  id: number;
  categoria_operacion: CategoriaOperacion;
  precioAcordado: number;
  estadoActual: EstadoOperacion;
  inmuebleId: number;
  inmuebleReferencia: string;
  // Primer interesado del mapa para mostrar en tabla
  primerInteresadoId?: number;
  primerInteresadoRol?: RolParticipante;
}

// ==========================================
// DETALLE COMPLETO (polimórfico)
// ==========================================
export interface OperacionVentaDetalle extends OperacionBase {
  categoria_operacion: 'VENTA';
  depositoArras?: number;
  fechaLimiteEscritura?: string;
  incluyeMobiliario?: boolean;
}

export interface OperacionAlquilerDetalle extends OperacionBase {
  categoria_operacion: 'ALQUILER';
  fianza?: number;
  duracionMeses?: number;
  admiteMascotas?: boolean;
}

export type OperacionDetalle = (OperacionVentaDetalle | OperacionAlquilerDetalle) & {
  // Mapa { "interesadoId": "ROL" } — viene del getter getCompradoresRolIds()
  compradoresRol: Record<string, RolParticipante>;
  documentos: ContratoResumen[];
};

// ==========================================
// CONTRATOS
// ==========================================
export interface ContratoResumen {
  id: number;
  modelo: ModeloContrato;
  estado: string;
  fechaFirma: string;
  urlDocumentoPdf?: string;
}

export interface ContratoDetalle {
  id: number;
  modelo: string;
  estado: string;
  fechaFirma: string;
  clausulasEspeciales?: string;
  urlDocumentoPdf?: string;
  trabajadorId?: number;
}

export interface CrearContratoData {
  modelo: ModeloContrato;
  fechaFirma: string;
  clausulasEspeciales?: string;
  trabajadorId?: number;
}

// ==========================================
// DTO DE CREACIÓN
// ==========================================
export interface NuevaOperacion {
  categoria_operacion: CategoriaOperacion;
  precioAcordado: number;
  inmuebleId: number;
  // Mapa de interesados con sus roles: { "1": "TITULAR", "3": "AVALISTA" }
  interesadosRol: Record<string, RolParticipante>;
  // VENTA
  depositoArras?: number;
  fechaLimiteEscritura?: string;
  incluyeMobiliario?: boolean;
  // ALQUILER
  fianza?: number;
  duracionMeses?: number;
  admiteMascotas?: boolean;
}
