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
 * DTO para actualizar un inmueble existente desde el panel de administración.
 *
 * Todos los campos son opcionales (sin @NotNull/@NotBlank) para permitir
 * actualizaciones parciales: el servicio solo sobrescribe los campos no nulos.
 * Esto evita que el trabajador tenga que rellenar todo el formulario si solo
 * quiere cambiar el precio o el estado del inmueble.
 */
@Data
public class InmuebleActualizarDTO {

    // Campos básicos - opcionales para actualización parcial
    private String titulo;
    private String descripcion;
    private BigDecimal precio;
    private TipoOperacion operacion;
    private EstadoInmueble estado;
    private TipoInmueble tipo;

    // Características técnicas
    private Double superficieUtil;
    private Double mConstruidos;
    private Integer habitaciones;
    private Integer banos;

    // Ubicación
    private String direccion;
    private String zona;
    private String codigoPostal;
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

    // Imágenes desde Cloudinary (nuevas imágenes a agregar)
    private List<String> imagenesUrls;

    // Propietarios
    private Map<Long, Double> propietariosPorcentaje;

    // Características adicionales clave-valor
    private Map<String, String> caracteristicasExtra;
}
