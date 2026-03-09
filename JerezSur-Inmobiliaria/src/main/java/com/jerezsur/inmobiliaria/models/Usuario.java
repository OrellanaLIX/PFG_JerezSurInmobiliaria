package com.jerezsur.inmobiliaria.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.jerezsur.inmobiliaria.models.enums.AuthProvider;
import com.jerezsur.inmobiliaria.models.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- CREDENCIALES Y PERFIL BÁSICO ---
    @Email(message = "El formato del email no es válido")
    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String telefono;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    private String imagenPerfilUrl;

    // --- SEGURIDAD Y ROLES ---
    @Enumerated(EnumType.STRING)
    @NotNull
    @Default
    private Role role = Role.ROLE_INTERESADO; // Determina los permisos en el sistema

    @Default
    private Boolean cambiarPasswd = true; // Forzar cambio de clave en el primer login o tras reset

    // --- AUTENTICACIÓN EXTERNA (OAuth2) ---
    @Enumerated(EnumType.STRING)
    private AuthProvider provider; // LOCAL, GOOGLE, FACEBOOK

    private String providerId; // ID único proporcionado por el proveedor externo

    // --- RELACIONES DE PERFIL (1:1) ---

    // Perfil vinculado si el usuario es un empleado de la inmobiliaria
    @OneToOne(mappedBy = "usuario")
    private Trabajador trabajador;

    // Perfil vinculado si el usuario es un cliente buscando inmuebles
    @OneToOne(mappedBy = "usuario")
    private Interesado interesado;

    // Perfil vinculado si el usuario es un propietario vendiendo/alquilando
    @OneToOne(mappedBy = "usuario")
    private Vendedor vendedor;

    // --- AUDITORÍA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;
}