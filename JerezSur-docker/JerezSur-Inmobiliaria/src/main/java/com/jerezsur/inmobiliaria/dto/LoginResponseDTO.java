package com.jerezsur.inmobiliaria.dto;

import lombok.Builder;
import lombok.Data;

/**
 * DTO que devuelve el servidor cuando el login es exitoso.
 * El frontend guarda estos datos en localStorage para mantener la sesión.
 *
 * @Data genera automáticamente getters, setters, equals y toString (Lombok)
 * @Builder permite construir el objeto con el patrón builder: LoginResponseDTO.builder().token(...).build()
 */
@Data
@Builder
public class LoginResponseDTO {
    // Token JWT que el frontend enviará en cada petición protegida (cabecera Authorization: Bearer)
    private String token;
    // ID del usuario en la base de datos
    private Long userId;
    // ID del trabajador asociado (null si el usuario no es trabajador)
    private Long trabajadorId;
    private String nombre;
    private String email;
    // Rol del usuario: ROLE_ADMIN, ROLE_TRABAJADOR, ROLE_INTERESADO, etc.
    private String role;
    // true si el usuario tiene perfil de trabajador (da acceso al panel admin)
    private boolean esTrabajador;
}