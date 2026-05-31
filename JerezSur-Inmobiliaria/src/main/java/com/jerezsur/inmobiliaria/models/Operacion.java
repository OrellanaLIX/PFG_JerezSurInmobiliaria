package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.jerezsur.inmobiliaria.models.enums.EstadoOperacion;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "operaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "categoria_operacion")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "categoria_operacion")
@JsonSubTypes({
    @JsonSubTypes.Type(value = OperacionAlquiler.class, name = "ALQUILER"),
    @JsonSubTypes.Type(value = OperacionVenta.class, name = "VENTA")
})
public abstract class Operacion {

  // --- IDENTIFICADOR ---
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // --- DATOS ECONÓMICOS Y ESTADO ---
  private BigDecimal precioAcordado;

  @Enumerated(EnumType.STRING)
  private TipoOperacion tipo; // VENTA, ALQUILER, CUALQUIERA

  @Enumerated(EnumType.STRING)
  private EstadoOperacion estadoActual = EstadoOperacion.ABIERTA; // ABIERTA, EN_TRAMITE, CERRADA, CANCELADA

  // --- RELACIONES PRINCIPALES ---

  // El inmueble objeto de la transacción
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inmueble_id")
  private Inmueble inmueble;

  // --- DOCUMENTACIÓN Y SEGUIMIENTO ---

  // Listado de contratos y anexos generados durante la operación
  @OneToMany(mappedBy = "operacion", cascade = CascadeType.ALL)
  private List<Contrato> documentos;

  // Relación con todos los interesados/compradores que intervienen
  @OneToMany(mappedBy = "operacion", cascade = CascadeType.ALL)
  private List<Operacion_Interesado> compradores;

  // --- AUDITORÍA ---
  @CreationTimestamp
  @Column(updatable = false)
  private LocalDateTime fechaRegistro;

  @UpdateTimestamp
  private LocalDateTime fechaUltimaActualizacion;
}