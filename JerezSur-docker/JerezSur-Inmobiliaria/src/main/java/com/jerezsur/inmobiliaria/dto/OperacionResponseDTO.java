package com.jerezsur.inmobiliaria.dto;

import com.jerezsur.inmobiliaria.models.enums.EstadoOperacion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO de respuesta para una operación inmobiliaria (compraventa o alquiler).
 *
 * Agrupa en un solo objeto todo lo que el panel admin necesita para mostrar
 * el expediente: datos del inmueble, compradores con su rol, documentos asociados
 * y los campos específicos de venta o alquiler según el tipo.
 *
 * Usamos clases internas estáticas (InmuebleBasico, ContratoBasico) para evitar
 * devolver entidades completas con datos innecesarios o referencias circulares
 * que causarían un bucle infinito al serializar con Jackson.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperacionResponseDTO {

    private Long id;
    private String categoria_operacion;
    private EstadoOperacion estadoActual;
    private BigDecimal precioAcordado;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaUltimaActualizacion;

    private InmuebleBasico inmueble;
    private Map<String, String> compradoresRol;
    private List<ContratoBasico> documentos;

    // VENTA
    private BigDecimal depositoArras;
    private LocalDate fechaLimiteEscritura;
    private Boolean incluyeMobiliario;

    // ALQUILER
    private BigDecimal fianza;
    private Integer duracionMeses;
    private Boolean admiteMascotas;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InmuebleBasico {
        private Long id;
        private String referencia;
        private String direccion;
        private String ciudad;
        private BigDecimal precio;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContratoBasico {
        private Long id;
        private String modelo;
        private String estado;
        private String fechaFirma;
        private String urlDocumentoPdf;
    }
}
