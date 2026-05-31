package com.jerezsur.inmobiliaria.models;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.jerezsur.inmobiliaria.models.enums.AuthProvider;
import com.jerezsur.inmobiliaria.models.enums.OrigenUsuario;
import com.jerezsur.inmobiliaria.models.enums.Role;

import jakarta.persistence.CascadeType;
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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    @Column(unique = true, nullable = true)
    private String email;

    @Column(unique = true, nullable = true) // Ahora opcional para permitir OAuth
    private String telefono;

    @NotBlank
    private String nombre;

    private String apellidos;

    @Column(nullable = true)
    private String password;

    @Column(unique = true, nullable = true)
    private String dni;

    private String imagenPerfilUrl;

    @Default
    private Boolean verified = false;

    private String comentarios;

    // --- ESTADO DE LA CUENTA ---
    @Default
    @Column(nullable = false)
    private Boolean cuentaActivada = false;

    @Enumerated(EnumType.STRING)
    @Default
    private OrigenUsuario origen = OrigenUsuario.AUTOREGISTRO;
    // AUTOREGISTRO, OAUTH, CRM_TRABAJADOR, WEB_CITA, WEB_VENTA

    // --- SEGURIDAD Y ROLES ---
    @Enumerated(EnumType.STRING)
    @Default
    private Role role = Role.ROLE_NOROL;

    @Default
    private Boolean cambiarPasswd = true;

    private AuthProvider provider;
    private String providerId;

    // --- RELACIONES DE PERFIL ---
    @OneToOne(mappedBy = "usuario", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnore
    private Trabajador trabajador;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private Interesado interesado;

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private Vendedor vendedor;

    @OneToMany(mappedBy = "usuario")
    @ToString.Exclude
    @JsonIgnore
    private List<Cita> citas;

    private LocalDateTime fechaEliminacion;

    @CreationTimestamp
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;
}