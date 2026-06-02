package com.jerezsur.inmobiliaria.dto;

import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

// DTO para crear un nuevo inmueble desde el formulario del panel de administración.
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
}