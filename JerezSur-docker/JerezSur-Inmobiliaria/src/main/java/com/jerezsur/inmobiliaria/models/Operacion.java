package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.jerezsur.inmobiliaria.models.enums.EstadoOperacion;
import com.jerezsur.inmobiliaria.models.enums.RolParticipante;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapKeyJoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// Clase abstracta base para las operaciones inmobiliarias.
// Usa herencia SINGLE_TABLE: OperacionVenta y OperacionAlquiler se guardan en la misma tabla.
@Entity
@Table(name = "operaciones")
@Getter
@Setter
@NoArgsConstructor
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "categoria_operacion")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "categoria_operacion")
@JsonSubTypes({
        @JsonSubTypes.Type(value = OperacionAlquiler.class, name = "ALQUILER"),
        @JsonSubTypes.Type(value = OperacionVenta.class, name = "VENTA")
})
public abstract class Operacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TipoOperacion tipo;

    @Enumerated(EnumType.STRING)
    private EstadoOperacion estadoActual = EstadoOperacion.ABIERTA;

    private BigDecimal precioAcordado;

    // Solo exponemos id, referencia y dirección del inmueble; sus colecciones internas no se necesitan aquí
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inmueble_id")
    @JsonIgnoreProperties({
        "hibernateLazyInitializer", "handler",
        "propietariosPorcentaje", "caracteristicasExtra",
        "imagenes", "operaciones", "citas"
    })
    private Inmueble inmueble;

    // Trabajador responsable de la operación (opcional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Trabajador trabajador;

    @OneToMany(mappedBy = "operacion", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"operacion"})
    private List<Contrato> documentos;

    // AccessLevel.NONE: Lombok NO genera getCompradoresRol().
    // @JsonIgnore en campo + getter manual con @JsonIgnore cierran todas las vías por las que
    // Jackson podría intentar serializar Map<Interesado,RolParticipante> (que causaba StackOverflow).
    @JsonIgnore
    @Getter(AccessLevel.NONE)
    @ToString.Exclude
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "operacion_interesado_rol", joinColumns = @JoinColumn(name = "operacion_id"))
    @MapKeyJoinColumn(name = "interesado_id")
    @Column(name = "rol")
    private Map<Interesado, RolParticipante> compradoresRol = new HashMap<>();

    // Jackson usa este método (retorna Map<Long,Rol>, sin entidades complejas como clave)
    @JsonProperty("compradoresRol")
    public Map<Long, RolParticipante> getCompradoresRolIds() {
        if (compradoresRol == null) return new HashMap<>();
        return compradoresRol.entrySet().stream()
                .collect(Collectors.toMap(e -> e.getKey().getId(), Map.Entry::getValue));
    }

    // Getter interno para el servicio (no expuesto a Jackson)
    @JsonIgnore
    public Map<Interesado, RolParticipante> getCompradoresRol() {
        return compradoresRol;
    }

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Operacion)) return false;
        Operacion that = (Operacion) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
