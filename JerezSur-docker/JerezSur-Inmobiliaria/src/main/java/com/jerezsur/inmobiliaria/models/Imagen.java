package com.jerezsur.inmobiliaria.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.Builder.Default;

/**
 * Entidad que representa una imagen de un inmueble.
 *
 * Las imágenes NO se guardan en la base de datos (eso sería muy ineficiente).
 * En su lugar guardamos la URL que nos da Cloudinary después de subir el archivo.
 * Cloudinary almacena la imagen y nos da un enlace permanente con HTTPS.
 *
 * Relación con Inmueble: un inmueble tiene muchas imágenes (OneToMany),
 * y cada imagen pertenece a un solo inmueble (ManyToOne en este lado).
 *
 * La imagen de portada (esPortada=true) es la que aparece en las tarjetas
 * del listado de inmuebles. Solo debería haber una portada por inmueble.
 *
 * @JsonIgnore en la relación al inmueble evita el error de serialización circular:
 * sin él, Jackson intentaría serializar Imagen → Inmueble → [lista de Imagen] → bucle infinito.
 */
@Entity
@Table(name = "imagenes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Imagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // URL completa de Cloudinary (siempre HTTPS gracias a la config de Cloudinary)
    @NotBlank(message = "La URL de la imagen no puede estar vacía")
    @Column(nullable = false)
    private String url;

    // Nombre original del archivo que subió el trabajador (para referencia)
    private String nombreArchivo;

    // true si es la foto principal que aparece en las tarjetas del listado
    @Default
    private Boolean esPortada = false;

    // Relación con el inmueble al que pertenece esta imagen
    // FetchType.LAZY: no carga el inmueble de BD hasta que se acceda a él (más eficiente)
    // @JsonIgnore: evita la serialización circular Imagen → Inmueble → Imagen → ...
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inmueble_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Inmueble inmueble;

    // Campos de auditoría: cuándo se subió y cuándo se actualizó por última vez
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @UpdateTimestamp
    private LocalDateTime fechaUltimaActualizacion;
}
