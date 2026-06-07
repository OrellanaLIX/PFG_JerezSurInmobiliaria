package com.jerezsur.inmobiliaria.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

/**
 * DTO de entrada para actualizar el perfil de un usuario desde el panel de administración.
 *
 * Cubre tres casos de uso en un solo DTO para simplificar el endpoint:
 *   1. El usuario actualiza sus datos básicos (nombre, teléfono, foto...)
 *   2. El admin cambia el rol o activa/desactiva la cuenta
 *   3. El admin vincula o desvincula sub-perfiles (trabajador, interesado, vendedor)
 *
 * Los flags desvincular* permiten eliminar un sub-perfil sin borrar el usuario.
 * Por ejemplo, si un interesado ya compró su piso, el admin puede desvincularlo
 * del perfil de interesado sin eliminar su cuenta.
 */
@Data
public class UpdatePerfilRequest {

    // Datos básicos
    private String nombre;
    private String apellidos;
    private String dni;
    private String telefono;
    private String email;
    private String imagenPerfilUrl;

    // Perfil — "trabajador" | "interesado" | "propietario" | "ambos"
    private String perfil;

    // Contraseña
    private String passwordActual;
    private String nuevaPassword;
    private String role;
    private Boolean cuentaActivada;
    private Boolean cambiarPasswd;

    // ── Datos de trabajador (NUEVO) ──
    private String dniTrabajador; // DNI corporativo (distinto del DNI del usuario)
    private String cargo;
    private LocalDate fechaInicioContrato;
    private LocalDate fechaFinContrato; // nullable
    private Boolean activoTrabajador;
    private String observacionesLaborales;

    // ── Datos de interesado ──
    private BigDecimal presupuestoMaximo;
    private String zonaInteres;
    private Integer habitacionesMinimas;
    private Integer banosMinimos;
    private String tipoOperacion;
    private String observacionesInteresado;
    private Boolean requiereHipoteca;

    // ── Datos de vendedor ──
    private String observacionesVendedor;

    // ── Flags de desvinculación (NUEVO) ──
    // El frontend los envía a true cuando el admin quiere eliminar ese sub-perfil
    private Boolean desvincularTrabajador;
    private Boolean desvincularInteresado;
    private Boolean desvincularVendedor;
}