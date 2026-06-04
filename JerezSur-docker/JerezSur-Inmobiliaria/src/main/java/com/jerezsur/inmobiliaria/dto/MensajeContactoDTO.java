package com.jerezsur.inmobiliaria.dto;

import lombok.Data;

// DTO para recibir mensajes de contacto desde el formulario público.
// Usamos un DTO en lugar de la entidad para evitar que Hibernate Validator
// bloquee el guardado cuando el telefono es opcional o está vacío.
@Data
public class MensajeContactoDTO {
    private String nombre;
    private String email;
    private String telefono;
    private String mensaje;
    private Long inmuebleId; // opcional: null si es consulta general sin inmueble
}
