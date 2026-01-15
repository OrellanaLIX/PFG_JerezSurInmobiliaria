package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.jerezsur.inmobiliaria.models.enums.Operacion;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "compradores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comprador {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS PERSONALES ---
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;

    @NotBlank
    @Column(unique = true)
    private String dni;

    // --- DATOS DE CONTACTO ---
    @Email
    @Column(unique = true)
    private String email;

    private String telefono;

    // --- INTERESES ---
    
    private BigDecimal presupuestoMaximo;

    private String zonaInteres; // Ej: "Jerez Centro", "Zona Norte"

    private Integer habitacionesMinimas;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Enumerated(EnumType.STRING)
    private Operacion operacion; // VENTA, ALQUILER, CUALQUIERA

    // --- RELACIONES ---

    // Un comprador puede solicitar y asistir a muchas citas
    @OneToMany(mappedBy = "comprador")
    private List<Cita> citas;

    // Relación con los contratos a través de la tabla intermedia
    @OneToMany(mappedBy = "comprador")
    private List<Contrato_Comprador> contratosFirmados;

    // --- AUDITORÍA DE SISTEMA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;
}