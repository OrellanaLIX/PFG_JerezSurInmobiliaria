package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.services.TrabajadorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/trabajadores")
@CrossOrigin(origins = "http://localhost:3000")
public class TrabajadorController {

    @Autowired
    private TrabajadorService trabajadorService;

    /**
     * Este endpoint maneja:
     * 1. Registro manual del usuario.
     * 2. Envío del formulario de contacto (que crea el perfil).
     */
    @PostMapping("/registrar")
    public ResponseEntity<Trabajador> registrarInteresado(@Valid @RequestBody Trabajador trabajador) {
        // Valida, crea Usuario si no existe, cifra pass y guarda.
        Trabajador nuevoTrabajador = trabajadorService.guardar(trabajador);

        return new ResponseEntity<>(nuevoTrabajador, HttpStatus.CREATED);
    }
    
}