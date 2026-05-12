package com.jerezsur.inmobiliaria.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OnboardingRequest {
    private Long usuarioId; // ID del usuario logueado
    private String perfil; // "interesado", "propietario" o "ambos"
    
    // Datos comunes
    private String nombre;
    private String apellidos;
    private String telefono;
    private String dni;
    
    // Datos de búsqueda (Interesado)
    private BigDecimal presupuestoMaximo;
    private String zonaInteres;
    private Integer habitacionesMinimas;
    private Integer banosMinimos;
    private String tipoOperacion; // COMPRA, ALQUILER
    
    // Datos de propiedad (Vendedor)
    private String detallesPropiedad;
    private String comentariosExtra;
}