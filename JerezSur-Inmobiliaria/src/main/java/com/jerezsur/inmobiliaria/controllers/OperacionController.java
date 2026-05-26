package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.models.Operacion;
import com.jerezsur.inmobiliaria.services.OperacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operaciones")
// Ajustar según tu frontend React
public class OperacionController {

    @Autowired
    private OperacionService operacionService;

    // CREAR OPERACIÓN (Acepta OperacionVenta u OperacionAlquiler automáticamente)
    @PostMapping
    public ResponseEntity<Operacion> crear(@RequestBody Operacion operacion) {
        Operacion nuevaOp = operacionService.crearOperacion(operacion);
        return new ResponseEntity<>(nuevaOp, HttpStatus.CREATED);
    }

    // OBTENER DETALLE DE UNA OPERACIÓN
    @GetMapping("/{id}")
    public ResponseEntity<Operacion> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(operacionService.buscarPorId(id));
    }

    // LISTAR POR INMUEBLE (Para ver el historial de un piso)
    @GetMapping("/inmueble/{inmuebleId}")
    public ResponseEntity<List<Operacion>> listarPorInmueble(@PathVariable Long inmuebleId) {
        return ResponseEntity.ok(operacionService.listarPorInmueble(inmuebleId));
    }
}