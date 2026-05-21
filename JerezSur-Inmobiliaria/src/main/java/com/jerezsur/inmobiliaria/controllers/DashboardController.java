package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.repositories.CitaRepository;
import com.jerezsur.inmobiliaria.models.enums.EstadoContrato;
import com.jerezsur.inmobiliaria.repositories.ContratoRepository;
import com.jerezsur.inmobiliaria.dto.DashboardDTO;
import com.jerezsur.inmobiliaria.models.Tarea;
import com.jerezsur.inmobiliaria.repositories.TareaRepository;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final TareaRepository tareaRepository;
    private final InmuebleRepository inmuebleRepository;
    private final UsuarioRepository usuarioRepository;
    private final CitaRepository citaRepository;
    private final ContratoRepository contratoRepository;

    @GetMapping
    public DashboardDTO getDashboard() {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime hace30Dias = ahora.minusDays(30);

        return DashboardDTO.builder()
                .inmueblesActivos(
                        inmuebleRepository.countByEstado(EstadoInmueble.DISPONIBLE)
                )
                .clientesNuevos(
                        usuarioRepository.countClientesNuevosDesde(hace30Dias)
                )
                .visitasProgramadas(
                        citaRepository.countByFechaHoraGreaterThanEqual(ahora)
                )
                .contratosPendientes(
                        contratoRepository.countByEstado(EstadoContrato.PENDIENTE_FIRMA)
                )
                .tareas(tareaRepository.findByCompletadaFalseOrderByFechaAsc())
                .build();
    }

    @PostMapping("/tareas")
    public Tarea crearTarea(@RequestBody Tarea tarea) {
        tarea.setId(null);
        tarea.setCompletada(false);
        return tareaRepository.save(tarea);
    }

    @PatchMapping("/tareas/{id}/completar")
    public Tarea completarTarea(@PathVariable Long id) {
        Tarea t = tareaRepository.findById(id).orElseThrow();
        t.setCompletada(true);
        return tareaRepository.save(t);
    }

    @DeleteMapping("/tareas/{id}")
    public void eliminarTarea(@PathVariable Long id) {
        tareaRepository.deleteById(id);
    }
}