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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Builder.Default;

// Entidad de contrato: documento legal asociado a una operación de compraventa o alquiler.
// El PDF del contrato se sube cifrado a Cloudinary y se accede a través de un endpoint protegido.
@Entity
@Table(name = "contratos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Contrato {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS DEL CONTRATO ---
    @NotNull(message = "La fecha de firma es obligatoria")
    private LocalDate fechaFirma;

    @Enumerated(EnumType.STRING)
    @Default
    private EstadoContrato estado = EstadoContrato.BORRADOR; // BORRADOR, PENDIENTE_FIRMA, FIRMADO, CANCELADO

    @Enumerated(EnumType.STRING)
    private ModeloContrato modelo; // ARRAS, COMPRAVENTA, ALQUILER, ETC.

    @Column(columnDefinition = "TEXT")
    private String clausulasEspeciales; // Notas o condiciones particulares del contrato

    private String urlDocumentoPdf; // Ruta o enlace al archivo del contrato digitalizado

    // --- RELACIONES ---

    // El contrato se vincula a una operación inmobiliaria específica
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operacion_id", nullable = false)
    private Operacion operacion;

    // Trabajador responsable de gestionar o supervisar la firma (opcional al crear el borrador)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = true)
    private Trabajador trabajador;

    // --- AUDITORÍA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;
}