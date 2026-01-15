package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contrato_vendedor")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contrato_Vendedor {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- RELACIONES ---

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrato_id", nullable = false)
    private Contrato contrato;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Vendedor vendedor;

    // --- CAMPOS ADICIONALES ---
    @Builder.Default
    private Boolean firmoEnRepresentacion = false; // Por si alguien firma por otro con poderes

    private String calidadFirma; // Ej: "Copropietario", "Apoderado", "Albacea"
}