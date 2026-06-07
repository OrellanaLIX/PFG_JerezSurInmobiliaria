package com.jerezsur.inmobiliaria.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * DTO de entrada para crear un contrato vinculado a una operación inmobiliaria.
 *
 * Un contrato es el documento legal que formaliza la operación (arras, compraventa,
 * alquiler...). El trabajadorId indica qué agente firma el contrato en nombre de
 * la inmobiliaria. La URL del PDF se añade después, cuando se sube el documento a Cloudinary.
 */
@Getter
@Setter
@NoArgsConstructor
public class CrearContratoDTO {
    private String modelo;
    private LocalDate fechaFirma;
    private String clausulasEspeciales;
    private Long trabajadorId;
}
