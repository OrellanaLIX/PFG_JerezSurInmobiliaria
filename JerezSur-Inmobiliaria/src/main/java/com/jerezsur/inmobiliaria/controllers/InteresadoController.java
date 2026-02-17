package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jerezsur.inmobiliaria.models.Interesado;
import com.jerezsur.inmobiliaria.services.InteresadoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/interesados")
@CrossOrigin(origins = "http://localhost:3000")
public class InteresadoController {

    @Autowired
    private InteresadoService interesadoService;

    /**
     * Este endpoint maneja:
     * 1. Registro manual del usuario.
     * 2. Envío del formulario de contacto (que crea el perfil).
     */
    @PostMapping("/registrar")
    public ResponseEntity<Interesado> registrarInteresado(@Valid @RequestBody Interesado interesado) {
        // Valida, crea Usuario si no existe, cifra pass y guarda.
        Interesado nuevoInteresado = interesadoService.guardar(interesado);

        return new ResponseEntity<>(nuevoInteresado, HttpStatus.CREATED);
    }
    
}