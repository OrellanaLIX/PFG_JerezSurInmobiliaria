package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder.Default;

@Entity
@Table(name = "compradores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    // --- RELACIONES ---
    @OneToMany(mappedBy = "comprador")
    private List<Cita> citas;

    @OneToMany(mappedBy = "comprador")
    private List<Operacion_Interesado> operaciones;

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