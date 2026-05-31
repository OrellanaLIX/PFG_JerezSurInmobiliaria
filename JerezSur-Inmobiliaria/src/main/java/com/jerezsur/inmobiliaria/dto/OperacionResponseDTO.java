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
