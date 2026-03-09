package com.jerezsur.inmobiliaria.controllers;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jerezsur.inmobiliaria.models.Cita;
import com.jerezsur.inmobiliaria.services.CitaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:3000")
public class CitaController {

    @Autowired
    private CitaService citaService;

    // --- AGENDAR NUEVA CITA ---
    @PostMapping
    public ResponseEntity<Cita> crearCita(@Valid @RequestBody Cita cita) {
        // El service validará que no haya solapamiento de horarios
        Cita nuevaCita = citaService.guardar(cita);
        return new ResponseEntity<>(nuevaCita, HttpStatus.CREATED);
    }

    // --- LISTAR TODAS LAS CITAS ---
    @GetMapping
    public ResponseEntity<Page<Cita>> listarTodas(@RequestParam LocalDateTime min, @RequestParam LocalDateTime max,
            @RequestParam int page, @RequestParam int size, @RequestParam String sortBy, @RequestParam String sortDir) {
        return ResponseEntity.ok(citaService.listarTodas(min, max, page, size, sortBy, sortDir));
    }

    // --- OBTENER UNA CITA ESPECÍFICA ---
    @GetMapping("/{id}")
    public ResponseEntity<Cita> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.buscarPorId(id));
    }

    // --- REPROGRAMAR CITA (Cambio de hora o fecha) ---
    @PutMapping("/{id}")
    public ResponseEntity<Cita> actualizarCita(
            @PathVariable Long id,
            @Valid @RequestBody Cita cita) {

        cita.setId(id);
        Cita actualizada = citaService.guardar(cita);
        return ResponseEntity.ok(actualizada);
    }

    // --- CANCELAR CITA ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelarCita(@PathVariable Long id) {
        citaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}