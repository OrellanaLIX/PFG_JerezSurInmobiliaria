package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("ALQUILER")
@Data
@EqualsAndHashCode(callSuper = true)
public class OperacionAlquiler extends Operacion {
    private BigDecimal fianza;
    private Integer duracionMeses;
    private Boolean admiteMascotas;
}