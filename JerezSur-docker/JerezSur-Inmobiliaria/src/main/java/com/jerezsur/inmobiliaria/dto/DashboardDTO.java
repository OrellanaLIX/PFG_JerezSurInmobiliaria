package com.jerezsur.inmobiliaria.dto;

import com.jerezsur.inmobiliaria.models.Tarea;
import lombok.*;
import java.util.List;

/**
 * DTO de respuesta para el panel de control del administrador.
 *
 * Agrupa en una sola llamada los KPIs numéricos (inmuebles activos, citas próximas...)
 * y la lista de tareas pendientes, para que el dashboard solo necesite hacer un fetch
 * al cargar en vez de cuatro peticiones paralelas. La lista de tareas usa la entidad
 * directamente porque no contiene datos sensibles que haya que ocultar.
 */
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class DashboardDTO {
    private long inmueblesActivos;
    private long clientesNuevos;
    private long visitasProgramadas;
    private long contratosPendientes;
    private List<Tarea> tareas;
}
