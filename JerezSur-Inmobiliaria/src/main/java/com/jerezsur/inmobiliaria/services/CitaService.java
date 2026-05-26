package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.dto.CitaResponseDTO;
import com.jerezsur.inmobiliaria.models.*;
import com.jerezsur.inmobiliaria.models.enums.EstadoCita;
import com.jerezsur.inmobiliaria.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CitaService {

    private final CitaRepository citaRepository;
    private final TrabajadorRepository trabajadorRepository;

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

    // ============================================================
    // PRIVADOS
    // ============================================================
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
        if (cita.getInmueble() != null) {
            direccionInmueble = cita.getInmueble().getDireccion();
            inmuebleId = cita.getInmueble().getId();
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
                .build();
    }
}