package com.jerezsur.inmobiliaria.models;

import com.jerezsur.inmobiliaria.models.enums.Operacion;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contratos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private LocalDate fechaFirma;

    @NotNull
    @Positive
    private BigDecimal precioFinal;

    @Enumerated(EnumType.STRING)
    private Operacion tipo; // VENTA, ALQUILER, etc.

    // Para guardar la ruta del contrato firmado (PDF)
    private String urlDocumentoPdf;

    @Column(columnDefinition = "TEXT")
    private String clausulasEspeciales;

    // --- RELACIONES ---

    // El contrato siempre está ligado a un inmueble
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inmueble_id", nullable = false)
    private Inmueble inmueble;

    // El trabajador que gestionó la firma
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trabajador_id", nullable = false)
    private Trabajador trabajador;

    // Relación con los compradores que firman (pueden ser varios)
    @OneToMany(mappedBy = "contrato", cascade = CascadeType.ALL)
    private List<Contrato_Comprador> compradoresFirmantes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistroSistema;
}