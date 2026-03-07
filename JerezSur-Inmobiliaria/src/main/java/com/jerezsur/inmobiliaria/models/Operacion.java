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
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Inmueble inmueble;

    @ManyToOne(fetch = FetchType.LAZY)
    private Vendedor representanteVendedor;

    @ManyToOne(fetch = FetchType.LAZY)
    private Interesado representanteComprador;

    private BigDecimal precioAcordado;

    @Enumerated(EnumType.STRING)
    private TipoOperacion tipo;

    @Enumerated(EnumType.STRING)
    private EstadoOperacion estadoActual = EstadoOperacion.ABIERTA;

    // Relación con los documentos generados
    @OneToMany(mappedBy = "operacion", cascade = CascadeType.ALL)
    private List<Contrato> documentos;

    // Relación con todos los intervinientes (Tablas intermedias)
    @OneToMany(mappedBy = "operacion", cascade = CascadeType.ALL)
    private List<Operacion_Vendedor> vendedores;

    @OneToMany(mappedBy = "operacion", cascade = CascadeType.ALL)
    private List<Operacion_Interesado> compradores;
}