package com.jerezsur.inmobiliaria.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

// DTO para solicitar una cita siendo usuario registrado: solo necesita la fecha y el inmueble.
@Data
// DTO para solicitar una cita siendo usuario registrado: solo necesita la fecha y el inmueble.
@Builder
// DTO para solicitar una cita siendo usuario registrado: solo necesita la fecha y el inmueble.
@NoArgsConstructor
// DTO para solicitar una cita siendo usuario registrado: solo necesita la fecha y el inmueble.
@AllArgsConstructor
public class SolicitudCitaUsuarioDTO {

    @NotNull(message = "El ID de usuario es obligatorio")
    private Long usuarioId;

    private Long inmuebleId;

    @NotNull(message = "La fecha es obligatoria")
    @Future(message = "La fecha debe ser futura")
    private LocalDateTime fechaHora;

    private String motivo;
}
