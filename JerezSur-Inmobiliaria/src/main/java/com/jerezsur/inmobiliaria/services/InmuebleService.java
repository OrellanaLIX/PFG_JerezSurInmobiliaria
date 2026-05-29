package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class InmuebleService {

    @Autowired
    private InmuebleRepository inmuebleRepository;

    @Transactional(readOnly = true)
    public Page<Inmueble> buscarConFiltros(String ref, String tit, String desc, TipoOperacion op, EstadoInmueble est,
            BigDecimal pMin, BigDecimal pMax, Integer hab, Integer ban, Double sMin, String ciu, String cp,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        if (pMin != null && pMax != null && pMin.compareTo(pMax) > 0) {
            throw new BusinessValidationException("El precio mínimo no puede ser superior al máximo.");
        }

        return inmuebleRepository.busquedaFiltrada(ref, tit, desc, op, est, pMin, pMax, hab, ban, sMin, ciu, cp,
                pageable);
    }

    @Transactional(readOnly = true)
    public Inmueble buscarPorId(Long id) {
        return inmuebleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El inmueble con ID " + id + " no existe."));
    }

    @Transactional
    public Inmueble guardar(Inmueble inmueble) {
        // 1. Validaciones lógicas
        validarInmueble(inmueble);

        // 2. Flujo de Referencia Automática
        if (inmueble.getId() == null) {
            // ✅ SOLUCIÓN: Generamos un código temporal ultra corto (ej: T-a1b2) para que
            // quepa en cualquier VARCHAR
            String tempRef = "T-" + java.util.UUID.randomUUID().toString().substring(0, 4);
            inmueble.setReferencia(tempRef);

            // Guardamos el registro inicial para obtener el ID real de la BD
            inmueble = inmuebleRepository.save(inmueble);
        }

        // Generamos la referencia definitiva real (ej: CH-085)
        String referenciaDefinitiva = generarReferencia(inmueble.getTipo(), inmueble.getId());
        inmueble.setReferencia(referenciaDefinitiva);

        // 3. Guardado final
        return inmuebleRepository.save(inmueble);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!inmuebleRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El inmueble con ID " + id + " no existe.");
        }
        inmuebleRepository.deleteById(id);
    }

    // ------------------------------------------------------------------
    // VALIDACIONES DE NEGOCIO
    // ------------------------------------------------------------------
    private void validarInmueble(Inmueble inmueble) {
        if (inmueble.getPrecio() == null || inmueble.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("El precio del inmueble no puede ser negativo ni nulo.");
        }

        if (inmueble.getDireccion() == null || inmueble.getDireccion().trim().isEmpty()) {
            throw new BusinessValidationException("La dirección del inmueble es obligatoria.");
        }

        // 🌟 VALIDACIÓN DEL MAPA DE PROPIETARIOS PROVENIENTE DE REACT
        if (inmueble.getPropietariosPorcentaje() == null || inmueble.getPropietariosPorcentaje().isEmpty()) {
            throw new BusinessValidationException("Debe asignar al menos un propietario al inmueble.");
        }

        // Validamos que la suma de porcentajes sea exactamente 100%
        double sumaPorcentajes = inmueble.getPropietariosPorcentaje().values().stream()
                .mapToDouble(Number::doubleValue)
                .sum();

        if (Math.abs(sumaPorcentajes - 100.0) > 0.01) { // Margen delta para evitar imprecisiones de coma flotante
            throw new BusinessValidationException(
                    "La suma de las participaciones de los propietarios debe ser exactamente el 100%. Actual: "
                            + sumaPorcentajes + "%");
        }

        if (inmueble.getCaracteristicasExtra() != null && inmueble.getCaracteristicasExtra().size() > 50) {
            throw new BusinessValidationException("No se pueden añadir más de 50 características extra.");
        }
    }

    // ✅ CORREGIDO: Se cambia Map.of por Map.ofEntries para romper el límite de 10
    // elementos de Java
    private String generarReferencia(TipoInmueble tipo, Long id) {
        Map<TipoInmueble, String> prefijos = Map.ofEntries(
                Map.entry(TipoInmueble.PISO, "PI"),
                Map.entry(TipoInmueble.CASA, "CA"),
                Map.entry(TipoInmueble.CHALET, "CH"),
                Map.entry(TipoInmueble.ADOSADO, "AD"),
                Map.entry(TipoInmueble.APARTAMENTO, "AP"),
                Map.entry(TipoInmueble.ESTUDIO, "ES"),
                Map.entry(TipoInmueble.DUPLEX, "DX"),
                Map.entry(TipoInmueble.ATICO, "AT"),
                Map.entry(TipoInmueble.LOCAL_COMERCIAL, "LC"),
                Map.entry(TipoInmueble.OFICINA, "OF"),
                Map.entry(TipoInmueble.GARAJE, "GR"),
                Map.entry(TipoInmueble.TRASTERO, "TR"),
                Map.entry(TipoInmueble.TERRENO, "TE"),
                Map.entry(TipoInmueble.NAVE_INDUSTRIAL, "NV"),
                Map.entry(TipoInmueble.FINCA, "FC"));
        String prefijo = prefijos.getOrDefault(tipo, "ER");
        return prefijo + "-" + String.format("%03d", id);
    }
}