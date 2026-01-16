package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.Operacion;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inmuebles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inmueble {

    // --- IDENTIFICADORES ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El código de referencia (ej. P-101) es obligatorio")
    @Column(unique = true)
    private String referencia; // Sustituye al idLogico. Ej: "CH-001"

    // --- DATOS COMERCIALES (Públicos) ---
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 10, max = 150)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal precio;

    @Enumerated(EnumType.STRING)
    private Operacion operacion; // VENTA, ALQUILER, AMBOS

    @Enumerated(EnumType.STRING)
    private EstadoInmueble estado; // DISPONIBLE, VENDIDO, RESERVADO

    // --- CARACTERÍSTICAS DINÁMICAS ---
    // Esto crea una tabla hija que se borra si se borra el inmueble
    @ElementCollection
    @CollectionTable(name = "inmueble_extras", 
                    joinColumns = @JoinColumn(name = "inmueble_id"))
    @MapKeyColumn(name = "clave") // "Muebles", "Orientación", etc.
    @Column(name = "valor")      // "Sí", "Norte", etc.
    @Builder.Default
    private Map<String, String> caracteristicasExtra = new HashMap<>();

    // --- CARACTERÍSTICAS TÉCNICAS ---
    @Positive
    private Double superficieUtil;

    @Positive
    private Double mConstruidos;

    @Min(1)
    private Integer habitaciones;

    @Min(1)
    private Integer banos;

    @NotBlank
    private String direccion;

    @NotBlank
    private String codigoPostal;

    @NotBlank
    private String ciudad;

    // --- GASTOS Y CARGAS (Datos para Contrato de Arras) ---
    @DecimalMin("0.0")
    private BigDecimal comunidad;

    @Builder.Default
    private Boolean tieneDerrama = false;

    @DecimalMin("0.0")
    private BigDecimal valorDerrama;

    @DecimalMin("0.0")
    private BigDecimal ibi; // Impuesto Anual

    // --- DOCUMENTACIÓN Y DATOS PRIVADOS (Solo trabajadores) ---
    @Column(unique = true)
    private String refCatastral; // ID oficial del inmueble

    private String urlNotaSimple; // Link al PDF
    private String urlCertificadoEnergetico; // Link al PDF
    private String urlPlanoInmueble; // Link al PDF/Imagen

    @Column(columnDefinition = "TEXT")
    private String notasPrivadas; // Info sensible (ej: "Dueño solo tardes")

    // --- RELACIONES ---

    @OneToMany(mappedBy = "inmueble", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Imagen> imagenes = new ArrayList<>();

    @OneToMany(mappedBy = "inmueble")
    private List<Inmueble_Vendedor> propietarios;

    @OneToMany(mappedBy = "inmueble")
    private List<Contrato> contratos;

    // --- AUDITORÍA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;
}