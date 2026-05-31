package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.dto.ContratoResponseDTO;
import com.jerezsur.inmobiliaria.dto.CrearContratoDTO;
import com.jerezsur.inmobiliaria.models.Contrato;
import com.jerezsur.inmobiliaria.models.Operacion;
import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.models.enums.EstadoContrato;
import com.jerezsur.inmobiliaria.models.enums.ModeloContrato;
import com.jerezsur.inmobiliaria.repositories.ContratoRepository;
import com.jerezsur.inmobiliaria.repositories.TrabajadorRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContratoService {

    @Autowired
    private ContratoRepository contratoRepository;

    @Autowired
    private OperacionService operacionService;

    @Autowired
    private TrabajadorRepository trabajadorRepository;

    @Transactional
    public ContratoResponseDTO generarBorrador(Long operacionId, CrearContratoDTO dto) {
        Operacion op = operacionService.buscarPorId(operacionId);

        Trabajador trabajador = null;
        if (dto.getTrabajadorId() != null) {
            trabajador = trabajadorRepository.findById(dto.getTrabajadorId()).orElse(null);
        }

        ModeloContrato modelo = ModeloContrato.valueOf(dto.getModelo());
        LocalDate fechaFirma = dto.getFechaFirma() != null ? dto.getFechaFirma() : LocalDate.now();
        String clausulas = (dto.getClausulasEspeciales() != null && !dto.getClausulasEspeciales().isBlank())
                ? dto.getClausulasEspeciales()
                : generarClausulasEstandar(op, modelo);

        Contrato contrato = Contrato.builder()
                .operacion(op)
                .modelo(modelo)
                .trabajador(trabajador)
                .fechaFirma(fechaFirma)
                .estado(EstadoContrato.BORRADOR)
                .clausulasEspeciales(clausulas)
                .build();

        return toDTO(contratoRepository.save(contrato));
    }

    @Transactional(readOnly = true)
    public List<ContratoResponseDTO> listarPorOperacion(Long operacionId) {
        return contratoRepository.findByOperacionId(operacionId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ContratoResponseDTO toDTO(Contrato c) {
        return ContratoResponseDTO.builder()
                .id(c.getId())
                .modelo(c.getModelo() != null ? c.getModelo().name() : null)
                .estado(c.getEstado() != null ? c.getEstado().name() : null)
                .fechaFirma(c.getFechaFirma())
                .clausulasEspeciales(c.getClausulasEspeciales())
                .urlDocumentoPdf(c.getUrlDocumentoPdf())
                .trabajadorId(c.getTrabajador() != null ? c.getTrabajador().getId() : null)
                .build();
    }

    private String generarClausulasEstandar(Operacion op, ModeloContrato modelo) {
        return switch (modelo) {
            case ARRAS -> "Contrato de arras penitenciales por el inmueble situado en " + op.getInmueble().getDireccion();
            case ALQUILER_VIVIENDA -> "Contrato de arrendamiento sujeto a la LAU vigente.";
            default -> "Documentación relativa a la operación " + op.getId();
        };
    }
}
