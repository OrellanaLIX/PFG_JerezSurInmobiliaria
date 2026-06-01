package com.jerezsur.inmobiliaria.controllers;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jerezsur.inmobiliaria.dto.InmuebleActualizarDTO;
import com.jerezsur.inmobiliaria.dto.InmuebleCrearDTO;
import com.jerezsur.inmobiliaria.dto.InmuebleDetallePublicoDTO;
import com.jerezsur.inmobiliaria.dto.InmuebleDestacadoDTO;
import com.jerezsur.inmobiliaria.dto.InmuebleListadoDTO;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.services.InmuebleService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/inmuebles")
public class InmuebleController {

    @Autowired
    private InmuebleService inmuebleService;

    @GetMapping("/destacados")
    public ResponseEntity<List<InmuebleDestacadoDTO>> getDestacados() {
        return ResponseEntity.ok(inmuebleService.listarDestacadosDTO());
    }

    @GetMapping
    public ResponseEntity<Page<InmuebleListadoDTO>> filtrar(
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

        if (!sortDir.equalsIgnoreCase("asc") && !sortDir.equalsIgnoreCase("desc")) {
            sortDir = "asc";
        }

        Set<String> allowedSortFields = Set.of("id", "referencia", "operacion", "precio", "superficieUtil",
                "habitaciones", "banos");
        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "id";
        }

        Page<InmuebleListadoDTO> result = inmuebleService.buscarConFiltrosDTO(ref, tit, desc, operacion, estado,
                precioMin, precioMax, habitaciones, banos, superficieMin, ciudad, cp, page, size, sortBy, sortDir);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inmueble> getInmuebleById(@PathVariable Long id) {
        return ResponseEntity.ok(inmuebleService.buscarPorId(id));
    }

    @GetMapping("/{id}/detalle")
    public ResponseEntity<InmuebleDetallePublicoDTO> getDetalle(@PathVariable Long id) {
        return ResponseEntity.ok(inmuebleService.buscarDetallePublico(id));
    }

    @PostMapping
    public ResponseEntity<Inmueble> createInmueble(@Valid @RequestBody InmuebleCrearDTO dto) {
        Inmueble nuevo = inmuebleService.guardarDesdeDto(dto);
        return new ResponseEntity<>(nuevo, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inmueble> updateInmueble(@PathVariable Long id, @Valid @RequestBody InmuebleActualizarDTO dto) {
        return ResponseEntity.ok(inmuebleService.actualizarDesdeDto(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInmueble(@PathVariable Long id) {
        inmuebleService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}