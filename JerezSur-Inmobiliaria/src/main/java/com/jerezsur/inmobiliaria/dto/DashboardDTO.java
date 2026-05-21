package com.jerezsur.inmobiliaria.dto;

import com.jerezsur.inmobiliaria.models.Tarea;
import lombok.*;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class DashboardDTO {
    private long inmueblesActivos;
    private long clientesNuevos;
    private long visitasProgramadas;
    private long contratosPendientes;
    private List<Tarea> tareas;
}
