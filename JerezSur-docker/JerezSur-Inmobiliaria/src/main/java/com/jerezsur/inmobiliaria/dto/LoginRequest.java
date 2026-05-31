package com.jerezsur.inmobiliaria.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username; // Este es el 'identifier' de React
    private String password;
}