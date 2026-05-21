package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.Builder.Default;

import java.time.LocalDate;

@Entity
@Table(name = "tareas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    private String descripcion;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private String prioridad; // "ALTA", "MEDIA", "BAJA"

    @Column(nullable = false)
    @Default
    private boolean completada = false;
}