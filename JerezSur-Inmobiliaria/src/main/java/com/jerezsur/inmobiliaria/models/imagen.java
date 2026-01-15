package com.jerezsur.inmobiliaria.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "imagenes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Imagen {

    //--- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //--- DATOS DE LA IMAGEN ---
    @NotBlank(message = "La URL de la imagen no puede estar vacía")
    @Column(nullable = false)
    private String url; // URL completa de la imagen para mostrarla

    private String nombreArchivo; // Nombre del archivo en el servidor

    @Builder.Default
    private Boolean esPortada = false; // Es esta imagen la portada del inmueble

    //--- RELACIONES ---

    // Relación N:1 con Inmueble
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inmueble_id", nullable = false)
    private Inmueble inmueble;
}