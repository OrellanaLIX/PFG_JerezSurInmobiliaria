package com.jerezsur.inmobiliaria.models;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.jerezsur.inmobiliaria.models.enums.AuthProvider;
import com.jerezsur.inmobiliaria.models.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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

    private String apellidos;

    // DATOS SENSIBLES
    @Column(nullable = true)
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    @Column(unique = true)
    private String dni;

    private String imagenPerfilUrl;

    @Default
    private Boolean verified = false; // Para verificar si el email ha sido confirmado

    private String comentarios;

    // --- SEGURIDAD Y ROLES ---
    @NotNull(message = "El rol no debe ser nulo")
    @Enumerated(EnumType.STRING) // <--- ESTO ES VITAL
    @Column(name = "role", nullable = false)
    @Default
    private Role role = Role.ROLE_NOROL; // Determina los permisos en el sistema

    @Default
    private Boolean cambiarPasswd = true; // Forzar cambio de clave en el primer login o tras reset

    // --- AUTENTICACIÓN EXTERNA (OAuth2) ---
    private AuthProvider provider; // LOCAL, GOOGLE, FACEBOOK, APPLE

    private String providerId; // ID único proporcionado por el proveedor externo

    // --- RELACIONES DE PERFIL (1:1) ---

    // Perfil vinculado si el usuario es un empleado de la inmobiliaria
    @JsonManagedReference
    @OneToOne(mappedBy = "usuario")
    private Trabajador trabajador;

    // Perfil vinculado si el usuario es un cliente buscando inmuebles
    @JsonManagedReference
    @OneToOne(mappedBy = "usuario")
    private Interesado interesado;

    // Perfil vinculado si el usuario es un propietario vendiendo/alquilando
    @JsonManagedReference
    @OneToOne(mappedBy = "usuario")
    private Vendedor vendedor;

    // --- RELACIONES DE CITAS ---
    @OneToMany(mappedBy = "usuario")
    private List<Cita> citas;

    // --- AUDITORÍA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;
}