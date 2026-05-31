package com.jerezsur.inmobiliaria.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CrearContratoDTO {
    private String modelo;
    private LocalDate fechaFirma;
    private String clausulasEspeciales;
    private Long trabajadorId;
}
