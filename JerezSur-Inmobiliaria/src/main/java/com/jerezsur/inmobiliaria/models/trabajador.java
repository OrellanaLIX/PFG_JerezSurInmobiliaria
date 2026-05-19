package com.jerezsur.inmobiliaria.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "trabajadores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Trabajador {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El DNI es obligatorio")
    @Column(unique = true)
    private String dni;

    // --- CONTACTO Y ACCESO ---
    private String cargo; // Ej: "Agente Comercial", "Administrativo"

    // --- GESTIÓN LABORAL ---
    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicioContrato;

    private LocalDate fechaFinContrato; // Se completa en contratos temporales o bajas

    @Default
    private Boolean activo = true; // Indica si el trabajador está en plantilla actualmente

    @Column(columnDefinition = "TEXT")
    private String observacionesLaborales; // Historial de cambios de contrato o notas internas

    // --- RELACIONES ---

    // Histórico de citas y visitas gestionadas por el trabajador
    @OneToMany(mappedBy = "trabajador")
    private List<Cita> citas;

    // Contratos en los que el trabajador ha actuado como representante/testigo
    @OneToMany(mappedBy = "trabajador")
    private List<Contrato> contratos;

    // Vinculación con las credenciales de seguridad del sistema
    @JsonBackReference
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