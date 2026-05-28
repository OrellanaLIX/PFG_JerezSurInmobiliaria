package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.Inmueble_Vendedor;
import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.Inmueble_VendedorRepository;

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

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private InmuebleRepository inmuebleRepository;

    @Autowired
    private Inmueble_VendedorRepository ivRepository;

    // ------------------------------------------------------------------
    // CRUD BASICO
    // ------------------------------------------------------------------

    // LISTAR TODOS CON FILTRADO
    @Transactional(readOnly = true)
    public Page<Inmueble> buscarConFiltros(String ref, String tit, String desc, TipoOperacion op, EstadoInmueble est,
            BigDecimal pMin, BigDecimal pMax, Integer hab, Integer ban, Double sMin, String ciu, String cp,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        // Validación básica de coherencia de precios
        if (pMin != null && pMax != null && pMin.compareTo(pMax) > 0) {
            throw new BusinessValidationException("El precio mínimo no puede ser superior al máximo.");
        }

        return inmuebleRepository.busquedaFiltrada(ref, tit, desc, op, est, pMin, pMax, hab, ban, sMin, ciu, cp,
                pageable);
    }

    // BUSCAR INDIVIDUAL
    @Transactional(readOnly = true)
    public Inmueble buscarPorId(Long id) {
        // Si el ID no existe, es un 404. Usamos orElseThrow.
        return inmuebleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El inmueble con ID " + id + " no existe."));
    }

    // GUARDAR
    @Transactional
    public Inmueble guardar(Inmueble inmueble) {
        String referencia = generarReferencia(inmueble.getTipo(), inmueble.getId());
        inmueble.setReferencia(referencia);
        validarInmueble(inmueble); // Extraemos las validaciones a un método privado
        return inmuebleRepository.save(inmueble);
    }

    // ELIMINAR
    @Transactional
    public void eliminar(Long id) {
        // Antes de borrar, comprobamos si existe para lanzar el 404 si falla
        if (!inmuebleRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El inmueble con ID " + id + " no existe.");
        }
        inmuebleRepository.deleteById(id);
    }

    // LOGICA DE NEGOCIO ADICIONAL (INMUEBLE_VENDEDOR)
    @Transactional
    public void asignarPropietario(Inmueble inmueble, Vendedor vendedor, Double porcentaje) {
        Inmueble_Vendedor vinculo = Inmueble_Vendedor.builder()
                .inmueble(inmueble)
                .vendedor(vendedor)
                .porcentajePropiedad(porcentaje)
                .build();
        ivRepository.save(vinculo);
    }

    // ------------------------------------------------------------------
    // METODOS DE APOYO PARA VALIDACIONES DE NEGOCIO
    // ------------------------------------------------------------------

    // Comprobar coherencia de precios y dimensiones
    private void validarInmueble(Inmueble inmueble) {
        if (inmueble.getPrecio() == null || inmueble.getPrecio().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("El precio del inmueble no puede ser negativo ni nulo.");
        }

        if (inmueble.getDireccion() == null || inmueble.getDireccion().trim().isEmpty()) {
            throw new BusinessValidationException("La dirección del inmueble es obligatoria.");
        }

        // Ejemplo de validación para la gestión de extras (Map<String, String>)
        if (inmueble.getCaracteristicasExtra() != null && inmueble.getCaracteristicasExtra().size() > 50) {
            throw new BusinessValidationException("No se pueden añadir más de 50 características extra.");
        }
    }

    // En tu servicio, al crear un inmueble:
    private String generarReferencia(TipoInmueble tipo, Long id) {
        Map<TipoInmueble, String> prefijos = Map.of(
                TipoInmueble.PISO, "PI",
                TipoInmueble.CASA, "CA",
                TipoInmueble.CHALET, "CH",
                TipoInmueble.ADOSADO, "AD",
                TipoInmueble.APARTAMENTO, "AP",
                TipoInmueble.ESTUDIO, "ES",
                TipoInmueble.DUPLEX, "DX",
                TipoInmueble.ATICO, "AT",
                TipoInmueble.LOCAL_COMERCIAL, "LC",
                TipoInmueble.OFICINA, "OF"
        // Map.of admite máx 10 entradas, para más usa Map.ofEntries(...)
        );
        String prefijo = prefijos.getOrDefault(tipo, "IN");
        return prefijo + "-" + String.format("%03d", id);
    }
}