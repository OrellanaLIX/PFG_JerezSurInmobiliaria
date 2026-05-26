package com.jerezsur.inmobiliaria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

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