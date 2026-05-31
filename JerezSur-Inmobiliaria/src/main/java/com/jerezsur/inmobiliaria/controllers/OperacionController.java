package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.dto.CrearOperacionDTO;
import com.jerezsur.inmobiliaria.dto.OperacionResponseDTO;
import com.jerezsur.inmobiliaria.models.enums.EstadoOperacion;
import com.jerezsur.inmobiliaria.services.OperacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operaciones")
public class OperacionController {

    @Autowired
    private OperacionService operacionService;

    @PostMapping
    public ResponseEntity<OperacionResponseDTO> crear(@RequestBody CrearOperacionDTO dto) {
        return new ResponseEntity<>(operacionService.crearDesdeDTO(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperacionResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(operacionService.buscarDTOPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<OperacionResponseDTO>> listarTodas() {
        return ResponseEntity.ok(operacionService.listarTodasDTO());
    }

    @GetMapping("/inmueble/{inmuebleId}")
    public ResponseEntity<List<OperacionResponseDTO>> listarPorInmueble(@PathVariable Long inmuebleId) {
        return ResponseEntity.ok(operacionService.listarPorInmuebleDTO(inmuebleId));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<OperacionResponseDTO> actualizarEstado(
            @PathVariable Long id,
            @RequestParam EstadoOperacion estado) {
        return ResponseEntity.ok(operacionService.actualizarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        operacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
