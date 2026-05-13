package com.jerezsur.inmobiliaria.dto;

import com.jerezsur.inmobiliaria.models.enums.Role;
import java.time.LocalDateTime;

/**
 * DTO seguro para devolver datos del usuario al frontend.
 * Nunca expone la contraseña ni datos internos.
 */
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

    public UsuarioPerfilDTO() {}

    // --- GETTERS Y SETTERS ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getImagenPerfilUrl() { return imagenPerfilUrl; }
    public void setImagenPerfilUrl(String imagenPerfilUrl) { this.imagenPerfilUrl = imagenPerfilUrl; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Boolean getCambiarPasswd() { return cambiarPasswd; }
    public void setCambiarPasswd(Boolean cambiarPasswd) { this.cambiarPasswd = cambiarPasswd; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public Long getInteresadoId() { return interesadoId; }
    public void setInteresadoId(Long interesadoId) { this.interesadoId = interesadoId; }

    public String getZonaInteres() { return zonaInteres; }
    public void setZonaInteres(String zonaInteres) { this.zonaInteres = zonaInteres; }

    public String getPresupuestoMaximo() { return presupuestoMaximo; }
    public void setPresupuestoMaximo(String presupuestoMaximo) { this.presupuestoMaximo = presupuestoMaximo; }

    public Integer getHabitacionesMinimas() { return habitacionesMinimas; }
    public void setHabitacionesMinimas(Integer habitacionesMinimas) { this.habitacionesMinimas = habitacionesMinimas; }

    public Integer getBanosMinimos() { return banosMinimos; }
    public void setBanosMinimos(Integer banosMinimos) { this.banosMinimos = banosMinimos; }

    public String getTipoBusqueda() { return tipoBusqueda; }
    public void setTipoBusqueda(String tipoBusqueda) { this.tipoBusqueda = tipoBusqueda; }

    public String getObservacionesInteresado() { return observacionesInteresado; }
    public void setObservacionesInteresado(String observacionesInteresado) { this.observacionesInteresado = observacionesInteresado; }

    public Long getVendedorId() { return vendedorId; }
    public void setVendedorId(Long vendedorId) { this.vendedorId = vendedorId; }

    public String getObservacionesVendedor() { return observacionesVendedor; }
    public void setObservacionesVendedor(String observacionesVendedor) { this.observacionesVendedor = observacionesVendedor; }
}