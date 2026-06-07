package com.jerezsur.inmobiliaria.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.*;

/**
 * DTO con el detalle completo de un inmueble para la ficha pública de la web.
 *
 * A diferencia de InmuebleListadoDTO (que solo lleva lo justo para la tarjeta),
 * este DTO incluye todos los campos que el visitante puede ver: descripción completa,
 * características extra, imágenes, gastos de comunidad, etc.
 *
 * Lo que NO incluimos aquí es: notas privadas del agente, referencia catastral,
 * datos de los propietarios y documentos internos (nota simple, plano...).
 * Esos campos solo los ven los trabajadores desde el panel de administración.
 */
@Data
@Builder
@NoArgsConstructor
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
