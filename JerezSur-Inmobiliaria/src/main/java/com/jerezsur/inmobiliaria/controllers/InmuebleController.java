package com.jerezsur.inmobiliaria.controllers;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.Operacion;
import com.jerezsur.inmobiliaria.services.InmuebleService;

@RestController
@RequestMapping("/api/inmuebles")
@CrossOrigin(origins = "http://localhost:3000") // Para conectar con tu futuro React
public class InmuebleController {

    @Autowired
    private InmuebleService inmuebleService;

    @GetMapping("/buscar")
    public ResponseEntity<List<Inmueble>> filtrar(
            @RequestParam(required = false) String ref,
            @RequestParam(required = false) String tit,
            @RequestParam(required = false) String desc,
            @RequestParam(required = false) Operacion operacion,
            @RequestParam(required = false) EstadoInmueble estado,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(required = false) Integer habitaciones,
            @RequestParam(required = false) Integer banos,
            @RequestParam(required = false) Double superficieMin,
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) String cp) {
        return ResponseEntity
                .ok(inmuebleService.buscarConFiltros(ref, tit, desc, operacion, estado, precioMin, precioMax,
                        habitaciones, banos, superficieMin, ciudad, cp));
    }

    // Obtener un inmueble por ID (Público)
    @GetMapping("/{id}")
    public Inmueble getInmuebleById(@PathVariable Long id) {
        return inmuebleService.buscarPorId(id);
    }

    // Crear inmueble (Solo personal autorizado)
    @PostMapping
    public Inmueble createInmueble(@RequestBody Inmueble inmueble) {
        // Aquí podrías usar el Map<String, String> para extras definido en tu modelo
        return inmuebleService.guardar(inmueble);
    }
}
