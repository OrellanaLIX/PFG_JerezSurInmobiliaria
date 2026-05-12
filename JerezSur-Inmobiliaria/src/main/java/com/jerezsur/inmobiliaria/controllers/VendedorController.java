package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.services.VendedorService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/vendedores")
@CrossOrigin(origins = "http://localhost:3000")
public class VendedorController {

    @Autowired
    private VendedorService vendedorService;

    // --- REGISTRAR / CREAR VENDEDOR ---
    @PostMapping("/registrar")
    public ResponseEntity<Vendedor> registrarVendedor(@Valid @RequestBody Vendedor vendedor) {
        // El service gestiona: validación DNI, creación de Usuario (ROLE_VENDEDOR) y
        // cifrado
        //Vendedor nuevoVendedor = vendedorService.guardar(vendedor);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    // --- LISTAR TODOS LOS VENDEDORES ---
    @GetMapping
    public ResponseEntity<Page<Vendedor>> listarTodos(
            @RequestParam(required = false, defaultValue = "0") @Min(0) int page,
            @RequestParam(required = false, defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(vendedorService.listarTodos(page, size, sortBy, sortDir));
    }

    // --- OBTENER DETALLES DE UN VENDEDOR ---
    @GetMapping("/{id}")
    public ResponseEntity<Vendedor> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(vendedorService.buscarPorId(id));
    }

    // --- ACTUALIZAR DATOS DEL VENDEDOR ---
    @PutMapping("/{id}")
    public ResponseEntity<Vendedor> actualizarVendedor(
            @PathVariable Long id,
            @Valid @RequestBody Vendedor vendedor) {

        // Garantizamos que el ID de la URL sea el que se procesa
        vendedor.setId(id);
        // Vendedor actualizado = vendedorService.guardar(vendedor);
        return ResponseEntity.ok(vendedor);
    }

    // --- ELIMINAR VENDEDOR ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVendedor(@PathVariable Long id) {
        vendedorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}