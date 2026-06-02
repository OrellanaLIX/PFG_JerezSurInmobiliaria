package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

// Subclase de Operacion para las compraventas.
// Añade los campos específicos de la venta: precio de venta acordado y fecha de firma prevista.
@Entity
@DiscriminatorValue("VENTA")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class OperacionVenta extends Operacion {

    // --- DATOS ESPECÍFICOS DE LA COMPRAVENTA ---
    private BigDecimal depositoArras; // Cantidad entregada en la señalización

    private LocalDate fechaLimiteEscritura; // Fecha máxima para firmar ante notario

    private Boolean incluyeMobiliario; // Indica si el precio incluye muebles o está vacío
}