package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.dto.CitaAdminDTO;
import com.jerezsur.inmobiliaria.dto.CitaResponseDTO;
import com.jerezsur.inmobiliaria.dto.SolicitudCitaPublicaDTO;
import com.jerezsur.inmobiliaria.models.*;
import com.jerezsur.inmobiliaria.models.enums.*;
import com.jerezsur.inmobiliaria.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

// Servicio para citas de usuarios anónimos (sin cuenta registrada).
// Los datos del solicitante (nombre, teléfono, email) se guardan directamente
// en la cita — no se crea ningún usuario. Si después se registra con el mismo
// email o teléfono, "Mis citas" vinculará automáticamente su historial.
@Service
@RequiredArgsConstructor
@Transactional
public class CitaPublicaService {

    private final UsuarioRepository usuarioRepository;
    private final InmuebleRepository inmuebleRepository;
    private final CitaRepository citaRepository;
    private final TareaRepository tareaRepository;
    private final TrabajadorRepository trabajadorRepository;

    public CitaResponseDTO solicitarCitaAnonima(SolicitudCitaPublicaDTO dto) {
        Inmueble inmueble = null;
        if (dto.getInmuebleId() != null) {
            inmueble = inmuebleRepository.findById(dto.getInmuebleId()).orElse(null);
        }

        // No se crea ningún usuario: los datos del solicitante van directamente en la cita.
        // Si después se registra con el mismo email o teléfono, "Mis citas" los vinculará.
        Cita cita = Cita.builder()
                .fechaHora(dto.getFechaHora())
                .motivo(dto.getMotivo())
                .estado(EstadoCita.PENDIENTE_ASIGNACION)
                .nombreAnonimo(dto.getNombre())
                .telefonoAnonimo(dto.getTelefono())
                .emailAnonimo(dto.getEmail())
                .inmueble(inmueble)
                .build();

        Cita citaGuardada = citaRepository.save(cita);
        crearTareaGlobalParaAceptarCita(citaGuardada, inmueble);
        return mapearACitaResponse(citaGuardada);
    }

    /**
     * Crea una cita desde el panel de administración.
     * Siempre usa el nombre proporcionado (no reutiliza el nombre de un usuario
     * existente buscado por teléfono), evitando el bug del "usuario hola".
     * Si se indica trabajadorId, la cita queda CONFIRMADA directamente.
     */
    public CitaResponseDTO solicitarCitaAdmin(CitaAdminDTO dto) {
        // Buscar por teléfono y ACTUALIZAR su nombre, o crear usuario nuevo
        Usuario usuario;
        if (dto.getTelefono() != null && !dto.getTelefono().isBlank()) {
            usuario = usuarioRepository.findByTelefono(dto.getTelefono())
                    .map(u -> {
                        u.setNombre(dto.getNombre());
                        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
                            u.setEmail(dto.getEmail());
                        }
                        return usuarioRepository.save(u);
                    })
                    .orElseGet(() -> {
                        Usuario nuevo = Usuario.builder()
                                .telefono(dto.getTelefono())
                                .nombre(dto.getNombre())
                                .email(dto.getEmail())
                                .cuentaActivada(false)
                                .origen(OrigenUsuario.WEB_CITA)
                                .role(Role.ROLE_NOROL)
                                .verified(false)
                                .build();
                        return usuarioRepository.save(nuevo);
                    });
        } else {
            Usuario nuevo = Usuario.builder()
                    .nombre(dto.getNombre())
                    .email(dto.getEmail())
                    .cuentaActivada(false)
                    .origen(OrigenUsuario.WEB_CITA)
                    .role(Role.ROLE_NOROL)
                    .verified(false)
                    .build();
            usuario = usuarioRepository.save(nuevo);
        }

        Inmueble inmueble = null;
        if (dto.getInmuebleId() != null) {
            inmueble = inmuebleRepository.findById(dto.getInmuebleId()).orElse(null);
        }

        Trabajador trabajador = null;
        if (dto.getTrabajadorId() != null) {
            trabajador = trabajadorRepository.findById(dto.getTrabajadorId()).orElse(null);
        }

        EstadoCita estado = (trabajador != null) ? EstadoCita.CONFIRMADA : EstadoCita.PENDIENTE_ASIGNACION;

        Cita cita = Cita.builder()
                .fechaHora(dto.getFechaHora())
                .motivo(dto.getMotivo())
                .estado(estado)
                .usuario(usuario)
                .inmueble(inmueble)
                .trabajador(trabajador)
                .build();

        Cita citaGuardada = citaRepository.save(cita);
        crearTareaGlobalParaAceptarCita(citaGuardada, inmueble);
        return mapearACitaResponse(citaGuardada);
    }

    // ============================================================
    // MÉTODOS PRIVADOS
    // ============================================================

    private void crearTareaGlobalParaAceptarCita(Cita cita, Inmueble inmueble) {
        String formatoFecha = cita.getFechaHora().format(
                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
        );

        String nombreMostrar = cita.getUsuario() != null
                ? cita.getUsuario().getNombre()
                : cita.getNombreAnonimo();

        String titulo = "🆕 Nueva solicitud de cita: " + nombreMostrar;

        String telefonoMostrar = cita.getUsuario() != null
                ? cita.getUsuario().getTelefono()
                : cita.getTelefonoAnonimo();

        StringBuilder descripcion = new StringBuilder();
        descripcion.append("Fecha solicitada: ").append(formatoFecha).append("\n");
        descripcion.append("Teléfono: ").append(telefonoMostrar).append("\n");

        if (inmueble != null) {
            descripcion.append("Inmueble: ").append(inmueble.getDireccion()).append("\n");
        } else {
            descripcion.append("Tipo: Cita genérica en oficinas\n");
        }

        if (cita.getMotivo() != null && !cita.getMotivo().isBlank()) {
            descripcion.append("Mensaje: ").append(cita.getMotivo());
        }

        Tarea tarea = Tarea.builder()
                .titulo(titulo)
                .descripcion(descripcion.toString())
                .fecha(LocalDate.now().plusDays(1))
                .prioridad("ALTA")
                .enlace("/citas")
                .etiquetaEnlace("Ver citas")
                .fechaCreacion(LocalDate.now())
                .build();

        tareaRepository.save(tarea);
    }

    private CitaResponseDTO mapearACitaResponse(Cita cita) {
        String nombreCliente   = cita.getUsuario() != null ? cita.getUsuario().getNombre()   : cita.getNombreAnonimo();
        String telefonoCliente = cita.getUsuario() != null ? cita.getUsuario().getTelefono() : cita.getTelefonoAnonimo();

        return CitaResponseDTO.builder()
                .id(cita.getId())
                .nombreCliente(nombreCliente)
                .telefonoCliente(telefonoCliente)
                .fechaHora(cita.getFechaHora())
                .motivo(cita.getMotivo())
                .estado(cita.getEstado().name())
                .nombreTrabajador(
                        cita.getTrabajador() != null
                                ? cita.getTrabajador().getUsuario().getNombre()
                                : null
                )
                .direccionInmueble(
                        cita.getInmueble() != null
                                ? cita.getInmueble().getDireccion()
                                : null
                )
                .inmuebleId(cita.getInmueble() != null ? cita.getInmueble().getId() : null)
                .build();
    }
}