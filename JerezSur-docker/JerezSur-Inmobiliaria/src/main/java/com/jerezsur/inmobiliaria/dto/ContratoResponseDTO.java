package com.jerezsur.inmobiliaria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

// DTO de respuesta para los contratos: incluye los datos básicos del contrato y la URL del PDF cifrado.
@Getter
// DTO de respuesta para los contratos: incluye los datos básicos del contrato y la URL del PDF cifrado.
@Setter
// DTO de respuesta para los contratos: incluye los datos básicos del contrato y la URL del PDF cifrado.
@NoArgsConstructor
// DTO de respuesta para los contratos: incluye los datos básicos del contrato y la URL del PDF cifrado.
@AllArgsConstructor
// DTO de respuesta para los contratos: incluye los datos básicos del contrato y la URL del PDF cifrado.
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
