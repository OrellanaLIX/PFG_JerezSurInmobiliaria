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
// Cuando alguien rellena el formulario público de cita, este servicio:
//   1. Busca o crea un usuario preregistrado con su teléfono
//   2. Lo registra como Interesado si no lo era ya
//   3. Crea la cita en estado PENDIENTE (sin trabajador asignado)
//   4. Crea una tarea en el dashboard para que un trabajador la coja y la acepte
@Service
@RequiredArgsConstructor
@Transactional
public class CitaPublicaService {

    private final UsuarioRepository usuarioRepository;
    private final InteresadoRepository interesadoRepository;
    private final InmuebleRepository inmuebleRepository;
    private final CitaRepository citaRepository;
    private final TareaRepository tareaRepository;
    private final TrabajadorRepository trabajadorRepository;

    public CitaResponseDTO solicitarCitaAnonima(SolicitudCitaPublicaDTO dto) {
        // 1. Buscamos al usuario por teléfono — si ya existe lo reutilizamos para no duplicar
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
                .estado(EstadoCita.PENDIENTE_ASIGNACION)
                .usuario(usuario)
                .inmueble(inmueble)
                .build();

        Cita citaGuardada = citaRepository.save(cita);

        // 5️⃣ Crear tarea GLOBAL (sin trabajador) para que cualquiera la coja
        crearTareaGlobalParaAceptarCita(citaGuardada, usuario, inmueble);

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
        crearTareaGlobalParaAceptarCita(citaGuardada, usuario, inmueble);
        return mapearACitaResponse(citaGuardada);
    }

    // ============================================================
    // MÉTODOS PRIVADOS
    // ============================================================

    // Crea un usuario mínimo con los datos del formulario de cita anónima.
    // La cuenta no está activada porque aún no tiene contraseña — si decide registrarse
    // después, el sistema lo detectará y vinculará las citas por teléfono.
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
                .fecha(LocalDate.now().plusDays(1))
                .prioridad("ALTA")
                .enlace("/citas")
                .etiquetaEnlace("Ver citas")
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