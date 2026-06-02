package com.jerezsur.inmobiliaria.dto;

import lombok.*;
import java.math.BigDecimal;

// DTO para el listado paginado de inmuebles: campos resumidos optimizados para mostrar en la rejilla de búsqueda.
@Getter
// DTO para el listado paginado de inmuebles: campos resumidos optimizados para mostrar en la rejilla de búsqueda.
@Setter
// DTO para el listado paginado de inmuebles: campos resumidos optimizados para mostrar en la rejilla de búsqueda.
@Builder
// DTO para el listado paginado de inmuebles: campos resumidos optimizados para mostrar en la rejilla de búsqueda.
@NoArgsConstructor
// DTO para el listado paginado de inmuebles: campos resumidos optimizados para mostrar en la rejilla de búsqueda.
@AllArgsConstructor
public class InmuebleListadoDTO {
    private Long    id;
    private String  referencia;
    private String  titulo;
    private BigDecimal precio;
    private String  operacion;       // VENTA / ALQUILER / CUALQUIERA
    private String  estado;          // DISPONIBLE / RESERVADO / VENDIDO / RETIRADO
    private String  tipo;            // PISO / CASA / CHALET / ATICO / LOCAL_COMERCIAL …
    private String  ciudad;
    private String  zona;
    private Integer habitaciones;
    private Integer banos;
    private Double  superficieUtil;
    private Double  mConstruidos;
    private String  descripcion;
    private String  imagenPortadaUrl; // null si no tiene imágenes asignadas
    private Boolean destacado;

    // Características clave extraídas de caracteristicasExtra
    // Permiten filtrar por ascensor/parking/jardín/piscina en el frontend
    private Boolean tieneAscensor;
    private Boolean tieneGaraje;
    private Boolean tieneJardin;
    private Boolean tienePiscina;
}
