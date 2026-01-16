package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.jerezsur.inmobiliaria.models.enums.EstadoComprador;
import com.jerezsur.inmobiliaria.models.enums.Operacion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;  

@Entity
@Table(name = "compradores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comprador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS BÁSICOS ---
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;

    @NotBlank(message = "El teléfono es vital para la captación")
    private String telefono;

    @Email
    @Column(unique = true)
    private String email;

    // --- ESTADO ---
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EstadoComprador estado = EstadoComprador.INTERESADO;

    // --- DATOS LEGALES ---
    @Column(unique = true)
    private String dni;

    private String direccionPostal;

    @NotBlank
    @Size(min = 8)
    private String password; 

    // --- LÓGICA DE FINANCIACIÓN (HIPOTECA) ---
    @Builder.Default
    private Boolean requiereHipoteca = false;

    private String detallesHipoteca; 

    // --- INTERESES DE BÚSQUEDA ---
    private BigDecimal presupuestoMaximo;
    private String zonaInteres;
    private Integer habitacionesMinimas;

    @Enumerated(EnumType.STRING)
    private Operacion tipoBusqueda;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // --- RELACIONES ---
    @OneToMany(mappedBy = "comprador")
    private List<Cita> citas;

    @OneToMany(mappedBy = "comprador")
    private List<Contrato_Comprador> contratosFirmados;

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