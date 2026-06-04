package com.jerezsur.inmobiliaria.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

// DTO para solicitar una cita de forma anónima (sin cuenta): nombre, teléfono y fecha deseada.
@Data
public class SolicitudCitaPublicaDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100)
    private String nombre;

    // El teléfono es opcional cuando el usuario ya está autenticado (se identifica por su cuenta)
    // @Pattern solo aplica si el valor no es nulo/vacío para no bloquear usuarios logueados sin teléfono
    @Pattern(regexp = "^$|^[0-9+\\s-]{9,20}$", message = "El formato del teléfono no es válido")
    private String telefono;

    @Email(message = "El formato del email no es válido")
    private String email; // opcional

    @NotNull(message = "La fecha y hora son obligatorias")
    @Future(message = "La cita debe ser en una fecha futura")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaHora;

    @Size(max = 500, message = "El mensaje no puede superar 500 caracteres")
    private String motivo;

    /**
     * ID del inmueble si la cita es para visitar uno concreto.
     * null si es una cita genérica en oficinas.
     */
    private Long inmuebleId;

    @AssertTrue(message = "Debes aceptar la política de privacidad")
    private Boolean aceptaPrivacidad;
}