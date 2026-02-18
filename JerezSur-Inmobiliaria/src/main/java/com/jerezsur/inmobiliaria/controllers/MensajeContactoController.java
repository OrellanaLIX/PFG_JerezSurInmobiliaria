package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jerezsur.inmobiliaria.models.MensajeContacto;
import com.jerezsur.inmobiliaria.services.MensajeContactoService;

@RestController
@RequestMapping("/api/contactos")
@CrossOrigin(origins = "http://localhost:3000")
public class MensajeContactoController {

    @Autowired
    private MensajeContactoService mensajeService;

    @PostMapping("/enviar")
    public ResponseEntity<Void> recibirMensaje(@RequestBody MensajeContacto mensaje) {
        mensajeService.enviarMensaje(mensaje);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}