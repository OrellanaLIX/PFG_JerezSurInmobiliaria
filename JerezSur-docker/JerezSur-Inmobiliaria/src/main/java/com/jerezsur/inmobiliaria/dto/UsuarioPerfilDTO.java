package com.jerezsur.inmobiliaria.dto;

import com.jerezsur.inmobiliaria.models.enums.OrigenUsuario;
import com.jerezsur.inmobiliaria.models.enums.Role;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO seguro para devolver datos del usuario al frontend.
 * Nunca expone la contraseña ni datos internos.
 */
@Data
public class UsuarioPerfilDTO {

    private Long id;
    private String email;
    private String telefono;
    private String nombre;
    private String apellidos;
    private String dni;
    private String imagenPerfilUrl;
    private Role role;
    private Boolean cambiarPasswd;
    private LocalDateTime fechaRegistro;

    // --- DATOS DE TRABAJADOR (si aplica) ---
    private Long trabajadorId;
    private String cargo;
    private String dniTrabajador;
    private LocalDate fechaInicioContrato;
    private LocalDate fechaFinContrato;
    private Boolean activoTrabajador;
    private String observacionesLaborales;

    // --- DATOS DE INTERESADO (si aplica) ---
    private Long interesadoId;
    private String zonaInteres;
    private String presupuestoMaximo;
    private Integer habitacionesMinimas;
    private Integer banosMinimos;
    private String tipoBusqueda;
    private String observacionesInteresado;

    // --- DATOS DE VENDEDOR (si aplica) ---
    private Long vendedorId;
    private String observacionesVendedor;

    private Boolean cuentaActivada;
    private OrigenUsuario origen;
}