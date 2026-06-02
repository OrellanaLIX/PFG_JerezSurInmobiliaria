// Enumeraciones y constantes del frontend admin para tipos y estados de inmuebles.
export type TipoOperacion = 'VENTA' | 'ALQUILER' | 'CUALQUIERA';

export type EstadoInmueble = 'DISPONIBLE' | 'VENDIDO' | 'RESERVADO';

export type TipoInmueble = 
  | 'PISO' 
  | 'CASA' 
  | 'CHALET' 
  | 'ADOSADO' 
  | 'APARTAMENTO' 
  | 'ESTUDIO' 
  | 'DUPLEX' 
  | 'ATICO' 
  | 'LOCAL_COMERCIAL' 
  | 'OFICINA' 
  | 'GARAJE' 
  | 'TRASTERO' 
  | 'TERRENO' 
  | 'NAVE_INDUSTRIAL' 
  | 'FINCA';