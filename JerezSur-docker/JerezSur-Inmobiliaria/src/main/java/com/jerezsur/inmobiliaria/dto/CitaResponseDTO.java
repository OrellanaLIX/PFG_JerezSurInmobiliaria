package com.jerezsur.inmobiliaria.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para las citas. Agrupa los datos necesarios para que el frontend
 * pueda mostrar una cita sin necesidad de hacer llamadas adicionales al backend:
 * incluye el nombre del cliente, del trabajador asignado y el título del inmueble
 * para que tanto el calendario como la lista de citas del admin sean autocontenidos.
 *
 * La fecha se serializa en formato ISO 8601 para que JavaScript la parsee sin ambigüedades.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitaResponseDTO {

    private Long id;
    private String nombreCliente;
    private String telefonoCliente;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaHora;

    private String motivo;
    private String estado;
    private Long trabajadorId;
    private String nombreTrabajador;
    private String direccionInmueble;
    private Long inmuebleId;
    private String inmuebleTitulo;
}