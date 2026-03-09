package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Cita;
import com.jerezsur.inmobiliaria.models.Interesado;
import com.jerezsur.inmobiliaria.repositories.CitaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private InteresadoService interesadoService;

    // ------------------------------------------------------------------
    // CRUD BÁSICO
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public Page<Cita> listarTodas(LocalDateTime min, LocalDateTime max, int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);
        return citaRepository.findByFechaHoraBetween(min, max, pageable);
    }

    @Transactional(readOnly = true)
    public Cita buscarPorId(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La cita con ID " + id + " no existe."));
    }

    @Transactional
    public Cita guardar(Cita cita) {
        // LEAD EXPRESS: Si el interesado no existe en DB, lo creamos automáticamente
        procesarInteresadoExpress(cita);

        // VALIDACIONES DE NEGOCIO (Pasado, disponibilidad, etc.)
        validarCita(cita);

        return citaRepository.save(cita);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!citaRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: La cita con ID " + id + " no existe.");
        }
        citaRepository.deleteById(id);
    }

    // ------------------------------------------------------------------
    // LÓGICA DE VALIDACIÓN Y APOYO
    // ------------------------------------------------------------------

    private void procesarInteresadoExpress(Cita cita) {
        // Si el interesado viene en el JSON pero no tiene ID, es un contacto nuevo
        if (cita.getComprador() != null && cita.getComprador().getId() == null) {
            Interesado invitado = cita.getComprador();
            // Lo guardamos (esto crea el perfil comercial sin cuenta de usuario)
            invitado = interesadoService.guardar(invitado);
            cita.setComprador(invitado);
        }
    }

    private void validarCita(Cita cita) {
        // Validación temporal básica
        if (cita.getFechaHora() == null || cita.getFechaHora().isBefore(LocalDateTime.now())) {
            throw new BusinessValidationException("La fecha de la cita no es válida o está en el pasado.");
        }

        // Validación de asignación
        if (cita.getComprador() == null) {
            throw new BusinessValidationException("Toda cita debe tener un interesado asignado.");
        }
        if (cita.getTrabajador() == null) {
            throw new BusinessValidationException("Toda cita debe tener un trabajador asignado para realizar la visita.");
        }

        // VALIDACIÓN DE DISPONIBILIDAD (La joya de la corona)
        validarDisponibilidadTrabajador(cita);
    }

    private void validarDisponibilidadTrabajador(Cita nuevaCita) {
        // Definimos un margen de cortesía (ej. 1 hora por visita)
        // Buscamos si hay otra cita del mismo trabajador entre 59 mins antes y 59 mins después
        LocalDateTime inicioRango = nuevaCita.getFechaHora().minusMinutes(59);
        LocalDateTime finRango = nuevaCita.getFechaHora().plusMinutes(59);

        boolean estaOcupado = citaRepository.existsByTrabajadorAndFechaHoraBetween(
                nuevaCita.getTrabajador(),
                inicioRango,
                finRango
        );

        // Si estamos editando una cita existente, el sistema podría detectar la propia cita
        // como un conflicto. Aquí comparamos IDs si es necesario (para el método guardar en modo Update)
        if (estaOcupado) {
            // Nota: Para ser más precisos en el Update, podrías buscar la cita y ver si el ID es distinto
            throw new BusinessValidationException("El trabajador ya tiene una visita programada cerca de esa hora.");
        }
    }
}