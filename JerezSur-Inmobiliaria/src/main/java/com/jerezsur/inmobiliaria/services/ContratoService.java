package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.models.Contrato;
import com.jerezsur.inmobiliaria.models.Operacion;
import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.models.enums.EstadoContrato;
import com.jerezsur.inmobiliaria.models.enums.ModeloContrato;
import com.jerezsur.inmobiliaria.repositories.ContratoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ContratoService {

    @Autowired
    private ContratoRepository contratoRepository;

    @Autowired
    private OperacionService operacionService;

    // ------------------------------------------------------------------
    // GESTIÓN DE DOCUMENTACIÓN
    // ------------------------------------------------------------------

    /**
     * ASISTENTE DE GENERACIÓN: Crea un borrador de contrato vinculando la 
     * operación y el trabajador responsable. El sistema automatiza el 
     * pre-rellenado de cláusulas legales base.
     */
    @Transactional
    public Contrato generarBorrador(Long operacionId, ModeloContrato modelo, Trabajador trabajador) {
        // Recuperamos la operación para extraer datos del inmueble y partes implicadas
        Operacion op = operacionService.buscarPorId(operacionId);

        Contrato contrato = Contrato.builder()
                .operacion(op)
                .modelo(modelo)
                .trabajador(trabajador)
                .fechaFirma(LocalDate.now())
                .estado(EstadoContrato.BORRADOR)
                .clausulasEspeciales(generarClausulasEstandar(op, modelo))
                .build();

        return contratoRepository.save(contrato);
    }

    @Transactional(readOnly = true)
    public List<Contrato> listarPorOperacion(Long operacionId) {
        return contratoRepository.findByOperacionId(operacionId);
    }

    // ------------------------------------------------------------------
    // LÓGICA DE APOYO Y PLANTILLAS
    // ------------------------------------------------------------------

    /**
     * Motor de plantillas básico que devuelve el texto legal inicial 
     * dependiendo del tipo de contrato (Arras, Alquiler, etc.)
     */
    private String generarClausulasEstandar(Operacion op, ModeloContrato modelo) {
        return switch (modelo) {
            case ARRAS -> 
                "Contrato de arras penitenciales por el inmueble situado en " + op.getInmueble().getDireccion();
            case ALQUILER_VIVIENDA -> 
                "Contrato de arrendamiento sujeto a la LAU vigente...";
            default -> 
                "Documentación relativa a la operación " + op.getId();
        };
    }
}