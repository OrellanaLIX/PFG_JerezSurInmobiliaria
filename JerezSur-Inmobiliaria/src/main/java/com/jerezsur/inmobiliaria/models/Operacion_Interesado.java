package com.jerezsur.inmobiliaria.models;

import com.jerezsur.inmobiliaria.models.enums.RolParticipante;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "comprador_operacion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Operacion_Interesado {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- RELACIONES ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operacion_id", nullable = false)
    private Operacion operacion; // Relación con la Operacion

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interesado_id", nullable = false)
    private Interesado comprador; // Relación con el Comprador

    // --- OTROS CAMPOS ---
    @Enumerated(EnumType.STRING)
    private RolParticipante rol; // TITULAR, APODERADO
}