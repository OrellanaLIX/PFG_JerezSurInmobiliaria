package com.jerezsur.inmobiliaria.models;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vendedores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vendedor {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS PERSONALES ---
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;

    // --- DATOS DE CONTACTO ---
    @Email
    @Column(unique = true)
    private String email;

    private String telefono;

    private String direccion;

    // --- DATOS SENSIBLES ---
    @NotBlank
    @Column(unique = true)
    private String dni;

    @NotBlank
    @Size(min = 8)
    private String password; 

    // --- OTROS DATOS ---
    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // --- RELACIONES ---

    // Relación con la tabla intermedia que gestiona la propiedad de los inmuebles
    @OneToMany(mappedBy = "vendedor")
    private List<Inmueble_Vendedor> propiedades;

    @OneToMany(mappedBy = "vendedor")
    private List<Contrato_Vendedor> contratosFirmados;

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