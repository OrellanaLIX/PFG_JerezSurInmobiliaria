package com.jerezsur.inmobiliaria.models;

import com.jerezsur.inmobiliaria.models.enums.EstadoCita;
import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "citas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cita {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS DE LA CITA ---
    @NotNull(message = "La fecha y hora son obligatorias")
    @Future(message = "La cita debe ser en una fecha futura")
    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    private EstadoCita estado; // PENDIENTE, CONFIRMADA, CANCELADA, REALIZADA

    @Column(columnDefinition = "TEXT")
    private String notasTrabajador; // Comentarios tras la visita (ej: "Le ha gustado la cocina")

    // --- RELACIONES ---

    // La cita pertenece a un inmueble concreto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inmueble_id", nullable = false)
    private Inmueble inmueble;

    // Un solo trabajador es el responsable de la visita
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;

    // El comprador principal (titular de la cita)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id", nullable = false)
    private Comprador comprador;

    // --- AUDITORÍA DE SISTEMA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaCreacion;
}