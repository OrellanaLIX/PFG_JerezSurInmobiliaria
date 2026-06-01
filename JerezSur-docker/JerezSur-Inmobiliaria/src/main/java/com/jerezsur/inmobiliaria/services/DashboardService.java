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

/**
 * Servicio que proporciona los datos para el panel de control (dashboard) del admin.
 *
 * Recoge información de varios repositorios para construir el DTO del dashboard:
 * conteo de inmuebles, clientes, citas pendientes, contratos y lista de tareas.
 *
 * También gestiona el CRUD de tareas manuales que crean los trabajadores desde el panel.
 * Las tareas automáticas (por nueva cita, nuevo mensaje, etc.) las crean otros servicios.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DashboardService {

    private final TareaRepository tareaRepository;
    private final InmuebleRepository inmuebleRepository;
    private final UsuarioRepository usuarioRepository;
    private final CitaRepository citaRepository;
    private final ContratoRepository contratoRepository;

    /**
     * Recoge todos los datos necesarios para el panel principal.
     * Usamos @Transactional(readOnly=true) porque solo leemos, nunca escribimos.
     * Esto mejora el rendimiento porque Hibernate no tiene que llevar la cuenta de cambios.
     */
    @Transactional(readOnly = true)
    public DashboardDTO getDashboard() {
        return DashboardDTO.builder()
                // Solo los disponibles, no los vendidos o retirados
                .inmueblesActivos(inmuebleRepository.countByEstado(EstadoInmueble.DISPONIBLE))
                // Total de usuarios registrados en el sistema
                .clientesNuevos(usuarioRepository.count())
                // Total de citas (futuras y pasadas), para ver la actividad general
                .visitasProgramadas(citaRepository.count())
                // Solo los que están a falta de firma (los más urgentes)
                .contratosPendientes(contratoRepository.countByEstado(EstadoContrato.PENDIENTE_FIRMA))
                // Tareas ordenadas por fecha de vencimiento (las más urgentes primero)
                .tareas(tareaRepository.findAllByOrderByFechaAsc())
                .build();
    }

    /**
     * Crea una tarea manual desde el dashboard.
     * El trabajador puede crear tareas propias además de las automáticas del sistema.
     * Si no manda fecha de creación usamos la fecha de hoy.
     */
    public Tarea crearTarea(CrearTareaDTO dto) {
        Tarea tarea = Tarea.builder()
                .titulo(dto.getTitulo())
                .descripcion(dto.getDescripcion())
                .fecha(dto.getFecha())
                .prioridad(dto.getPrioridad())
                .enlace(dto.getEnlace())
                .etiquetaEnlace(dto.getEtiquetaEnlace())
                .fechaCreacion(dto.getFechaCreacion() != null
                        ? dto.getFechaCreacion()
                        : java.time.LocalDate.now())
                .build();

        return tareaRepository.save(tarea);
    }

    /**
     * Cuando un trabajador marca una tarea como "hecha", la borramos directamente.
     * No guardamos histórico de tareas completadas porque no lo necesitamos
     * y así la BD no crece innecesariamente.
     */
    public void completarTarea(Long id) {
        if (!tareaRepository.existsById(id)) {
            throw new RuntimeException("Tarea no encontrada con id: " + id);
        }
        tareaRepository.deleteById(id);
    }

    /** Eliminación directa sin comprobación (para el botón de eliminar del panel). */
    public void eliminarTarea(Long id) {
        tareaRepository.deleteById(id);
    }
}
