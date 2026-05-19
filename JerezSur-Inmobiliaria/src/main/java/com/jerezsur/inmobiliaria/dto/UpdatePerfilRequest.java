package com.jerezsur.inmobiliaria.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class UpdatePerfilRequest {
    
    // Datos básicos
    private String nombre;
    private String apellidos;
    private String dni;
    private String telefono;
    private String email;
    private String imagenPerfilUrl;
    
    // Perfil
    private String perfil; // "interesado" | "propietario" | "ambos"
    
    // Contraseña
    private String passwordActual;
    private String nuevaPassword;
    
    // Datos de interesado
    private BigDecimal presupuestoMaximo;
    private String zonaInteres;
    private Integer habitacionesMinimas;
    private Integer banosMinimos;
    private String tipoOperacion;
    private String observacionesInteresado;
    
    // Datos de vendedor
    private String observacionesVendedor;
}
