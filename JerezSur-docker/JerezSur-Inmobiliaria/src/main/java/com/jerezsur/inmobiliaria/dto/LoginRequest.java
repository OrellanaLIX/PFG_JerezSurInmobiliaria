package com.jerezsur.inmobiliaria.dto;

import lombok.Data;

// DTO de petición de login: username (puede ser email o teléfono) y password.
@Data
public class LoginRequest {
    private String username; // Este es el 'identifier' de React
    private String password;
}