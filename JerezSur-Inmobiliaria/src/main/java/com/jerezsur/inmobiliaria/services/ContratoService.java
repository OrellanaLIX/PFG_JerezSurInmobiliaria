package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Contrato;
import com.jerezsur.inmobiliaria.models.Contrato_Interesado;
import com.jerezsur.inmobiliaria.models.Interesado;
import com.jerezsur.inmobiliaria.models.Contrato_Vendedor;
import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.models.enums.RolParticipante;
import com.jerezsur.inmobiliaria.repositories.ContratoRepository;
import com.jerezsur.inmobiliaria.repositories.Contrato_InteresadoRepository;
import com.jerezsur.inmobiliaria.repositories.Contrato_VendedorRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ContratoService {

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private ContratoRepository contratoRepository;

    @Autowired
    private Contrato_InteresadoRepository ciRepository;

    @Autowired
    private Contrato_VendedorRepository cvRepository;

    // ------------------------------------------------------------------
    // CRUD BASICO
    // ------------------------------------------------------------------

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public List<Contrato> listarTodos() {
        return contratoRepository.findAll();
    }

    // BUSCAR INDIVIDUAL
    @Transactional(readOnly = true)
    public Contrato buscarPorId(Long id) {
        return contratoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El contrato con ID " + id + " no existe."));
    }

    // GUARDAR
    @Transactional
    public Contrato guardar(Contrato contrato) {
        validarContrato(contrato);
        // Aquí podrías añadir:
        // contrato.getInmueble().setEstado(EstadoInmueble.VENDIDO);
        return contratoRepository.save(contrato);
    }

    // ELIMINAR
    @Transactional
    public void eliminar(Long id) {
        if (!contratoRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El contrato con ID " + id + " no existe.");
        }
        contratoRepository.deleteById(id);
    }

    // LOGICA DE NEGOCIO ADICIONAL (CONTRATO_VENDEDOR)
    @Transactional
    public void registrarFirmaVendedor(Contrato contrato, Vendedor vendedor, String calidad) {
        Contrato_Vendedor firma = Contrato_Vendedor.builder()
                .contrato(contrato)
                .vendedor(vendedor)
                .calidadFirma(calidad)
                .firmoEnRepresentacion(calidad.equalsIgnoreCase("Apoderado"))
                .build();
        cvRepository.save(firma);
    }

    @Transactional
    public void registrarFirmaInteresado(Contrato contrato, Interesado interesado, RolParticipante rol) {
        Contrato_Interesado firma = Contrato_Interesado.builder()
                .contrato(contrato)
                .comprador(interesado)
                .rol(rol)
                .build();
        ciRepository.save(firma);
    }

    // ------------------------------------------------------------------
    // METODOS DE APOYO PARA VALIDACIONES DE NEGOCIO
    // ------------------------------------------------------------------

    private void validarContrato(Contrato contrato) {
        // Validación: Fecha de firma no puede ser futura (usualmente se firma hoy o
        // antes)
        if (contrato.getFechaFirma() != null && contrato.getFechaFirma().isAfter(LocalDate.now())) {
            throw new BusinessValidationException("La fecha de firma no puede ser una fecha futura.");
        }

        // Validación: El inmueble es obligatorio
        if (contrato.getInmueble() == null) {
            throw new BusinessValidationException("Un contrato debe estar vinculado a un inmueble.");
        }

        // Validación: Precio final coherente
        if (contrato.getPrecioFinal() == null || contrato.getPrecioFinal().doubleValue() <= 0) {
            throw new BusinessValidationException("El precio final del contrato debe ser mayor que cero.");
        }
    }
}