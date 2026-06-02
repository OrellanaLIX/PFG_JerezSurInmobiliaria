package com.jerezsur.inmobiliaria.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

// DTO para crear un contrato: recibe los datos del formulario del panel admin.
@Getter
// DTO para crear un contrato: recibe los datos del formulario del panel admin.
@Setter
// DTO para crear un contrato: recibe los datos del formulario del panel admin.
@NoArgsConstructor
public class CrearContratoDTO {
    private String modelo;
    private LocalDate fechaFirma;
    private String clausulasEspeciales;
    private Long trabajadorId;
}
