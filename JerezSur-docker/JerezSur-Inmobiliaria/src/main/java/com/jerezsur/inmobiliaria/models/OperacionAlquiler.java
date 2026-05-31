package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("ALQUILER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class OperacionAlquiler extends Operacion {

    // --- DATOS ESPECÍFICOS DEL ARRENDAMIENTO ---
    private BigDecimal fianza; // Importe depositado como garantía

    private Integer duracionMeses; // Tiempo de contrato pactado

    private Boolean admiteMascotas; // Condición específica del propietario
}