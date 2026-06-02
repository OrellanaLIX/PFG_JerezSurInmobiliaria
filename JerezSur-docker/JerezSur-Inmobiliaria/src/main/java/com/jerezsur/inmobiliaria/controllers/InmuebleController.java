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
import com.jerezsur.inmobiliaria.models.enums.TipoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.services.InmuebleService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

// Controlador principal de inmuebles: expone el CRUD y el buscador con filtros
// que usa tanto el frontend público como el panel de administración
@RestController
@RequestMapping("/api/inmuebles")
public class InmuebleController {

    @Autowired
    private InmuebleService inmuebleService;

    // Devuelve solo los inmuebles marcados como "destacados" para la portada de la web
    @GetMapping("/destacados")
    public ResponseEntity<List<InmuebleDestacadoDTO>> getDestacados() {
        return ResponseEntity.ok(inmuebleService.listarDestacadosDTO());
    }

    // Búsqueda con filtros y paginación — todos los parámetros son opcionales
    // Si no se manda ninguno, devuelve todos los inmuebles paginados
    @GetMapping
    public ResponseEntity<Page<InmuebleListadoDTO>> filtrar(
            @RequestParam(required = false) String ref,
            @RequestParam(required = false) String tit,
            @RequestParam(required = false) String desc,
            @RequestParam(required = false) TipoOperacion operacion,
            @RequestParam(required = false) EstadoInmueble estado,
            @RequestParam(required = false) TipoInmueble tipo,         // NUEVO: filtro por tipo de inmueble
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(required = false) Integer habitaciones,
            @RequestParam(required = false) Integer banos,
            @RequestParam(required = false) Double superficieMin,
            @RequestParam(required = false) Double superficieMax,      // NUEVO: superficie máxima
            @RequestParam(required = false) String zona,               // NUEVO: filtro por zona (Chapín, Centro…)
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) String cp,
            @RequestParam(required = false, defaultValue = "0") @Min(0) int page,
            @RequestParam(required = false, defaultValue = "50") @Min(1) @Max(200) int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir) {

        // Protección contra valores maliciosos en los parámetros de ordenación
        // Si alguien manda un valor raro, usamos los valores seguros por defecto
        if (!sortDir.equalsIgnoreCase("asc") && !sortDir.equalsIgnoreCase("desc")) {
            sortDir = "desc";
        }

        // Solo permitimos ordenar por campos conocidos para evitar inyección SQL
        Set<String> allowedSortFields = Set.of("id", "referencia", "operacion", "precio", "superficieUtil",
                "habitaciones", "banos");
        if (!allowedSortFields.contains(sortBy)) {
            sortBy = "id";
        }

        Page<InmuebleListadoDTO> result = inmuebleService.buscarConFiltrosDTO(
                ref, tit, desc, operacion, estado, tipo,
                precioMin, precioMax, habitaciones, banos,
                superficieMin, superficieMax, zona, ciudad, cp,
                page, size, sortBy, sortDir);
        return ResponseEntity.ok(result);
    }

    // Devuelve la entidad completa del inmueble (para uso interno del admin)
    @GetMapping("/{id}")
    public ResponseEntity<Inmueble> getInmuebleById(@PathVariable Long id) {
        return ResponseEntity.ok(inmuebleService.buscarPorId(id));
    }

    // Devuelve solo los campos públicos (sin notas privadas) para la ficha del inmueble en la web
    @GetMapping("/{id}/detalle")
    public ResponseEntity<InmuebleDetallePublicoDTO> getDetalle(@PathVariable Long id) {
        return ResponseEntity.ok(inmuebleService.buscarDetallePublico(id));
    }

    // Crea un nuevo inmueble a partir del DTO que manda el formulario del admin
    // Devuelve 201 Created con el inmueble recién creado
    @PostMapping
    public ResponseEntity<Inmueble> createInmueble(@Valid @RequestBody InmuebleCrearDTO dto) {
        Inmueble nuevo = inmuebleService.guardarDesdeDto(dto);
        return new ResponseEntity<>(nuevo, HttpStatus.CREATED);
    }

    // Actualiza solo los campos que vienen en el DTO (actualización parcial)
    @PutMapping("/{id}")
    public ResponseEntity<Inmueble> updateInmueble(@PathVariable Long id, @Valid @RequestBody InmuebleActualizarDTO dto) {
        return ResponseEntity.ok(inmuebleService.actualizarDesdeDto(id, dto));
    }

    // Elimina el inmueble definitivamente de la BD (borrado físico)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInmueble(@PathVariable Long id) {
        inmuebleService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}