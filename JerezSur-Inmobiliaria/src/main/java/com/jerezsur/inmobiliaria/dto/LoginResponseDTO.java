package com.jerezsur.inmobiliaria.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponseDTO {
    private String token;
    private Long userId;
    private String nombre;
    private String email;
    private String role;
    private boolean esTrabajador;
}