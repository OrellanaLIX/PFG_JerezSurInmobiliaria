package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.Builder.Default;
import java.time.LocalDate;

/**
 * Entidad que representa una tarea pendiente en el panel de administración.
 *
 * Las tareas pueden ser:
 * - Manuales: creadas por un trabajador desde el dashboard
 * - Automáticas: generadas por el sistema cuando llega una cita, un contacto, etc.
 *
 * El campo "prioridad" no es un enum sino un String ("ALTA", "MEDIA", "BAJA")
 * para mayor flexibilidad si queremos añadir más niveles en el futuro.
 *
 * El enlace y la etiquetaEnlace son opcionales: si existen, aparecerá un botón
 * en el dashboard que lleva directamente a la sección relacionada.
 */
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

    // Título corto que aparece en la lista de tareas del dashboard
    @Column(nullable = false)
    private String titulo;

    // Descripción larga opcional con más detalles de lo que hay que hacer
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // Fecha de vencimiento: el día en que hay que haberla completado
    @Column(nullable = false)
    private LocalDate fecha;

    // "ALTA", "MEDIA" o "BAJA" — determina el color del badge en el dashboard
    @Column(nullable = false, length = 10)
    private String prioridad;

    // Ruta interna del panel a la que lleva el botón de acción (ej: "/citas", "/contactos")
    @Column(length = 500)
    private String enlace;

    // Texto que aparece en el botón de acción (ej: "Ver citas", "Ver mensajes")
    @Column(length = 50)
    private String etiquetaEnlace;

    // Fecha en que se creó la tarea (para auditoría)
    @Column(nullable = false)
    @Default
    private LocalDate fechaCreacion = LocalDate.now();

    // @PrePersist garantiza que siempre haya fecha de creación aunque el Builder no la incluya
    @PrePersist
    protected void prePersist() {
        if (fechaCreacion == null) fechaCreacion = LocalDate.now();
    }
}
