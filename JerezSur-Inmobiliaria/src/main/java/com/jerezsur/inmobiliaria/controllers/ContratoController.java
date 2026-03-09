package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.models.Contrato;
import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.models.enums.ModeloContrato;
import com.jerezsur.inmobiliaria.services.ContratoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contratos")
@CrossOrigin(origins = "*")
public class ContratoController {

    @Autowired
    private ContratoService contratoService;

    /**
     * GENERAR BORRADOR
     * En el body solo necesitamos el modelo de contrato (ARRAS, ALQUILER_VIVIENDA, etc.)
     * El trabajador se sacaría normalmente del contexto de seguridad (Auth).
     */
    @PostMapping("/operacion/{operacionId}/generar")
    public ResponseEntity<Contrato> generarDocumento(
            @PathVariable Long operacionId,
            @RequestParam ModeloContrato modelo,
            @RequestBody Trabajador trabajador) { // Temporalmente recibimos el trabajador por body
        
        Contrato contrato = contratoService.generarBorrador(operacionId, modelo, trabajador);
        return ResponseEntity.ok(contrato);
    }

    // LISTAR TODOS LOS DOCUMENTOS DE UNA CARPETA/OPERACIÓN
    @GetMapping("/operacion/{operacionId}")
    public ResponseEntity<List<Contrato>> listarPorOperacion(@PathVariable Long operacionId) {
        return ResponseEntity.ok(contratoService.listarPorOperacion(operacionId));
    }
}