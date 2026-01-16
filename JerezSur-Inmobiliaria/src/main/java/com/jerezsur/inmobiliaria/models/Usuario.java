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
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


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

    @Column(unique = true)
    private String email; // Será el username para el login

    private String password;
    private String imagenPerfilUrl;
    
    // Para OAuth2
    @Enumerated(EnumType.STRING)
    private AuthProvider provider; // "LOCAL", "GOOGLE", "FACEBOOK"

    private String providerId;

    @Enumerated(EnumType.STRING)
    @NotNull
    private Role role; // ROLE_TRABAJADOR, ROLE_COMPRADOR, ROLE_ADMIN

    // RELACIONES Opcionales (1:1)
    @OneToOne(mappedBy = "usuario")
    private Trabajador trabajador;

    @OneToOne(mappedBy = "usuario")
    private Comprador comprador;

    @OneToOne(mappedBy = "usuario")
    private Vendedor vendedor;

        // --- AUDITORÍA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;
}