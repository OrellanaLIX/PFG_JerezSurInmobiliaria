package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.dto.CrearTareaDTO;
import com.jerezsur.inmobiliaria.dto.DashboardDTO;
import com.jerezsur.inmobiliaria.models.Tarea;
import com.jerezsur.inmobiliaria.services.DashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    @PostMapping("/tareas")
    public Tarea crearTarea(@Valid @RequestBody CrearTareaDTO dto) {
        return dashboardService.crearTarea(dto);
    }

    // Ahora devuelve void porque la tarea se elimina
    @PatchMapping("/tareas/{id}/completar")
    public void completarTarea(@PathVariable Long id) {
        dashboardService.completarTarea(id);
    }

    @DeleteMapping("/tareas/{id}")
    public void eliminarTarea(@PathVariable Long id) {
        dashboardService.eliminarTarea(id);
    }
}