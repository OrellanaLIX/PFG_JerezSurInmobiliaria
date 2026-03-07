package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.models.*;
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

    /**
     * Este método es el "Asistente". El trabajador solo indica la operación y el
     * modelo.
     * El sistema rellena el resto automáticamente (Solo lectura).
     */
    @Transactional
    public Contrato generarBorrador(Long operacionId, ModeloContrato modelo, Trabajador trabajador) {
        Operacion op = operacionService.buscarPorId(operacionId);

        Contrato contrato = new Contrato();
        contrato.setOperacion(op);
        contrato.setModelo(modelo);
        contrato.setTrabajador(trabajador);
        contrato.setFechaFirma(LocalDate.now());
        contrato.setEstado(EstadoContrato.BORRADOR);

        // Aquí podrías añadir lógica para pre-rellenar cláusulas por defecto según el
        // modelo
        contrato.setClausulasEspeciales(generarClausulasEstandar(op, modelo));

        return contratoRepository.save(contrato);
    }

    @Transactional(readOnly = true)
    public List<Contrato> listarPorOperacion(Long operacionId) {
        return contratoRepository.findByOperacionId(operacionId);
    }

    private String generarClausulasEstandar(Operacion op, ModeloContrato modelo) {
        // Lógica para devolver un texto base según el tipo de contrato
        return switch (modelo) {
            case ARRAS ->
                "Contrato de arras penitenciales por el inmueble situado en " + op.getInmueble().getDireccion();
            case ALQUILER_VIVIENDA -> "Contrato de arrendamiento sujeto a la LAU vigente...";
            default -> "Documentación relativa a la operación " + op.getId();
        };
    }
}