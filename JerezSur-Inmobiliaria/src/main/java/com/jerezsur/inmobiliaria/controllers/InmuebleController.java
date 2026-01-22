package com.jerezsur.inmobiliaria.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;

@RestController
@RequestMapping("/api/inmuebles")
@CrossOrigin(origins = "http://localhost:3000") // Para conectar con tu futuro React
public class InmuebleController {

    @Autowired
    private InmuebleRepository inmuebleRepository;

    // Obtener todos los inmuebles (Público)
    @GetMapping
    public List<Inmueble> getAllInmuebles() {
        return inmuebleRepository.findAll();
    }

    // Obtener un inmueble por ID (Público)
    @GetMapping("/{id}")
    public ResponseEntity<Inmueble> getInmuebleById(@PathVariable Long id) {
        return inmuebleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Crear inmueble (Solo personal autorizado)
    @PostMapping
    public Inmueble createInmueble(@RequestBody Inmueble inmueble) {
        // Aquí podrías usar el Map<String, String> para extras definido en tu modelo 
        return inmuebleRepository.save(inmueble);
    }
}
