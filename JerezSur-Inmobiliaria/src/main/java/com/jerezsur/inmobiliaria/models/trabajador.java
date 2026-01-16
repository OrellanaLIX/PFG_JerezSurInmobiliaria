package com.jerezsur.inmobiliaria.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "trabajadores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Trabajador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS PERSONALES ---
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;

    @NotBlank(message = "El DNI es obligatorio")
    @Column(unique = true)
    private String dni;

    // --- CONTACTO Y ACCESO ---
    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    private String telefono;

    @NotBlank
    @Size(min = 8)
    private String password; 

    private String cargo; // Ej: "Agente Comercial", "Administrativo"

    // --- GESTIÓN LABORAL ---
    
    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicioContrato; // Fecha del contrato actual | Sobrescribir si vuelve a la empresa

    private LocalDate fechaFinContrato; // Solo se rellena si el contrato es temporal o deja la empresa

    @Builder.Default
    private Boolean activo = true; // Define si está trabajando actualmente

    @Column(columnDefinition = "TEXT")
    private String observacionesLaborales; // Aquí puedes anotar: "Pasó de temporal a fijo el 15/01/2026"

    // --- RELACIONES ---

    @OneToMany(mappedBy = "trabajador")
    private List<Cita> citas;

    @OneToMany(mappedBy = "trabajador")
    private List<Contrato> contratos;

    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // --- AUDITORÍA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;
    }