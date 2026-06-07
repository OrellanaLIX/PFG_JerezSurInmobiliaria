package com.jerezsur.inmobiliaria.dto;

import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO de entrada para crear un nuevo inmueble desde el panel de administración.
 *
 * Lleva validaciones Bean Validation (@NotBlank, @Positive...) para que el backend
 * rechace datos incorrectos antes de llegar al servicio. Esto evita guardar inmuebles
 * sin título, con precio negativo o sin propietario asignado.
 *
 * El mapa propietariosPorcentaje asocia el ID del vendedor a su porcentaje de participación
 * (deben sumar 100). Usamos Long como clave porque React envía el ID como número,
 * y el servicio lo convierte a la entidad Vendedor antes de guardar.
 */
@Data
public class InmuebleCrearDTO {

    @NotBlank(message = "El título es obligatorio")
    @Size(min = 10, max = 150)
    private String titulo;

    private String descripcion;

    @NotNull
    @Positive
    private BigDecimal precio;

    private TipoOperacion operacion; 
    private EstadoInmueble estado; 
    private TipoInmueble tipo; 

    @Positive
    private Double superficieUtil;
    @Positive
    private Double mConstruidos;
    @Min(1)
    private Integer habitaciones;
    @Min(1)
    private Integer banos;

    @NotBlank
    private String direccion;
    private String zona;
    @NotBlank
    private String codigoPostal;
    @NotBlank
    private String ciudad;

    private Boolean destacado;

    // Gastos y cargas
    private BigDecimal comunidad;
    private Boolean tieneDerrama;
    private BigDecimal valorDerrama;
    private String refCatastral;

    // Documentación
    private String urlNotaSimple;
    private String urlCertificadoEnergetico;
    private String urlPlanoInmueble;
    private String notasPrivadas;

    // Imágenes desde Cloudinary
    private List<String> imagenesUrls;

    // 🌟 EN EL DTO LA LLAVE ES SIMPLEMENTE UN LONG (El ID del vendedor que manda React)
    @NotEmpty(message = "Debe asignar al menos un propietario")
    private Map<Long, Double> propietariosPorcentaje;

    // Características adicionales clave-valor (ej: "Ascensor" → "Sí", "Piscina" → "Comunitaria")
    private Map<String, String> caracteristicasExtra;
}