package com.jerezsur.inmobiliaria.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Operacion;
import com.jerezsur.inmobiliaria.models.OperacionAlquiler;
import com.jerezsur.inmobiliaria.models.OperacionVenta;
import com.jerezsur.inmobiliaria.repositories.OperacionRepository;

@Service
public class OperacionService {

    @Autowired
    private OperacionRepository operacionRepository;

    // ------------------------------------------------------------------
    // GESTIÓN DE OPERACIONES (VENTAS / ALQUILERES)
    // ------------------------------------------------------------------

    /**
     * Crea una nueva operación asegurando la integridad de las relaciones
     * bidireccionales con vendedores y compradores intervinientes.
     */
    @Transactional
    public Operacion crearOperacion(Operacion operacion) {
        // VALIDACIÓN: Reglas de negocio según el tipo de operación (Venta/Alquiler)
        validarDatosOperacion(operacion);

        // VINCULACIÓN: Sincronización de tablas intermedias para persistencia correcta
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

    @Transactional(readOnly = true)
    public List<Operacion> listarPorInmueble(Long id) {
        return operacionRepository.findByInmuebleId(id);
    }

    // ------------------------------------------------------------------
    // LÓGICA DE VALIDACIÓN POLIMÓRFICA
    // ------------------------------------------------------------------

    /**
     * Aplica reglas de validación diferenciadas mediante Pattern Matching de Java
     * para asegurar que cada tipo de operación tiene sus datos críticos.
     */
    private void validarDatosOperacion(Operacion op) {
        if (op.getInmueble() == null) {
            throw new BusinessValidationException("El inmueble es obligatorio para abrir una operación.");
        }

        // Validaciones específicas por subclase
        if (op instanceof OperacionAlquiler alq) {
            if (alq.getFianza() == null) {
                throw new BusinessValidationException("La fianza es obligatoria en operaciones de alquiler.");
            }
        } else if (op instanceof OperacionVenta vta) {
            if (vta.getDepositoArras() == null) {
                throw new BusinessValidationException("El depósito de arras es obligatorio en operaciones de venta.");
            }
        }
    }
}