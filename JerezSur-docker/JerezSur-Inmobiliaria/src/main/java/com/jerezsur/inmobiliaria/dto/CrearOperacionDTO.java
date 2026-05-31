package com.jerezsur.inmobiliaria.dto;

import com.jerezsur.inmobiliaria.models.enums.RolParticipante;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class CrearOperacionDTO {

    private String categoria_operacion; // "VENTA" o "ALQUILER"
    private BigDecimal precioAcordado;
    private Long inmuebleId;
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
