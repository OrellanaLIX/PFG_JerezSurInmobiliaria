package com.jerezsur.inmobiliaria.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

// DTO para crear citas desde el panel de administración.
// Sin restricción @Future en la fecha para permitir citas retroactivas.
// Sin @AssertTrue de privacidad porque el admin actúa en nombre del cliente.
@Data
public class CitaAdminDTO {

    @NotBlank(message = "El nombre del cliente es obligatorio")
    private String nombre;

    private String telefono;

    private String email;

    @NotNull(message = "La fecha y hora son obligatorias")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaHora;

    private String motivo;

    private Long inmuebleId;

    // Si se proporciona, la cita se crea directamente en estado CONFIRMADA
    private Long trabajadorId;
}
