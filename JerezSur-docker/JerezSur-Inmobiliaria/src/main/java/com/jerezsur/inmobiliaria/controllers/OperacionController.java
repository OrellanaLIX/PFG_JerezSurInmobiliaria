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

// Controlador de operaciones inmobiliarias (compraventa y alquiler).
// Una operación vincula un inmueble con un comprador/inquilino y registra el proceso de la venta.
@RestController
@RequestMapping("/api/operaciones")
public class OperacionController {

    @Autowired
    private OperacionService operacionService;

    // Inicia una nueva operación (por ejemplo, cuando un cliente hace una oferta en firme)
    @PostMapping
    public ResponseEntity<OperacionResponseDTO> crear(@RequestBody CrearOperacionDTO dto) {
        return new ResponseEntity<>(operacionService.crearDesdeDTO(dto), HttpStatus.CREATED);
    }

    // Obtiene los detalles de una operación por su ID
    @GetMapping("/{id}")
    public ResponseEntity<OperacionResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(operacionService.buscarDTOPorId(id));
    }

    // Lista todas las operaciones registradas en el sistema
    @GetMapping
    public ResponseEntity<List<OperacionResponseDTO>> listarTodas() {
        return ResponseEntity.ok(operacionService.listarTodasDTO());
    }

    // Filtra las operaciones de un inmueble concreto (útil en la ficha del inmueble en el admin)
    @GetMapping("/inmueble/{inmuebleId}")
    public ResponseEntity<List<OperacionResponseDTO>> listarPorInmueble(@PathVariable Long inmuebleId) {
        return ResponseEntity.ok(operacionService.listarPorInmuebleDTO(inmuebleId));
    }

    // Cambia el estado de una operación (EN_PROCESO, CERRADA, CANCELADA, etc.)
    @PatchMapping("/{id}/estado")
    public ResponseEntity<OperacionResponseDTO> actualizarEstado(
            @PathVariable Long id,
            @RequestParam EstadoOperacion estado) {
        return ResponseEntity.ok(operacionService.actualizarEstado(id, estado));
    }

    // Elimina la operación definitivamente de la BD
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        operacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
