package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

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

    // --- OTROS DATOS ---
    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // --- RELACIONES ---

    // Relación con la tabla intermedia que gestiona la propiedad de los inmuebles
    @OneToMany(mappedBy = "vendedor")
    private List<Inmueble_Vendedor> propiedades;

    // --- AUDITORÍA DE SISTEMA ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;
}