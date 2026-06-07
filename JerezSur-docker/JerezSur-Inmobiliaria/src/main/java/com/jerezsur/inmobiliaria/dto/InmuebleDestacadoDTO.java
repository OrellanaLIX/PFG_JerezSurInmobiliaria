package com.jerezsur.inmobiliaria.dto;

import java.math.BigDecimal;
import lombok.*;

/**
 * DTO minimalista para los inmuebles que aparecen en la sección "destacados" de la portada.
 *
 * Solo enviamos los campos que la tarjeta de portada necesita mostrar:
 * foto, título, precio, tipo de operación y características básicas.
 * Evitamos incluir datos como descripción o gastos para que la respuesta
 * sea lo más ligera posible, ya que esta llamada se hace al cargar la página principal.
 */
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
