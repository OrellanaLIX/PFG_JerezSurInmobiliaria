package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.dto.CrearTareaDTO;
import com.jerezsur.inmobiliaria.dto.DashboardDTO;
import com.jerezsur.inmobiliaria.models.Tarea;
import com.jerezsur.inmobiliaria.services.DashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

// Controlador del panel de control (dashboard) del admin.
// Proporciona los KPIs de resumen y gestiona las tareas pendientes de los trabajadores.
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // Devuelve el resumen del dashboard: KPIs (inmuebles, clientes, citas, contratos) y lista de tareas
    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    // Crea una nueva tarea manual desde el panel (además de las que se crean automáticamente)
    @PostMapping("/tareas")
    public Tarea crearTarea(@Valid @RequestBody CrearTareaDTO dto) {
        return dashboardService.crearTarea(dto);
    }

    // Marcar una tarea como completada la elimina de la BD (no guardamos histórico de completadas)
    @PatchMapping("/tareas/{id}/completar")
    public void completarTarea(@PathVariable Long id) {
        dashboardService.completarTarea(id);
    }

    // Elimina una tarea directamente sin marcarla como completada
    @DeleteMapping("/tareas/{id}")
    public void eliminarTarea(@PathVariable Long id) {
        dashboardService.eliminarTarea(id);
    }
}