package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.dto.CrearTareaDTO;
import com.jerezsur.inmobiliaria.dto.DashboardDTO;
import com.jerezsur.inmobiliaria.models.Tarea;
import com.jerezsur.inmobiliaria.models.enums.EstadoContrato;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.repositories.CitaRepository;
import com.jerezsur.inmobiliaria.repositories.ContratoRepository;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.TareaRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DashboardService {

    private final TareaRepository tareaRepository;
    private final InmuebleRepository inmuebleRepository;
    private final UsuarioRepository usuarioRepository;
    private final CitaRepository citaRepository;
    private final ContratoRepository contratoRepository;

    @Transactional(readOnly = true)
    public DashboardDTO getDashboard() {
        return DashboardDTO.builder()
                .inmueblesActivos(
                        inmuebleRepository.countByEstado(EstadoInmueble.DISPONIBLE))
                .clientesNuevos(
                        usuarioRepository.count()) // Contamos todos los usuarios para el MVP
                .visitasProgramadas(
                        citaRepository.count()) // Contamos todas las citas en el sistema
                .contratosPendientes(
                        contratoRepository.countByEstado(EstadoContrato.PENDIENTE_FIRMA))
                .tareas(tareaRepository.findAllByOrderByFechaAsc())
                .build();
    }

    public Tarea crearTarea(CrearTareaDTO dto) {
        Tarea tarea = Tarea.builder()
                .titulo(dto.getTitulo())
                .descripcion(dto.getDescripcion())
                .fecha(dto.getFecha())
                .prioridad(dto.getPrioridad())
                .enlace(dto.getEnlace())
                .etiquetaEnlace(dto.getEtiquetaEnlace())
                .fechaCreacion(dto.getFechaCreacion())
                .build();

        return tareaRepository.save(tarea);
    }

    /**
     * Al completar una tarea se elimina físicamente de la BD.
     * No queremos guardar histórico para que no ocupe espacio.
     */
    public void completarTarea(Long id) {
        if (!tareaRepository.existsById(id)) {
            throw new RuntimeException("Tarea no encontrada con id: " + id);
        }
        tareaRepository.deleteById(id);
    }

    public void eliminarTarea(Long id) {
        tareaRepository.deleteById(id);
    }
}