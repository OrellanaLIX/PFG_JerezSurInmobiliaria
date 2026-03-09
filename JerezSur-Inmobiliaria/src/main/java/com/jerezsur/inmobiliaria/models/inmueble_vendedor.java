package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inmuebles_vendedores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inmueble_Vendedor {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS DE LA PROPIEDAD ---
    // Porcentaje de titularidad sobre el inmueble (ej: 50.0 para proindivisos)
    private Double porcentajePropiedad;

    // --- RELACIONES ---

    // El inmueble que está vinculado a uno o varios dueños
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inmueble_id", nullable = false)
    private Inmueble inmueble;

    // El vendedor que posee una parte o la totalidad del inmueble
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Vendedor vendedor;
}