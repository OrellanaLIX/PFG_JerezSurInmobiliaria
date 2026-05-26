package com.jerezsur.inmobiliaria.services;

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

@Service
@RequiredArgsConstructor
@Transactional
public class CitaPublicaService {

    private final UsuarioRepository usuarioRepository;
    private final InteresadoRepository interesadoRepository;
    private final InmuebleRepository inmuebleRepository;
    private final CitaRepository citaRepository;
    private final TareaRepository tareaRepository;

    public CitaResponseDTO solicitarCitaAnonima(SolicitudCitaPublicaDTO dto) {
        // 1️⃣ Buscar o crear Usuario preregistrado por teléfono
        Usuario usuario = usuarioRepository.findByTelefono(dto.getTelefono())
                .orElseGet(() -> crearUsuarioPreregistrado(dto));

        // 2️⃣ Si no es Interesado todavía, lo creamos
        if (usuario.getInteresado() == null) {
            Interesado interesado = Interesado.builder()
                    .usuario(usuario)
                    .build();
            interesadoRepository.save(interesado);
        }

        // 3️⃣ Buscar inmueble (si se especificó)
        Inmueble inmueble = null;
        if (dto.getInmuebleId() != null) {
            inmueble = inmuebleRepository.findById(dto.getInmuebleId())
                    .orElse(null);
        }

        // 4️⃣ Crear cita SIN trabajador asignado
        Cita cita = Cita.builder()
                .fechaHora(dto.getFechaHora())
                .motivo(dto.getMotivo())
                .estado(EstadoCita.PENDIENTE)
                .usuario(usuario)
                .inmueble(inmueble)
                .build();

        Cita citaGuardada = citaRepository.save(cita);

        // 5️⃣ Crear tarea GLOBAL (sin trabajador) para que cualquiera la coja
        crearTareaGlobalParaAceptarCita(citaGuardada, usuario, inmueble);

        return mapearACitaResponse(citaGuardada);
    }

    // ============================================================
    // MÉTODOS PRIVADOS
    // ============================================================

    private Usuario crearUsuarioPreregistrado(SolicitudCitaPublicaDTO dto) {
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
    }

    private void crearTareaGlobalParaAceptarCita(Cita cita, Usuario cliente, Inmueble inmueble) {
        String formatoFecha = cita.getFechaHora().format(
                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
        );

        String titulo = "🆕 Nueva solicitud de cita: " + cliente.getNombre();

        StringBuilder descripcion = new StringBuilder();
        descripcion.append("Fecha solicitada: ").append(formatoFecha).append("\n");
        descripcion.append("Teléfono: ").append(cliente.getTelefono()).append("\n");

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
                .fecha(LocalDate.now().plusDays(1)) // fecha de vencimiento al día siguiente
                .prioridad("ALTA")
                .enlace("/dashboard/citas/" + cita.getId() + "/aceptar")
                .etiquetaEnlace("Aceptar cita")
                .fechaCreacion(LocalDate.now())
                .build();

        tareaRepository.save(tarea);
    }

    private CitaResponseDTO mapearACitaResponse(Cita cita) {
        return CitaResponseDTO.builder()
                .id(cita.getId())
                .nombreCliente(cita.getUsuario().getNombre())
                .telefonoCliente(cita.getUsuario().getTelefono())
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