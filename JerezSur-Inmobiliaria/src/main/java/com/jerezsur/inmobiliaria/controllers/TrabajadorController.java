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

@RestController
@RequestMapping("/api/trabajadores")
@CrossOrigin(origins = "http://localhost:3000")
public class TrabajadorController {

    @Autowired
    private TrabajadorService trabajadorService;

    // --- 1. CREAR / REGISTRAR TRABAJADOR ---
    @PostMapping("/registrar")
    public ResponseEntity<Trabajador> registrarTrabajador(@Valid @RequestBody Trabajador trabajador) {
        // Crea el perfil de trabajador y automáticamente su cuenta de Usuario
        // (Role.ROLE_TRABAJADOR)
        Trabajador nuevoTrabajador = trabajadorService.guardar(trabajador);
        return new ResponseEntity<>(nuevoTrabajador, HttpStatus.CREATED);
    }

    // --- 2. LISTAR PLANTILLA COMPLETA ---
    @GetMapping
    public ResponseEntity<Page<Trabajador>> listarTodos(
            @RequestParam(required = false, defaultValue = "0") @Min(0) int page,
            @RequestParam(required = false, defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(trabajadorService.listarTodos(page,
                size, sortBy, sortDir));
    }

    // --- 3. OBTENER DETALLES DE UN TRABAJADOR ---
    @GetMapping("/{id}")
    public ResponseEntity<Trabajador> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(trabajadorService.buscarPorId(id));
    }

    // --- 4. ACTUALIZAR TRABAJADOR (Cambio de cargo, teléfono, etc.) ---
    @PutMapping("/{id}")
    public ResponseEntity<Trabajador> actualizarTrabajador(
            @PathVariable Long id,
            @Valid @RequestBody Trabajador trabajador) {

        // Seteamos el ID del path al objeto para asegurar que editamos el correcto
        trabajador.setId(id);
        Trabajador actualizado = trabajadorService.guardar(trabajador);
        return ResponseEntity.ok(actualizado);
    }

    // --- 5. ELIMINAR / DAR DE BAJA ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTrabajador(@PathVariable Long id) {
        trabajadorService.eliminar(id);
        // Respuesta 204 No Content: indica que la acción se realizó con éxito pero no
        // hay datos que devolver
        return ResponseEntity.noContent().build();
    }
}