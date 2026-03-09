package com.jerezsur.inmobiliaria.models;

import java.math.BigDecimal;
import java.util.List;

import com.jerezsur.inmobiliaria.models.enums.EstadoOperacion;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;

import jakarta.persistence.CascadeType;
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
public abstract class Operacion {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS ECONÓMICOS Y ESTADO ---
    private BigDecimal precioAcordado;

    @Enumerated(EnumType.STRING)
    private TipoOperacion tipo; // VENTA, ALQUILER, TRASPASO

    @Enumerated(EnumType.STRING)
    private EstadoOperacion estadoActual = EstadoOperacion.ABIERTA; // ABIERTA, EN_TRAMITE, CERRADA, CANCELADA

    // --- RELACIONES PRINCIPALES ---

    // El inmueble objeto de la transacción
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inmueble_id")
    private Inmueble inmueble;

    // Representante principal de la parte vendedora/arrendadora
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id")
    private Vendedor representanteVendedor;

    // Representante principal de la parte compradora/arrendataria
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interesado_id")
    private Interesado representanteComprador;

    // --- DOCUMENTACIÓN Y SEGUIMIENTO ---

    // Listado de contratos y anexos generados durante la operación
    @OneToMany(mappedBy = "operacion", cascade = CascadeType.ALL)
    private List<Contrato> documentos;

    // --- PARTICIPANTES (MULTI-PROPIEDAD / CO-COMPRADORES) ---

    // Relación con todos los vendedores que intervienen en la firma
    @OneToMany(mappedBy = "operacion", cascade = CascadeType.ALL)
    private List<Operacion_Vendedor> vendedores;

    // Relación con todos los interesados/compradores que intervienen
    @OneToMany(mappedBy = "operacion", cascade = CascadeType.ALL)
    private List<Operacion_Interesado> compradores;
}