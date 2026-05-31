export const TipoOperacion = {
  VENTA: "VENTA",
  ALQUILER: "ALQUILER",
  CUALQUIERA: "CUALQUIERA"
} as const;

// Esto crea un tipo basado en los valores de arriba
export type TipoOperacion = typeof TipoOperacion[keyof typeof TipoOperacion];

export const EstadoInmueble = {
  DISPONIBLE: "DISPONIBLE",
  VENDIDO: "VENDIDO",
  RESERVADO: "RESERVADO",
  RETIRADO: "RETIRADO"
} as const;

export type EstadoInmueble = typeof EstadoInmueble[keyof typeof EstadoInmueble];

export interface Imagen {
  id: number;
  url: string;
  esPrincipal: boolean;
}

export interface Inmueble {
  id: number;
  referencia: string;
  titulo: string;
  descripcion: string;
  precio: number;
  operacion: TipoOperacion;
  estado: EstadoInmueble;
  superficieUtil: number;
  mConstruidos: number;
  habitaciones: number;
  banos: number;
  direccion: string;
  zona?: string;
  codigoPostal: string;
  ciudad: string;
  destacado?: boolean;
  imagenes: Imagen[];
  caracteristicasExtra?: Record<string, string>;
  fechaRegistro: string;
}