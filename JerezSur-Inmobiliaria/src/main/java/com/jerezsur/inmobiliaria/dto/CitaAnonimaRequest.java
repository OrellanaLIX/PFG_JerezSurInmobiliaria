package com.jerezsur.inmobiliaria.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CitaAnonimaRequest {

    private String nombre;
    private String telefono;
    private String email;
    private String codigoVerificacion;
    private Long inmuebleId;        // null = cita en oficina
    private LocalDateTime fechaHoraDeseada;
    private String mensaje;
}