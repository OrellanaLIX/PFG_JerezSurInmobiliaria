package com.jerezsur.inmobiliaria.models;

import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.Operacion;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inmuebles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inmueble {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS PRINCIPALES ---
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 10, max = 150)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal precio;

    // --- CARACTERÍSTICAS ---
    @Positive
    private Double superficie;

    @Min(1)
    private Integer habitaciones;
    private Integer banos;

    // --- UBICACIÓN ---
    @NotBlank
    private String direccion;
    private String codigoPostal;

    // --- OTROS DATOS ---
    @Column(columnDefinition = "TEXT")
    private String notasPrivadas; // Para que el trabajador anote cosas que no verá el cliente

    @Enumerated(EnumType.STRING)
    private Operacion operacion; // VENTA, ALQUILER, CUALQUIERA

    @Enumerated(EnumType.STRING)
    private EstadoInmueble estado; // DISPONIBLE, VENDIDO, RESERVADO

    // --- RELACIONES ---

    // 1:1 con los datos legales (Particionado Vertical)
    @OneToOne(mappedBy = "inmueble", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PropiedadAdicional datosLegales;

    // 1:N con las fotos
    @OneToMany(mappedBy = "inmueble", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Imagen> imagenes = new ArrayList<>();

    // N:1 con la tabla intermedia de dueños (Vendedores)
    @OneToMany(mappedBy = "inmueble")
    private List<Inmueble_Vendedor> propietarios;

    // 1:N con los contratos que ha tenido este inmueble
    @OneToMany(mappedBy = "inmueble")
    private List<Contrato> contratos;

    // --- AUDITORÍA DE SISTEMA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaPublicacion;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaModificacion;
}