package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.services.VendedorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendedores")
@CrossOrigin(origins = "http://localhost:3000")
public class VendedorController {

    @Autowired
    private VendedorService vendedorService;

    /**
     * Este endpoint maneja:
     * 1. Registro manual del usuario.
     * 2. Envío del formulario de contacto (que crea el perfil).
     */
    @PostMapping("/registrar")
    public ResponseEntity<Vendedor> registrarInteresado(@Valid @RequestBody Vendedor vendedor) {
        // Valida, crea Usuario si no existe, cifra pass y guarda.
        Vendedor nuevoVendedor = vendedorService.guardar(vendedor);

        return new ResponseEntity<>(nuevoVendedor, HttpStatus.CREATED);
    }
    
}