package com.jerezsur.inmobiliaria.dto;

import java.math.BigDecimal;

import lombok.Data;

// DTO del flujo de onboarding: completa el perfil del usuario después del primer login social.
@Data
public class OnboardingRequest {

    private Long usuarioId;
    private String perfil; // "interesado", "propietario" o "ambos"

    // Datos del usuario
    private String nombre;
    private String apellidos;
    private String telefono;
    private String email;
    private String dni;

    // Cambio de contraseña
    private String nuevaPassword; // solo si cambiarPasswd = true

    // Datos de búsqueda (Interesado)
    private BigDecimal presupuestoMaximo;
    private String zonaInteres;
    private Integer habitacionesMinimas;
    private Integer banosMinimos;
    private String tipoOperacion; // VENTA, ALQUILER, CUALQUIERA

    // Datos de propiedad (Vendedor)
    private String detallesPropiedad;
    private String comentariosExtra;
}