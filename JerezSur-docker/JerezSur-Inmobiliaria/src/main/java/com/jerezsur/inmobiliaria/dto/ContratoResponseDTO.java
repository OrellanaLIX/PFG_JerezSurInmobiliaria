package com.jerezsur.inmobiliaria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * DTO de respuesta para los contratos vinculados a una operación inmobiliaria.
 *
 * Expone solo lo necesario para el panel de administración: tipo de contrato (modelo),
 * estado de firma y la URL del PDF en Cloudinary. No incluimos las cláusulas completas
 * en el listado para no sobrecargar la respuesta; esas se cargan al abrir el detalle.
 * El trabajadorId nos permite saber qué agente firma el contrato sin cargar la entidad completa.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContratoResponseDTO {
    private Long id;
    private String modelo;
    private String estado;
    private LocalDate fechaFirma;
    private String clausulasEspeciales;
    private String urlDocumentoPdf;
    private Long trabajadorId;
}
