package com.jerezsur.inmobiliaria.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO para solicitar una cita siendo usuario registrado.
 *
 * Al estar autenticado ya sabemos quién es el usuario, así que no necesitamos
 * pedirle nombre ni teléfono de nuevo (eso sería una mala UX). Solo pedimos
 * la fecha deseada, el motivo y el inmueble que quiere visitar (opcional si es
 * una consulta general en oficina).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudCitaUsuarioDTO {

    @NotNull(message = "El ID de usuario es obligatorio")
    private Long usuarioId;

    private Long inmuebleId;

    private Long trabajadorId;

    @NotNull(message = "La fecha es obligatoria")
    @Future(message = "La fecha debe ser futura")
    private LocalDateTime fechaHora;

    private String motivo;
}
