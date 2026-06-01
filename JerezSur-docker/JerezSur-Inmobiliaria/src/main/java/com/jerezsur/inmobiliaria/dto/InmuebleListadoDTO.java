package com.jerezsur.inmobiliaria.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InmuebleListadoDTO {
    private Long id;
    private String referencia;
    private String titulo;
    private BigDecimal precio;
    private String operacion;   // VENTA / ALQUILER / CUALQUIERA
    private String estado;      // DISPONIBLE / RESERVADO / VENDIDO / RETIRADO
    private String tipo;        // PISO / CASA / CHALET …
    private String ciudad;
    private String zona;
    private Integer habitaciones;
    private Integer banos;
    private Double superficieUtil;
    private Double mConstruidos;
    private String descripcion;
    private String imagenPortadaUrl;  // null si no tiene imágenes asignadas
    private Boolean destacado;
}
