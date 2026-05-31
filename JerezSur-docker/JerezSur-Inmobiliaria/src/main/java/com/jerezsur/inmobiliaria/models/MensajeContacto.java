package com.jerezsur.inmobiliaria.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mensajes_contacto")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MensajeContacto {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS DEL REMITENTE ---
    @NotNull(message = "El nombre es obligatorio")
    private String nombre;

    @Email(message = "El formato del email no es válido")
    private String email;

    @NotNull(message = "El teléfono es obligatorio")
    private String telefono;

    // --- CONTENIDO DEL MENSAJE ---
    @Column(columnDefinition = "TEXT")
    private String mensaje; // Consulta detallada del cliente

    @Default
    private boolean leido = false; // Estado de gestión del mensaje

    // --- RELACIONES ---

    // Inmueble por el que se está solicitando información (puede ser nulo si es
    // consulta general)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inmueble_id")
    private Inmueble inmueble;

    // --- AUDITORÍA Y CONTROL ---
    @Column(name = "fecha_envio", updatable = false)
    private LocalDateTime fechaEnvio;

    @PrePersist
    protected void onCreate() {
        this.fechaEnvio = LocalDateTime.now();
    }

        // --- AUDITORÍA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;
}