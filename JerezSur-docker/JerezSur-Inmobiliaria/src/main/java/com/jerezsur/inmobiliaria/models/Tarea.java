package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.Builder.Default;
import java.time.LocalDate;

@Entity
@Table(name = "tareas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 10)
    private String prioridad;

    @Column(length = 500)
    private String enlace;

    @Column(length = 50)
    private String etiquetaEnlace;

    @Column(nullable = false)
    @Default
    private LocalDate fechaCreacion = LocalDate.now();

    @jakarta.persistence.PrePersist
    protected void prePersist() {
        if (fechaCreacion == null) fechaCreacion = LocalDate.now();
    }
}