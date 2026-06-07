package com.jerezsur.inmobiliaria.dto;

import com.jerezsur.inmobiliaria.models.enums.OrigenUsuario;
import com.jerezsur.inmobiliaria.models.enums.Role;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO que devuelve el perfil completo de un usuario al frontend de forma segura.
 *
 * Nunca incluimos la contraseña ni el hash porque no tiene sentido exponerlos.
 * Este DTO es "polimórfico": dependiendo del rol del usuario, algunos campos
 * estarán rellenos y otros serán null. Por ejemplo, un trabajador tiene
 * cargo y fechaInicioContrato, pero un interesado tiene zonaInteres y presupuesto.
 * Es más sencillo tener un único DTO con todos los campos que crear una jerarquía
 * de DTOs para cada tipo de usuario.
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