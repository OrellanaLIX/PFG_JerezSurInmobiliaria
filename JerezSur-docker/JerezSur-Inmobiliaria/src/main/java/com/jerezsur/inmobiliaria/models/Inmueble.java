package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.Builder.Default;

// Entidad principal de la aplicación: representa un inmueble del catálogo.
// Almacena todos los datos del piso/casa: precio, superficie, características y sus imágenes y documentos.
@Entity
@Table(name = "inmuebles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Inmueble {

    // --- IDENTIFICADORES ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El código de referencia (ej. P-101) es obligatorio")
    @Column(unique = true)
    private String referencia;

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
    private TipoOperacion operacion;

    @Enumerated(EnumType.STRING)
    private EstadoInmueble estado;

    @Enumerated(EnumType.STRING)
    private TipoInmueble tipo;

    // --- CARACTERÍSTICAS DINÁMICAS ---
    @JsonIgnore
    @OneToMany(mappedBy = "inmueble", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Fetch(FetchMode.SELECT)
    @Default
    @ToString.Exclude
    private List<InmuebleExtra> extras = new ArrayList<>();

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

    //@NotBlank
    //private String zona;

    private String zona;

    @NotBlank
    private String codigoPostal;

    @NotBlank
    private String ciudad;

    @Default
    private Boolean destacado = false;

    // --- GASTOS Y CARGAS ---
    @DecimalMin("0.0")
    private BigDecimal comunidad;

    @Default
    private Boolean tieneDerrama = false;

    @DecimalMin("0.0")
    private BigDecimal valorDerrama;

    @DecimalMin("0.0")
    private BigDecimal ibi;

    // --- DOCUMENTACIÓN Y DATOS PRIVADOS ---
    @Column(unique = true)
    private String refCatastral;

    private String urlNotaSimple;
    private String urlCertificadoEnergetico;
    private String urlPlanoInmueble;

    @Column(columnDefinition = "TEXT")
    private String notasPrivadas;

    // --- RELACIONES ---

    @OneToMany(mappedBy = "inmueble", cascade = CascadeType.ALL, orphanRemoval = true)
    @Default
    @ToString.Exclude
    @JsonIgnore
    private List<Imagen> imagenes = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "inmueble", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Fetch(FetchMode.SELECT)
    @Default
    @ToString.Exclude
    private List<InmueblePropietario> propietarios = new ArrayList<>();

    @JsonProperty("propietariosPorcentaje")
    public Map<Long, Double> getPropietariosPorcentajeIds() {
        if (propietarios == null) return new HashMap<>();
        return propietarios.stream()
                .collect(Collectors.toMap(
                        p -> p.getVendedor().getId(),
                        InmueblePropietario::getPorcentaje));
    }

    @JsonIgnore
    public Map<Vendedor, Double> getPropietariosPorcentaje() {
        if (propietarios == null) return new HashMap<>();
        return propietarios.stream()
                .collect(Collectors.toMap(
                        InmueblePropietario::getVendedor,
                        InmueblePropietario::getPorcentaje));
    }

    @JsonProperty("caracteristicasExtra")
    public Map<String, String> getCaracteristicasExtra() {
        if (extras == null) return new HashMap<>();
        return extras.stream()
                .collect(Collectors.toMap(InmuebleExtra::getClave, InmuebleExtra::getValor));
    }

    public void setCaracteristicasExtra(Map<String, String> map) {
        if (this.extras == null) this.extras = new ArrayList<>();
        this.extras.clear();
        if (map == null) return;
        map.forEach((clave, valor) -> {
            InmuebleExtra e = new InmuebleExtra();
            e.setId(new InmuebleExtraId(this.id, clave));
            e.setInmueble(this);
            e.setValor(valor);
            this.extras.add(e);
        });
    }

    @OneToMany(mappedBy = "inmueble")
    @Default
    @ToString.Exclude
    @JsonIgnore
    private List<Operacion> operaciones = new ArrayList<>();

    @OneToMany(mappedBy = "inmueble")
    @Default
    @ToString.Exclude
    @JsonIgnore
    private List<Cita> citas = new ArrayList<>();

    // --- AUDITORÍA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;
}