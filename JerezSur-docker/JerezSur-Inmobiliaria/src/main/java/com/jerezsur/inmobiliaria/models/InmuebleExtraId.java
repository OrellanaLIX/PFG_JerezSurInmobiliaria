package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InmuebleExtraId implements Serializable {

    @Column(name = "inmueble_id")
    private Long inmuebleId;

    @Column(name = "clave")
    private String clave;
}
