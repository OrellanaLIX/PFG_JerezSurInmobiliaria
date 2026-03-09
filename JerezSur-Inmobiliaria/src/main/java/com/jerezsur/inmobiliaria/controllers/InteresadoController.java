package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jerezsur.inmobiliaria.models.Interesado;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.services.InteresadoService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/interesados")
@CrossOrigin(origins = "http://localhost:3000")
public class InteresadoController {

    @Autowired
    private InteresadoService interesadoService;

    // --- REGISTRO / CREACIÓN ---
    @PostMapping("/registrar")
    public ResponseEntity<Interesado> registrarInteresado(@Valid @RequestBody Interesado interesado) {
        // El service se encarga de la lógica de usuario, password y sincronización
        Interesado nuevoInteresado = interesadoService.guardar(interesado);
        return new ResponseEntity<>(nuevoInteresado, HttpStatus.CREATED);
    }

    // --- BÚSQUEDA DINÁMICA (Para el Administrador/Comercial) ---
    @GetMapping
    public ResponseEntity<Page<Interesado>> buscarInteresados(
            @RequestParam(required = false) Boolean hipoteca,
            @RequestParam(required = false) Double presupuesto,
            @RequestParam(required = false) String zona,
            @RequestParam(required = false) Integer habs,
            @RequestParam(required = false) Integer banos,
            @RequestParam(required = false) TipoOperacion tipo,
            @RequestParam(required = false, defaultValue = "0") @Min(0) int page,
            @RequestParam(required = false, defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {

        Page<Interesado> resultados = interesadoService.listarTodo(hipoteca, presupuesto, zona, habs, banos, tipo, page,
                size, sortBy, sortDir);
        return ResponseEntity.ok(resultados);
    }

    // --- OBTENER PERFIL INDIVIDUAL ---
    @GetMapping("/{id}")
    public ResponseEntity<Interesado> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(interesadoService.buscarPorId(id));
    }

    // --- ACTUALIZAR (Cambio de preferencias, presupuesto, etc.) ---
    @PutMapping("/{id}")
    public ResponseEntity<Interesado> actualizarInteresado(
            @PathVariable Long id,
            @Valid @RequestBody Interesado interesado) {

        // Aseguramos que el ID del objeto coincida con el de la URL
        interesado.setId(id);
        Interesado actualizado = interesadoService.guardar(interesado);
        return ResponseEntity.ok(actualizado);
    }

    // --- ELIMINAR ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarInteresado(@PathVariable Long id) {
        interesadoService.eliminar(id);
        return ResponseEntity.noContent().build(); // Devuelve 204 No Content
    }
}