package com.jerezsur.inmobiliaria.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import com.jerezsur.inmobiliaria.models.enums.EstadoCita;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

// Entidad que representa una cita de visita a un inmueble.
// Puede ser solicitada por un usuario registrado o de forma anónima con solo nombre y teléfono.
@Entity
@Table(name = "citas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Column(columnDefinition = "TEXT")
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Default
    @Column(nullable = false, length = 50)
    private EstadoCita estado = EstadoCita.PENDIENTE_ASIGNACION;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"usuario", "trabajador", "interesado", "vendedor", "citas"})
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "trabajador_id")
    private Trabajador trabajador;

    @ManyToOne
    @JoinColumn(name = "inmueble_id")
    private Inmueble inmueble;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaCreacion;
}