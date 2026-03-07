package com.jerezsur.inmobiliaria.models;

import com.jerezsur.inmobiliaria.models.enums.CalidadFirma;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "operacion_vendedor")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Operacion_Vendedor {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- RELACIONES ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operacion_id", nullable = false)
    private Operacion operacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Vendedor vendedor;

    // --- CAMPOS ADICIONALES ---
    @Enumerated(EnumType.STRING)
    private CalidadFirma enCalidad; // Ej: "Copropietario", "Apoderado", "Albacea"
}