package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "inmueble_propietario_porcentaje")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class InmueblePropietario {

    @EmbeddedId
    private InmueblePropietarioId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("inmuebleId")
    @JoinColumn(name = "inmueble_id")
    @ToString.Exclude
    private Inmueble inmueble;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("vendedorId")
    @JoinColumn(name = "vendedor_id")
    private Vendedor vendedor;

    @Column(name = "porcentaje")
    private Double porcentaje;
}
