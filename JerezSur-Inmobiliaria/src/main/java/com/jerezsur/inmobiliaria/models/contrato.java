package com.jerezsur.inmobiliaria.models;

import com.jerezsur.inmobiliaria.models.enums.TipoContrato;
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

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- ATRIBUTOS ---
    @NotNull
    private LocalDate fechaFirma;

    @NotNull
    @Positive
    private BigDecimal precioFinal;

    @Enumerated(EnumType.STRING)
    private TipoContrato tipo; // VENTA, ALQUILER.

    @Column(columnDefinition = "TEXT")
    private String clausulasEspeciales;

    // --- PDF CONTRATO FIRMADO ---
    private String urlDocumentoPdf; // Para guardar la ruta del contrato firmado (PDF)

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

    // Relación con los vendedores que firman (pueden ser varios)
    @OneToMany(mappedBy = "contrato", cascade = CascadeType.ALL)
    private List<Contrato_Vendedor> vendedoresFirmantes;

    // --- AUDITORÍA DE SISTEMA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistroSistema;
}