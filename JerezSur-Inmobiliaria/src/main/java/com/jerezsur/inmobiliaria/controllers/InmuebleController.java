package com.jerezsur.inmobiliaria.controllers;

import java.math.BigDecimal;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.services.InmuebleService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/inmuebles")
@CrossOrigin(origins = "http://localhost:3000")
public class InmuebleController {

    @Autowired
    private InmuebleService inmuebleService;

    // --- BUSQUEDA CON FILTROS (Ya lo tienes, está muy bien) ---
    @GetMapping("/buscar")
    public ResponseEntity<Page<Inmueble>> filtrar(
            @RequestParam(required = false) String ref,
            @RequestParam(required = false) String tit,
            @RequestParam(required = false) String desc,
            @RequestParam(required = false) TipoOperacion operacion,
            @RequestParam(required = false) EstadoInmueble estado,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(required = false) Integer habitaciones,
            @RequestParam(required = false) Integer banos,
            @RequestParam(required = false) Double superficieMin,
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) String cp,
            @RequestParam(required = false, defaultValue = "0") @Min(0) int page,
            @RequestParam(required = false, defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {

        // Validación básica de ordenación
        if (!sortDir.equalsIgnoreCase("asc") && !sortDir.equalsIgnoreCase("desc")) {
            sortDir = "asc";
        }

        // Lista blanca de campos permitidos para ordenar (evita inyección / errores)
        Set<String> allowedSortFields = Set.of("id", "referencia", "operacion", "precio", "superficieUtil",
                "habitaciones",
                "banos");

        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "id";
        }
        Page<Inmueble> result = inmuebleService.buscarConFiltros(ref, tit, desc, operacion, estado, precioMin,
                precioMax, habitaciones, banos, superficieMin, ciudad, cp, page, size, sortBy, sortDir);
        return ResponseEntity.ok(result);
    }

    // --- OBTENER POR ID ---
    @GetMapping("/{id}")
    public ResponseEntity<Inmueble> getInmuebleById(@PathVariable Long id) {
        // Al usar ResponseEntity, mantienes la consistencia de la API
        return ResponseEntity.ok(inmuebleService.buscarPorId(id));
    }

    // --- CREAR ---
    @PostMapping
    public ResponseEntity<Inmueble> createInmueble(@jakarta.validation.Valid @RequestBody Inmueble inmueble) {
        Inmueble nuevo = inmuebleService.guardar(inmueble);
        // Devolvemos 201 Created que es lo correcto en REST al crear recursos
        return new ResponseEntity<>(nuevo, org.springframework.http.HttpStatus.CREATED);
    }

    // --- ACTUALIZAR ---
    @PutMapping("/{id}")
    public ResponseEntity<Inmueble> updateInmueble(@PathVariable Long id,
            @jakarta.validation.Valid @RequestBody Inmueble inmueble) {
        // Aseguramos que el ID del path coincida con el objeto
        inmueble.setId(id);
        return ResponseEntity.ok(inmuebleService.guardar(inmueble));
    }

    // --- BORRAR ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInmueble(@PathVariable Long id) {
        inmuebleService.eliminar(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}