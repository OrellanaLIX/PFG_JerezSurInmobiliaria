package com.jerezsur.inmobiliaria.dto;

import java.math.BigDecimal;

import lombok.Data;

/**
 * DTO del flujo de onboarding para usuarios que acceden por primera vez con Google o Facebook.
 *
 * Cuando alguien se registra con OAuth social, creamos su cuenta con datos mínimos
 * (email, nombre del proveedor) y marcamos cambiarPasswd=true. En el siguiente acceso
 * lo redirigimos al onboarding para que complete su perfil: elija su rol (interesado,
 * propietario o ambos) y rellene los datos específicos de ese rol.
 * Solo entonces se le da acceso completo a la aplicación.
 */
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