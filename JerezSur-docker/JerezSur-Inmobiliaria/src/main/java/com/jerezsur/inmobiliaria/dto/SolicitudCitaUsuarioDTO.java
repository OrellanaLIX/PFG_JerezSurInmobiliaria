package com.jerezsur.inmobiliaria.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
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
