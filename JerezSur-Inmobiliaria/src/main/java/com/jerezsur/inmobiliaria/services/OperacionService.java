package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.*;
import com.jerezsur.inmobiliaria.repositories.OperacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OperacionService {

    @Autowired
    private OperacionRepository operacionRepository;

    @Transactional
    public Operacion crearOperacion(Operacion operacion) {
        // 1. Validar reglas de negocio según el tipo
        validarDatosOperacion(operacion);

        // 2. Vincular relaciones bidireccionales de las tablas intermedias
        if (operacion.getVendedores() != null) {
            operacion.getVendedores().forEach(v -> v.setOperacion(operacion));
        }
        if (operacion.getCompradores() != null) {
            operacion.getCompradores().forEach(c -> c.setOperacion(operacion));
        }

        return operacionRepository.save(operacion);
    }

    @Transactional(readOnly = true)
    public Operacion buscarPorId(Long id) {
        return operacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operación no encontrada con ID: " + id));
    }

    private void validarDatosOperacion(Operacion op) {
        if (op.getInmueble() == null)
            throw new BusinessValidationException("El inmueble es obligatorio.");

        if (op instanceof OperacionAlquiler alq) {
            if (alq.getFianza() == null)
                throw new BusinessValidationException("La fianza es obligatoria en alquileres.");
        } else if (op instanceof OperacionVenta vta) {
            if (vta.getDepositoArras() == null)
                throw new BusinessValidationException("El depósito de arras es obligatorio en ventas.");
        }
    }
}