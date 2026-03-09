package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jerezsur.inmobiliaria.models.MensajeContacto;
import com.jerezsur.inmobiliaria.services.MensajeContactoService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/contactos")
@CrossOrigin(origins = "http://localhost:3000")
public class MensajeContactoController {

    @Autowired
    private MensajeContactoService mensajeService;

    // Mapear mensajes
    @GetMapping
    public ResponseEntity<Page<MensajeContacto>> listarTodos(
            @RequestParam(required = false, defaultValue = "0") @Min(0) int page,
            @RequestParam(required = false, defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(mensajeService.listarMensajes(page,
                size, sortBy, sortDir));
    }

    // Enviar mensaje
    @PostMapping("/enviar")
    public ResponseEntity<Void> recibirMensaje(@RequestBody MensajeContacto mensaje) {
        mensajeService.enviarMensaje(mensaje);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}