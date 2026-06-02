package com.jerezsur.inmobiliaria.dto;

import java.math.BigDecimal;
import lombok.*;

// DTO ligero para los inmuebles destacados de la portada (solo los campos necesarios para la tarjeta).
@Getter
// DTO ligero para los inmuebles destacados de la portada (solo los campos necesarios para la tarjeta).
@Setter
// DTO ligero para los inmuebles destacados de la portada (solo los campos necesarios para la tarjeta).
@Builder
// DTO ligero para los inmuebles destacados de la portada (solo los campos necesarios para la tarjeta).
@NoArgsConstructor
// DTO ligero para los inmuebles destacados de la portada (solo los campos necesarios para la tarjeta).
@AllArgsConstructor
public class InmuebleDestacadoDTO {
    private Long id;
    private String referencia;
    private String titulo;
    private BigDecimal precio;
    private String operacion;
    private String ciudad;
    private String zona;
    private Integer habitaciones;
    private Integer banos;
    private Double superficieUtil;
    private String imagenPortadaUrl;
}
