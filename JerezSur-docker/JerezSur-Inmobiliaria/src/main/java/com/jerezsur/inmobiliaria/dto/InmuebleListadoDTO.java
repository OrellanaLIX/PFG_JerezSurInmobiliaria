package com.jerezsur.inmobiliaria.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * DTO ligero para el listado paginado de inmuebles en la web pública y el panel admin.
 *
 * No exponemos todos los campos del modelo Inmueble (como notas privadas o refCatastral)
 * porque aquí solo necesitamos lo justo para pintar las tarjetas de la rejilla de búsqueda.
 * Cuantos menos datos viajan por la red, más rápida es la respuesta paginada.
 *
 * Los booleanos de características (ascensor, garaje, jardín, piscina) se extraen
 * del mapa caracteristicasExtra en el servicio para que el frontend pueda filtrar
 * por ellos sin tener que parsear el mapa él mismo.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
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
