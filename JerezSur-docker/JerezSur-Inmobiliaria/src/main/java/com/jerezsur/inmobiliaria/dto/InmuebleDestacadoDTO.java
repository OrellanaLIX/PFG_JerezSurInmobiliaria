package com.jerezsur.inmobiliaria.dto;

import java.math.BigDecimal;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
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
