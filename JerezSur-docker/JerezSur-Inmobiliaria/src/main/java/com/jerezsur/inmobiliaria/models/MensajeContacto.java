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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

// Entidad de mensaje de contacto: guarda los mensajes que los visitantes envían desde la web pública.
// Al crearse, se notifica automáticamente al admin por WhatsApp y se genera una tarea pendiente.
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
    // nombre es el único campo realmente obligatorio para gestionar el contacto
    private String nombre;

    @Email(message = "El formato del email no es válido")
    private String email;

    // telefono es opcional — los usuarios logueados pueden no tenerlo
    @Column(nullable = true)
    private String telefono;

    // --- CONTENIDO DEL MENSAJE ---
    @Column(columnDefinition = "TEXT")
    private String mensaje; // Consulta detallada del cliente

    @Default
    private boolean leido = false; // Estado de gestión del mensaje

    // --- RELACIONES ---

    // Inmueble vinculado (si la consulta es sobre un inmueble específico).
    // @JsonIgnore en el listado general para evitar LazyInitializationException.
    // El detalle de un mensaje devuelve el inmueble como Map manual en el controller.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inmueble_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
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