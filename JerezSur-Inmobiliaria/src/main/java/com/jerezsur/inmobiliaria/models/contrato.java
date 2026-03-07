package com.jerezsur.inmobiliaria.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import com.jerezsur.inmobiliaria.models.enums.EstadoContrato;
import com.jerezsur.inmobiliaria.models.enums.ModeloContrato;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "contratos")
@Data
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // VINCULACIÓN CON LA OPERACIÓN
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operacion_id", nullable = false)
    private Operacion operacion;

    @NotNull
    private LocalDate fechaFirma;

    @Enumerated(EnumType.STRING)
    private EstadoContrato estado = EstadoContrato.BORRADOR;

    @Enumerated(EnumType.STRING)
    private ModeloContrato modelo;

    @Column(columnDefinition = "TEXT")
    private String clausulasEspeciales;

    private String urlDocumentoPdf;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;

    @CreationTimestamp
    private LocalDateTime fechaRegistro;
}