package com.jerezsur.inmobiliaria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

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
