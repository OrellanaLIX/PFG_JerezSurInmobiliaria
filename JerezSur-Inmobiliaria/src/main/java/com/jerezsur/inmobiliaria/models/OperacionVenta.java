package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("VENTA")
@Data
@EqualsAndHashCode(callSuper = true)
public class OperacionVenta extends Operacion {
    private BigDecimal depositoArras;
    private LocalDate fechaLimiteEscritura;
    private Boolean incluyeMobiliario;
}