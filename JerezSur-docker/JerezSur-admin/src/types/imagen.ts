// Tipos TypeScript para las imágenes de los inmuebles.
export interface ImagenInmueble {
  id: number;
  url: string;
  nombreArchivo: string;
  esPortada: boolean;
  inmuebleId?: number;
}