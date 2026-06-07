package com.jerezsur.inmobiliaria.dto;

import lombok.Data;

/**
 * DTO de entrada para el login de usuarios.
 *
 * El campo username acepta tanto email como número de teléfono, porque en el formulario
 * de React se llama "identifier" y el servicio de login prueba ambos formatos.
 * Usamos un nombre genérico para no romper la compatibilidad con el campo estándar
 * que Spring Security espera por convención.
 */
@Data
public class LoginRequest {
    private String username; // puede ser email o teléfono — el servicio prueba ambos
    private String password;
}