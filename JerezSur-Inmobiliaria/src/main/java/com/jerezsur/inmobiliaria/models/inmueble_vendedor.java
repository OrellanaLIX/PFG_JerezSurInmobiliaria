package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inmuebles_vendedores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inmueble_Vendedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Inmueble
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inmueble_id", nullable = false)
    private Inmueble inmueble;

    // Relación con el Vendedor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Vendedor vendedor;

    // Campo opcional pero muy útil: Porcentaje de propiedad (ej: 50.0)
    private Double porcentajePropiedad;
}