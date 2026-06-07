package com.jerezsur.inmobiliaria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

/**
 * DTO de entrada para crear una tarea en la agenda del panel de administración.
 *
 * Las tareas pueden crearse manualmente por el trabajador (desde el dashboard)
 * o automáticamente por otros servicios (por ejemplo, cuando se crea una cita
 * o se abre una operación). Los campos enlace y etiquetaEnlace son opcionales
 * y permiten añadir un botón de acceso rápido a la sección relacionada del panel.
 */
@Data
public class CrearTareaDTO {

    @NotBlank
    private String titulo;

    private String descripcion;

    @NotNull
    private LocalDate fecha;

    @NotBlank
    private String prioridad;

    // Campos opcionales — usados por otros services al crear tareas automáticas
    private String enlace;
    private String etiquetaEnlace;
    private LocalDate fechaCreacion;
}