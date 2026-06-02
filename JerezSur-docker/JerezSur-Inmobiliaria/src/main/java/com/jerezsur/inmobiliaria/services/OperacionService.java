package com.jerezsur.inmobiliaria.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jerezsur.inmobiliaria.dto.CrearOperacionDTO;
import com.jerezsur.inmobiliaria.dto.OperacionResponseDTO;
import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Contrato;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.Interesado;
import com.jerezsur.inmobiliaria.models.Operacion;
import com.jerezsur.inmobiliaria.models.OperacionAlquiler;
import com.jerezsur.inmobiliaria.models.OperacionVenta;
import com.jerezsur.inmobiliaria.models.enums.EstadoOperacion;
import com.jerezsur.inmobiliaria.models.enums.RolParticipante;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.InteresadoRepository;
import com.jerezsur.inmobiliaria.repositories.OperacionRepository;

// Servicio de operaciones inmobiliarias: gestiona el ciclo de vida de cada venta o alquiler.
// Una operación vincula un inmueble con un interesado y pasa por varios estados hasta su cierre.
@Service
public class OperacionService {

    @Autowired
    private OperacionRepository operacionRepository;

    @Autowired
    private InmuebleRepository inmuebleRepository;

    @Autowired
    private InteresadoRepository interesadoRepository;

    // ------------------------------------------------------------------
    // CREACIÓN DESDE DTO
    // ------------------------------------------------------------------

    @Transactional
    public OperacionResponseDTO crearDesdeDTO(CrearOperacionDTO dto) {
        Inmueble inmueble = inmuebleRepository.findById(dto.getInmuebleId())
                .orElseThrow(() -> new ResourceNotFoundException("Inmueble no encontrado con ID: " + dto.getInmuebleId()));

        Operacion operacion;
        if ("VENTA".equalsIgnoreCase(dto.getCategoria_operacion())) {
            OperacionVenta venta = new OperacionVenta();
            venta.setDepositoArras(dto.getDepositoArras());
            venta.setFechaLimiteEscritura(dto.getFechaLimiteEscritura());
            venta.setIncluyeMobiliario(dto.getIncluyeMobiliario());
            venta.setTipo(TipoOperacion.VENTA);
            operacion = venta;
        } else if ("ALQUILER".equalsIgnoreCase(dto.getCategoria_operacion())) {
            OperacionAlquiler alquiler = new OperacionAlquiler();
            alquiler.setFianza(dto.getFianza());
            alquiler.setDuracionMeses(dto.getDuracionMeses());
            alquiler.setAdmiteMascotas(dto.getAdmiteMascotas());
            alquiler.setTipo(TipoOperacion.ALQUILER);
            operacion = alquiler;
        } else {
            throw new BusinessValidationException("Categoría de operación no válida: " + dto.getCategoria_operacion());
        }

        operacion.setInmueble(inmueble);
        operacion.setPrecioAcordado(dto.getPrecioAcordado());

        if (dto.getInteresadosRol() == null || dto.getInteresadosRol().isEmpty()) {
            throw new BusinessValidationException("Debe asignar al menos un interesado a la operación.");
        }

        Map<Interesado, RolParticipante> compradoresRol = new HashMap<>();
        for (Map.Entry<Long, RolParticipante> entry : dto.getInteresadosRol().entrySet()) {
            Interesado interesado = interesadoRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Interesado no encontrado con ID: " + entry.getKey()));
            compradoresRol.put(interesado, entry.getValue());
        }
        operacion.setCompradoresRol(compradoresRol);

        validarDatosOperacion(operacion);
        Operacion saved = operacionRepository.save(operacion);
        return toDTO(saved);
    }

    // ------------------------------------------------------------------
    // CONSULTAS
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public OperacionResponseDTO buscarDTOPorId(Long id) {
        Operacion op = operacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operación no encontrada con ID: " + id));
        return toDTO(op);
    }

    @Transactional(readOnly = true)
    public Operacion buscarPorId(Long id) {
        return operacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operación no encontrada con ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<OperacionResponseDTO> listarTodasDTO() {
        return operacionRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OperacionResponseDTO> listarPorInmuebleDTO(Long inmuebleId) {
        return operacionRepository.findByInmuebleId(inmuebleId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // ACTUALIZACIÓN Y ELIMINACIÓN
    // ------------------------------------------------------------------

    @Transactional
    public OperacionResponseDTO actualizarEstado(Long id, EstadoOperacion estado) {
        Operacion op = operacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operación no encontrada con ID: " + id));
        op.setEstadoActual(estado);
        return toDTO(operacionRepository.save(op));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!operacionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Operación no encontrada con ID: " + id);
        }
        operacionRepository.deleteById(id);
    }

    // ------------------------------------------------------------------
    // CONVERSIÓN ENTIDAD → DTO  (llamar siempre dentro de @Transactional)
    // ------------------------------------------------------------------

    public OperacionResponseDTO toDTO(Operacion op) {
        if (op == null) return null;

        OperacionResponseDTO dto = new OperacionResponseDTO();
        dto.setId(op.getId());
        dto.setEstadoActual(op.getEstadoActual());
        dto.setPrecioAcordado(op.getPrecioAcordado());
        dto.setFechaRegistro(op.getFechaRegistro());
        dto.setFechaUltimaActualizacion(op.getFechaUltimaActualizacion());

        if (op instanceof OperacionVenta venta) {
            dto.setCategoria_operacion("VENTA");
            dto.setDepositoArras(venta.getDepositoArras());
            dto.setFechaLimiteEscritura(venta.getFechaLimiteEscritura());
            dto.setIncluyeMobiliario(venta.getIncluyeMobiliario());
        } else if (op instanceof OperacionAlquiler alquiler) {
            dto.setCategoria_operacion("ALQUILER");
            dto.setFianza(alquiler.getFianza());
            dto.setDuracionMeses(alquiler.getDuracionMeses());
            dto.setAdmiteMascotas(alquiler.getAdmiteMascotas());
        }

        if (op.getInmueble() != null) {
            Inmueble inm = op.getInmueble();
            dto.setInmueble(OperacionResponseDTO.InmuebleBasico.builder()
                    .id(inm.getId())
                    .referencia(inm.getReferencia())
                    .direccion(inm.getDireccion())
                    .ciudad(inm.getCiudad())
                    .precio(inm.getPrecio())
                    .build());
        }

        Map<String, String> roles = new HashMap<>();
        if (op.getCompradoresRol() != null) {
            for (Map.Entry<Interesado, RolParticipante> e : op.getCompradoresRol().entrySet()) {
                roles.put(String.valueOf(e.getKey().getId()), e.getValue().name());
            }
        }
        dto.setCompradoresRol(roles);

        List<OperacionResponseDTO.ContratoBasico> contratos = new ArrayList<>();
        if (op.getDocumentos() != null) {
            for (Contrato c : op.getDocumentos()) {
                contratos.add(OperacionResponseDTO.ContratoBasico.builder()
                        .id(c.getId())
                        .modelo(c.getModelo() != null ? c.getModelo().name() : null)
                        .estado(c.getEstado() != null ? c.getEstado().name() : null)
                        .fechaFirma(c.getFechaFirma() != null ? c.getFechaFirma().toString() : null)
                        .urlDocumentoPdf(c.getUrlDocumentoPdf())
                        .build());
            }
        }
        dto.setDocumentos(contratos);

        return dto;
    }

    // ------------------------------------------------------------------
    // VALIDACIÓN
    // ------------------------------------------------------------------

    private void validarDatosOperacion(Operacion op) {
        if (op.getInmueble() == null) {
            throw new BusinessValidationException("El inmueble es obligatorio para abrir una operación.");
        }

        if (op instanceof OperacionAlquiler alq) {
            if (alq.getFianza() == null) {
                throw new BusinessValidationException("La fianza es obligatoria en operaciones de alquiler.");
            }
        } else if (op instanceof OperacionVenta vta) {
            if (vta.getDepositoArras() == null) {
                throw new BusinessValidationException("El depósito de arras es obligatorio en operaciones de venta.");
            }
        }

        if (op.getCompradoresRol() == null || op.getCompradoresRol().isEmpty()) {
            throw new BusinessValidationException("Debe asignar al menos un interesado a la operación.");
        }
    }
}
