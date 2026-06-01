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
     * Un trabajador acepta una cita pendiente de asignación.
     */
    public CitaResponseDTO aceptarCita(Long citaId, Long trabajadorId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (cita.getEstado() != EstadoCita.PENDIENTE) {
            throw new RuntimeException(
                    "Esta cita ya fue aceptada por otro trabajador o está en otro estado"
            );
        }

        Trabajador trabajador = trabajadorRepository.findById(trabajadorId)
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado"));

        // Asignar trabajador y cambiar estado
        cita.setTrabajador(trabajador);
        cita.setEstado(EstadoCita.CONFIRMADA);
        Cita actualizada = citaRepository.save(cita);

        // TODO: Enviar notificación al cliente (SMS, email, WhatsApp...)s

        return mapearACitaResponse(actualizada);
    }

    public CitaResponseDTO completarCita(Long citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        cita.setEstado(EstadoCita.REALIZADA);
        return mapearACitaResponse(citaRepository.save(cita));
    }

    public CitaResponseDTO cancelarCita(Long citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        cita.setEstado(EstadoCita.CANCELADA);
        return mapearACitaResponse(citaRepository.save(cita));
    }

    public List<CitaResponseDTO> getCitasDelTrabajador(Long trabajadorId) {
        return citaRepository.findByTrabajadorIdOrderByFechaHoraAsc(trabajadorId)
                .stream()
                .map(this::mapearACitaResponse)
                .toList();
    }

    public List<CitaResponseDTO> getAllCitas() {
        return citaRepository.findAll()
                .stream()
                .map(this::mapearACitaResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CitaResponseDTO> getCitasDelUsuario(Long usuarioId) {
        return citaRepository.findByUsuarioIdOrderByFechaHoraDesc(usuarioId)
                .stream()
                .map(this::mapearACitaResponse)
                .toList();
    }

    public CitaResponseDTO crearCitaDeUsuario(SolicitudCitaUsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

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
        crearTareaParaCita(citaGuardada, usuario, inmueble);
        return mapearACitaResponse(citaGuardada);
    }

    // ============================================================
    // PRIVADOS
    // ============================================================

    private void crearTareaParaCita(Cita cita, Usuario cliente, Inmueble inmueble) {
        String formatoFecha = cita.getFechaHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        StringBuilder desc = new StringBuilder();
        desc.append("Fecha solicitada: ").append(formatoFecha).append("\n");
        desc.append("Teléfono: ").append(cliente.getTelefono()).append("\n");
        if (inmueble != null) {
            desc.append("Inmueble: ").append(inmueble.getDireccion()).append("\n");
        } else {
            desc.append("Tipo: Cita genérica en oficinas\n");
        }
        if (cita.getMotivo() != null && !cita.getMotivo().isBlank()) {
            desc.append("Mensaje: ").append(cita.getMotivo());
        }
        Tarea tarea = Tarea.builder()
                .titulo("🆕 Nueva cita de usuario: " + cliente.getNombre())
                .descripcion(desc.toString())
                .fecha(LocalDate.now().plusDays(1))
                .prioridad("ALTA")
                .enlace("/dashboard/citas/" + cita.getId() + "/aceptar")
                .etiquetaEnlace("Aceptar cita")
                .fechaCreacion(LocalDate.now())
                .build();
        tareaRepository.save(tarea);
    }

    private CitaResponseDTO mapearACitaResponse(Cita cita) {
        String nombreCliente = "Desconocido";
        String telefonoCliente = "Sin teléfono";
        if (cita.getUsuario() != null) {
            nombreCliente = cita.getUsuario().getNombre();
            telefonoCliente = cita.getUsuario().getTelefono();
        }

        String nombreTrabajador = null;
        if (cita.getTrabajador() != null && cita.getTrabajador().getUsuario() != null) {
            nombreTrabajador = cita.getTrabajador().getUsuario().getNombre();
        }

        String direccionInmueble = null;
        Long inmuebleId = null;
        String inmuebleTitulo = null;
        if (cita.getInmueble() != null) {
            direccionInmueble = cita.getInmueble().getDireccion();
            inmuebleId = cita.getInmueble().getId();
            inmuebleTitulo = cita.getInmueble().getTitulo();
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