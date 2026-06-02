package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.jerezsur.inmobiliaria.models.enums.EstadoComprador;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Builder.Default;

// Entidad de interesado/comprador: perfil adicional de un usuario que busca comprar o alquilar.
// Guarda sus preferencias de búsqueda (presupuesto, zona, habitaciones) para el equipo comercial.
@Entity
@Table(name = "compradores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Interesado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- ESTADO ---
    @Enumerated(EnumType.STRING)
    @Default
    private EstadoComprador estado = EstadoComprador.INTERESADO;

    // --- LÓGICA DE FINANCIACIÓN (HIPOTECA) ---
    @Default
    private Boolean requiereHipoteca = false;

    private String detallesHipoteca;

    // --- INTERESES DE BÚSQUEDA ---
    private BigDecimal presupuestoMaximo;
    private String zonaInteres;
    private Integer habitacionesMinimas;
    private Integer banosMinimos;
    private String tipoInmueblePreferido;

    @Enumerated(EnumType.STRING)
    private TipoOperacion tipoBusqueda;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @OneToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "interesado", "vendedor", "trabajador", "citas"})
    private Usuario usuario;

    // --- AUDITORÍA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;
}