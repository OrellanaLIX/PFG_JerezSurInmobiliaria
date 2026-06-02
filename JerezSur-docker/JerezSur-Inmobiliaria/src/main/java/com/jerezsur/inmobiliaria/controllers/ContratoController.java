package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.dto.ContratoResponseDTO;
import com.jerezsur.inmobiliaria.dto.CrearContratoDTO;
import com.jerezsur.inmobiliaria.services.ContratoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controlador de contratos: gestiona la generación y consulta de contratos
// vinculados a operaciones de compraventa o alquiler
@RestController
@RequestMapping("/api/contratos")
public class ContratoController {

    @Autowired
    private ContratoService contratoService;

    // Genera un borrador de contrato para una operación existente
    // El PDF se puede subir después a través de MediaController
    @PostMapping("/operacion/{operacionId}/generar")
    public ResponseEntity<ContratoResponseDTO> generarDocumento(
            @PathVariable Long operacionId,
            @RequestBody CrearContratoDTO dto) {
        return ResponseEntity.ok(contratoService.generarBorrador(operacionId, dto));
    }

    // Lista todos los contratos asociados a una operación concreta
    @GetMapping("/operacion/{operacionId}")
    public ResponseEntity<List<ContratoResponseDTO>> listarPorOperacion(@PathVariable Long operacionId) {
        return ResponseEntity.ok(contratoService.listarPorOperacion(operacionId));
    }
}
