package com.jerezsur.inmobiliaria.models;

import com.jerezsur.inmobiliaria.models.enums.RolParticipante;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "compradores_contratos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contrato_Comprador {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- RELACIONES ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrato_id", nullable = false)
    private Contrato contrato; // Relación con el Comprador

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id", nullable = false)
    private Comprador comprador; // Relación con el Comprador

    // --- OTROS CAMPOS ---
    @Enumerated(EnumType.STRING)
    private RolParticipante rol; // TITULAR, APODERADO
}