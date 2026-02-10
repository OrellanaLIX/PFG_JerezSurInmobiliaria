package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Cita;
import com.jerezsur.inmobiliaria.repositories.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CitaService {

    //INYECCION DE DEPENDENCIAS
    @Autowired
    private CitaRepository citaRepository;

    //------------------------------------------------------------------
    //CRUD BASICO
    //------------------------------------------------------------------

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public List<Cita> listarTodos() {
        // Devuelve lista llena o []
        return citaRepository.findAll();
    }

    // BUSCAR INDIVIDUAL
    @Transactional(readOnly = true)
    public Cita buscarPorId(Long id) {
        // Si el ID no existe, es un 404. Usamos elsethrow.
        return citaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La cita con ID " + id + " no existe."));
    }

    //GUARDAR
    @Transactional
    public Cita guardar(Cita cita) {
        validarCita(cita); // Extraemos las validaciones a un método privado para limpiar el código
        return citaRepository.save(cita);
    }

    //ELIMINAR
    @Transactional
    public void eliminar(Long id) {
        // Antes de borrar, comprobamos si existe para lanzar el 404 si falla
        if (!citaRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: La cita con ID " + id + " no existe.");
        }
        citaRepository.deleteById(id);
    }

    //------------------------------------------------------------------
    // METODOS DE APOYO PARA VALIDACIONES DE NEGOCIO
    //------------------------------------------------------------------

    // Comprobar tiempo correcto e interesado existente
    private void validarCita(Cita cita) {
        if (cita.getFechaHora().isBefore(LocalDateTime.now())) {
            throw new BusinessValidationException("No se puede programar una cita en el pasado.");
        }
        if (cita.getInteresado() == null) {
            throw new BusinessValidationException("Toda cita debe tener un interesado asignado.");
        }
    }
}