package com.jerezsur.inmobiliaria.dto;

import com.jerezsur.inmobiliaria.models.enums.RolParticipante;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/**
 * DTO de entrada para abrir un nuevo expediente de operación inmobiliaria.
 *
 * Dependiendo de categoria_operacion ("VENTA" o "ALQUILER"), el servicio creará
 * una OperacionVenta o una OperacionAlquiler (herencia de tabla única en JPA).
 * Los campos de venta (arras, escritura) y alquiler (fianza, duración) son opcionales
 * entre sí: solo se usan los del tipo correspondiente, el resto se ignoran.
 *
 * interesadosRol mapea el ID del interesado a su rol en la operación
 * (COMPRADOR, INQUILINO, AVALISTA...) para registrar quién participa y cómo.
 */
@Getter
@Setter
@NoArgsConstructor
public class CrearOperacionDTO {

    private String categoria_operacion; // "VENTA" o "ALQUILER"
    private BigDecimal precioAcordado;
    private Long inmuebleId;
    private Long trabajadorId; // Trabajador responsable (opcional)
    private Map<Long, RolParticipante> interesadosRol; // { interesadoId: ROL }

    // Campos específicos de VENTA
    private BigDecimal depositoArras;
    private LocalDate fechaLimiteEscritura;
    private Boolean incluyeMobiliario;

    // Campos específicos de ALQUILER
    private BigDecimal fianza;
    private Integer duracionMeses;
    private Boolean admiteMascotas;
}
