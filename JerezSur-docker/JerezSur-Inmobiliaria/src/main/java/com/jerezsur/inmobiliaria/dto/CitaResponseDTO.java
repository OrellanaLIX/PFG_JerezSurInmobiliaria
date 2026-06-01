package com.jerezsur.inmobiliaria.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

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
    private String nombreTrabajador;
    private String direccionInmueble;
    private Long inmuebleId;
    private String inmuebleTitulo;
}