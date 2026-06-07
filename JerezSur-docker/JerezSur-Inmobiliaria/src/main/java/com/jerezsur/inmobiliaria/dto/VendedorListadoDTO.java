package com.jerezsur.inmobiliaria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendedorListadoDTO {

    private Long id;
    private String observaciones;
    private LocalDateTime fechaRegistro;

    private UsuarioBasicoDTO usuario;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioBasicoDTO {
        private Long id;
        private String nombre;
        private String apellidos;
        private String email;
        private String telefono;
        private Boolean activo;
    }
}
