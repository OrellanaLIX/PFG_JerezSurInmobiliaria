package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.services.TrabajadorService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

// Controlador de trabajadores: gestiona el personal de la inmobiliaria (agentes, administrativos…)
// Los trabajadores son los únicos que tienen acceso al panel de administración
@RestController
@RequestMapping("/api/trabajadores")
public class TrabajadorController {

    @Autowired
    private TrabajadorService trabajadorService;

    // --- CREAR / REGISTRAR TRABAJADOR ---
    @PostMapping("/registrar")
    public ResponseEntity<Trabajador> registrarTrabajador(@Valid @RequestBody Trabajador trabajador) {
        // Crea el perfil de trabajador y automáticamente su cuenta de Usuario
        // (Role.ROLE_TRABAJADOR)
        // Trabajador nuevoTrabajador = trabajadorService.guardar(trabajador);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    // --- LISTAR PLANTILLA COMPLETA (con búsqueda opcional por nombre) ---
    @GetMapping
    public ResponseEntity<Page<Trabajador>> listarTodos(
            @RequestParam(required = false) String tit,
            @RequestParam(required = false, defaultValue = "0") @Min(0) int page,
            @RequestParam(required = false, defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(trabajadorService.listarTodos(tit, page, size, sortBy, sortDir));
    }

    // --- OBTENER DETALLES DE UN TRABAJADOR ---
    @GetMapping("/{id}")
    public ResponseEntity<Trabajador> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(trabajadorService.buscarPorId(id));
    }

    // --- ACTUALIZAR TRABAJADOR (Cambio de cargo, teléfono, etc.) ---
    @PutMapping("/{id}")
    public ResponseEntity<Trabajador> actualizarTrabajador(
            @PathVariable Long id,
            @Valid @RequestBody Trabajador trabajador) {

        // Seteamos el ID del path al objeto para asegurar que editamos el correcto
        trabajador.setId(id);
        // Trabajador actualizado = trabajadorService.guardar(trabajador);
        return ResponseEntity.ok(trabajador);
    }
}