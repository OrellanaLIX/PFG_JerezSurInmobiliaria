package com.jerezsur.inmobiliaria.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.*;

// DTO de detalle público de un inmueble: excluye campos internos como notas privadas o costes del propietario.
@Data
// DTO de detalle público de un inmueble: excluye campos internos como notas privadas o costes del propietario.
@Builder
// DTO de detalle público de un inmueble: excluye campos internos como notas privadas o costes del propietario.
@NoArgsConstructor
// DTO de detalle público de un inmueble: excluye campos internos como notas privadas o costes del propietario.
@AllArgsConstructor
public class InmuebleDetallePublicoDTO {

    private Long id;
    private String referencia;
    private String titulo;
    private String descripcion;
    private BigDecimal precio;
    private String operacion;
    private String estado;
    private String tipo;

    private Double superficieUtil;
    private Double mConstruidos;
    private Integer habitaciones;
    private Integer banos;

    private String direccion;
    private String zona;
    private String codigoPostal;
    private String ciudad;

    private BigDecimal comunidad;
    private Boolean tieneDerrama;
    private BigDecimal valorDerrama;
    private BigDecimal ibi;

    private String urlCertificadoEnergetico;

    private Map<String, String> caracteristicasExtra;

    private List<ImagenPublicaDTO> imagenes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImagenPublicaDTO {
        private Long id;
        private String url;
        private Boolean esPortada;
    }
}
