package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.dto.CitaResponseDTO;
import com.jerezsur.inmobiliaria.dto.SolicitudCitaUsuarioDTO;
import com.jerezsur.inmobiliaria.models.*;
import com.jerezsur.inmobiliaria.models.enums.EstadoCita;
import com.jerezsur.inmobiliaria.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Servicio que gestiona todo el ciclo de vida de las citas.
 *
 * Una cita puede estar en varios estados:
 *   PENDIENTE → alguien solicitó una cita pero nadie la ha aceptado aún
 *   CONFIRMADA → un trabajador la ha aceptado y el cliente ya lo sabe
 *   REALIZADA → la visita tuvo lugar correctamente
 *   CANCELADA → se canceló por cualquier motivo
 *
 * @Transactional en la clase hace que todos los métodos abran una transacción.
 * Así si algo falla a mitad del proceso, la base de datos vuelve al estado anterior.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CitaService {

    private final CitaRepository citaRepository;
    private final TrabajadorRepository trabajadorRepository;
    private final UsuarioRepository usuarioRepository;
    private final InmuebleRepository inmuebleRepository;
    private final TareaRepository tareaRepository;

    /**
     * Un trabajador acepta una cita que estaba pendiente.
     * Solo se puede aceptar si está en estado PENDIENTE (no si ya la cogió otro).
     * Al aceptarla se asigna el trabajador y cambia el estado a CONFIRMADA.
     */
    public CitaResponseDTO aceptarCita(Long citaId, Long trabajadorId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con ID: " + citaId));

        // Comprobamos que la cita sigue disponible para aceptar
        if (cita.getEstado() != EstadoCita.PENDIENTE) {
            throw new RuntimeException(
                    "Esta cita ya fue aceptada por otro trabajador o está en un estado que no permite la aceptación"
            );
        }

        Trabajador trabajador = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado con ID: " + trabajadorId));

        cita.setTrabajador(trabajador);
        cita.setEstado(EstadoCita.CONFIRMADA);
        Cita actualizada = citaRepository.save(cita);

        return mapearACitaResponse(actualizada);
    }

    /**
     * Marca una cita como realizada (la visita tuvo lugar).
     * Solo necesitamos el ID de la cita.
     */
    public CitaResponseDTO completarCita(Long citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con ID: " + citaId));

        cita.setEstado(EstadoCita.REALIZADA);
        return mapearACitaResponse(citaRepository.save(cita));
    }

    /**
     * Cancela una cita. La dejamos en BD para tener histórico
     * en lugar de borrarla directamente.
     */
    public CitaResponseDTO cancelarCita(Long citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con ID: " + citaId));

        cita.setEstado(EstadoCita.CANCELADA);
        return mapearACitaResponse(citaRepository.save(cita));
    }

    /**
     * Devuelve las citas asignadas a un trabajador concreto, ordenadas por fecha.
     * Lo usa el calendario del panel de administración.
     */
    public List<CitaResponseDTO> getCitasDelTrabajador(Long trabajadorId) {
        return citaRepository.findByTrabajadorIdOrderByFechaHoraAsc(trabajadorId)
                .stream()
                .map(this::mapearACitaResponse)
                .toList();
    }

    /** Devuelve todas las citas del sistema (para el calendario general del admin). */
    public List<CitaResponseDTO> getAllCitas() {
        return citaRepository.findAll()
                .stream()
                .map(this::mapearACitaResponse)
                .toList();
    }

    /**
     * Devuelve las citas de un usuario buscando por su ID, email y teléfono.
     * Así si alguien pidió una cita de forma anónima con su teléfono y luego se registra,
     * esa cita también le aparecerá en "Mis citas" al iniciar sesión.
     */
    @Transactional(readOnly = true)
    public List<CitaResponseDTO> getCitasDelUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        String email    = usuario != null ? usuario.getEmail()    : null;
        String telefono = usuario != null ? usuario.getTelefono() : null;

        return citaRepository.findCitasPorUsuarioEmailOTelefono(usuarioId, email, telefono)
                .stream()
                .map(this::mapearACitaResponse)
                .toList();
    }

    /**
     * Crea una cita para un usuario ya registrado.
     * Si incluye inmuebleId es una visita a un inmueble concreto,
     * si no lo incluye (null) es una cita genérica en la oficina.
     * Después de guardar crea una tarea en el dashboard para que el equipo la vea.
     */
    public CitaResponseDTO crearCitaDeUsuario(SolicitudCitaUsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + dto.getUsuarioId()));

        // El inmueble es opcional: null = cita en oficina
        Inmueble inmueble = null;
        if (dto.getInmuebleId() != null) {
            inmueble = inmuebleRepository.findById(dto.getInmuebleId()).orElse(null);
        }

        Cita cita = Cita.builder()
                .fechaHora(dto.getFechaHora())
                .motivo(dto.getMotivo())
                .estado(EstadoCita.PENDIENTE)
                .usuario(usuario)
                .inmueble(inmueble)
                .build();

        Cita citaGuardada = citaRepository.save(cita);

        // Creamos la tarea DESPUÉS de guardar para tener el ID real de la cita
        crearTareaParaCita(citaGuardada, usuario, inmueble);

        return mapearACitaResponse(citaGuardada);
    }


    // =========================================================================
    // MÉTODOS PRIVADOS
    // =========================================================================

    /**
     * Crea una tarea en el dashboard para que los trabajadores vean la nueva cita.
     * La prioridad es ALTA porque hay que confirmarla pronto.
     */
    private void crearTareaParaCita(Cita cita, Usuario cliente, Inmueble inmueble) {
        String formatoFecha = cita.getFechaHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        StringBuilder desc = new StringBuilder();
        desc.append("Fecha solicitada: ").append(formatoFecha).append("\n");
        desc.append("Teléfono: ").append(cliente.getTelefono()).append("\n");

        if (inmueble != null) {
            desc.append("Inmueble: ").append(inmueble.getDireccion()).append("\n");
        } else {
            desc.append("Tipo: Cita genérica en la oficina\n");
        }

        if (cita.getMotivo() != null && !cita.getMotivo().isBlank()) {
            desc.append("Mensaje del cliente: ").append(cita.getMotivo());
        }

        Tarea tarea = Tarea.builder()
                .titulo("📅 Nueva cita: " + cliente.getNombre())
                .descripcion(desc.toString())
                .fecha(LocalDate.now().plusDays(1))
                .prioridad("ALTA")
                .enlace("/citas")
                .etiquetaEnlace("Ver citas")
                .fechaCreacion(LocalDate.now())
                .build();

        tareaRepository.save(tarea);
    }

    /**
     * Convierte una entidad Cita en el DTO que se devuelve al frontend.
     * Los DTOs (Data Transfer Objects) son clases que solo tienen los campos
     * que necesita el cliente, sin exponer toda la entidad de BD.
     *
     * Hacemos comprobaciones de null por si algún campo no está relleno
     * (por ejemplo, una cita sin trabajador asignado todavía).
     */
    private CitaResponseDTO mapearACitaResponse(Cita cita) {
        // Datos del cliente (siempre debería haber uno)
        String nombreCliente   = "Desconocido";
        String telefonoCliente = "Sin teléfono";
        if (cita.getUsuario() != null) {
            nombreCliente   = cita.getUsuario().getNombre();
            telefonoCliente = cita.getUsuario().getTelefono();
        }

        // El trabajador puede ser null si nadie ha aceptado la cita todavía
        String nombreTrabajador = null;
        if (cita.getTrabajador() != null && cita.getTrabajador().getUsuario() != null) {
            nombreTrabajador = cita.getTrabajador().getUsuario().getNombre();
        }

        // El inmueble puede ser null si es una cita genérica en oficina
        String direccionInmueble = null;
        Long   inmuebleId        = null;
        String inmuebleTitulo    = null;
        if (cita.getInmueble() != null) {
            direccionInmueble = cita.getInmueble().getDireccion();
            inmuebleId        = cita.getInmueble().getId();
            inmuebleTitulo    = cita.getInmueble().getTitulo();
        }

        return CitaResponseDTO.builder()
                .id(cita.getId())
                .nombreCliente(nombreCliente)
                .telefonoCliente(telefonoCliente)
                .fechaHora(cita.getFechaHora())
                .motivo(cita.getMotivo())
                .estado(cita.getEstado() != null ? cita.getEstado().name() : "PENDIENTE")
                .nombreTrabajador(nombreTrabajador)
                .direccionInmueble(direccionInmueble)
                .inmuebleId(inmuebleId)
                .inmuebleTitulo(inmuebleTitulo)
                .build();
    }
}
