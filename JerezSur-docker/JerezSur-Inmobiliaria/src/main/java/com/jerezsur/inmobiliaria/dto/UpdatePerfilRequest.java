package com.jerezsur.inmobiliaria.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

// DTO para actualizar los datos del perfil del usuario desde la página de perfil.
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