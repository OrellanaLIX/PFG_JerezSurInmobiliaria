package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.dto.InmuebleActualizarDTO;
import com.jerezsur.inmobiliaria.dto.InmuebleCrearDTO;
import com.jerezsur.inmobiliaria.dto.InmuebleDetallePublicoDTO;
import com.jerezsur.inmobiliaria.dto.InmuebleDestacadoDTO;
import com.jerezsur.inmobiliaria.dto.InmuebleListadoDTO;
import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Imagen;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.VendedorRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Map;
import java.util.stream.Collectors;

// Servicio principal de inmuebles: contiene toda la lógica de negocio relacionada
// con inmuebles (búsqueda, creación, actualización, validaciones y generación de referencias)
@Service
public class InmuebleService {

    @Autowired
    private InmuebleRepository inmuebleRepository;

    @Autowired
    private VendedorRepository vendedorRepository;

    // Versión legada de búsqueda (sin filtro por tipo ni zona) — usada por algunos endpoints internos
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

    // Versión principal con todos los filtros: tipo, zona, superficie máxima, etc.
    // Devuelve DTOs (no entidades completas) para no exponer datos privados al frontend
    @Transactional(readOnly = true)
    public Page<InmuebleListadoDTO> buscarConFiltrosDTO(
            String ref, String tit, String desc,
            TipoOperacion op, EstadoInmueble est, TipoInmueble tipo,
            BigDecimal pMin, BigDecimal pMax,
            Integer hab, Integer ban,
            Double sMin, Double sMax,
            String zona, String ciu, String cp,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        if (pMin != null && pMax != null && pMin.compareTo(pMax) > 0) {
            throw new BusinessValidationException("El precio mínimo no puede ser superior al máximo.");
        }

        Page<Inmueble> pageResult = inmuebleRepository.busquedaFiltrada(
                ref, tit, desc, op, est, tipo,
                pMin, pMax, hab, ban, sMin, sMax,
                zona, ciu, cp, pageable);

        List<InmuebleListadoDTO> dtos = pageResult.getContent().stream()
                .map(this::mapToListadoDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, pageResult.getTotalElements());
    }

    // Helper para detectar valores afirmativos en caracteristicasExtra
    private boolean extraBool(Map<String, String> extras, String... keys) {
        if (extras == null) return false;
        for (String k : keys) {
            String v = extras.get(k);
            if (v != null) {
                String s = v.trim().toLowerCase();
                if (s.equals("si") || s.equals("sí") || s.equals("yes")
                    || s.equals("1") || s.equals("true") || s.equals("x")) {
                    return true;
                }
            }
        }
        return false;
    }

    private InmuebleListadoDTO mapToListadoDTO(Inmueble i) {
        String portadaUrl = i.getImagenes().stream()
                .filter(img -> Boolean.TRUE.equals(img.getEsPortada()))
                .findFirst()
                .or(() -> i.getImagenes().stream().findFirst())
                .map(Imagen::getUrl)
                .orElse(null);

        Map<String, String> extras = i.getCaracteristicasExtra();

        return InmuebleListadoDTO.builder()
                .id(i.getId())
                .referencia(i.getReferencia())
                .titulo(i.getTitulo())
                .precio(i.getPrecio())
                .operacion(i.getOperacion() != null ? i.getOperacion().name() : null)
                .estado(i.getEstado() != null ? i.getEstado().name() : null)
                .tipo(i.getTipo() != null ? i.getTipo().name() : null)
                .ciudad(i.getCiudad())
                .zona(i.getZona())
                .habitaciones(i.getHabitaciones())
                .banos(i.getBanos())
                .superficieUtil(i.getSuperficieUtil())
                .mConstruidos(i.getMConstruidos())
                .descripcion(i.getDescripcion())
                .imagenPortadaUrl(portadaUrl)
                .destacado(i.getDestacado())
                // Características booleanas extraídas del mapa de extras
                .tieneAscensor(extraBool(extras, "Ascensor", "ascensor"))
                .tieneGaraje(extraBool(extras, "Garaje", "garaje", "Parking", "parking", "Aparcamiento"))
                .tieneJardin(extraBool(extras, "Jardín", "Jardin", "jardín", "jardin"))
                .tienePiscina(extraBool(extras, "Piscina", "piscina", "Piscina comunitaria", "Piscina privada"))
                .build();
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

    // Devuelve los inmuebles marcados como destacados para mostrarlos en la portada de la web
    @Transactional(readOnly = true)
    public List<InmuebleDestacadoDTO> listarDestacadosDTO() {
        List<Inmueble> destacados = inmuebleRepository.findByDestacadoTrueOrderByFechaRegistroDesc();
        return destacados.stream().map(i -> {
            String imagenUrl = i.getImagenes().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getEsPortada()))
                    .findFirst()
                    .or(() -> i.getImagenes().stream().findFirst())
                    .map(Imagen::getUrl)
                    .orElse(null);
            return InmuebleDestacadoDTO.builder()
                    .id(i.getId())
                    .referencia(i.getReferencia())
                    .titulo(i.getTitulo())
                    .precio(i.getPrecio())
                    .operacion(i.getOperacion() != null ? i.getOperacion().name() : null)
                    .ciudad(i.getCiudad())
                    .zona(i.getZona())
                    .habitaciones(i.getHabitaciones())
                    .banos(i.getBanos())
                    .superficieUtil(i.getSuperficieUtil())
                    .imagenPortadaUrl(imagenUrl)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InmuebleDetallePublicoDTO buscarDetallePublico(Long id) {
        Inmueble i = inmuebleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El inmueble con ID " + id + " no existe."));

        List<InmuebleDetallePublicoDTO.ImagenPublicaDTO> imagenesDTO = i.getImagenes().stream()
                .sorted((a, b) -> {
                    if (Boolean.TRUE.equals(a.getEsPortada())) return -1;
                    if (Boolean.TRUE.equals(b.getEsPortada())) return 1;
                    return 0;
                })
                .map(img -> InmuebleDetallePublicoDTO.ImagenPublicaDTO.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .esPortada(img.getEsPortada())
                        .build())
                .collect(Collectors.toList());

        return InmuebleDetallePublicoDTO.builder()
                .id(i.getId())
                .referencia(i.getReferencia())
                .titulo(i.getTitulo())
                .descripcion(i.getDescripcion())
                .precio(i.getPrecio())
                .operacion(i.getOperacion() != null ? i.getOperacion().name() : null)
                .estado(i.getEstado() != null ? i.getEstado().name() : null)
                .tipo(i.getTipo() != null ? i.getTipo().name() : null)
                .superficieUtil(i.getSuperficieUtil())
                .mConstruidos(i.getMConstruidos())
                .habitaciones(i.getHabitaciones())
                .banos(i.getBanos())
                .direccion(i.getDireccion())
                .zona(i.getZona())
                .codigoPostal(i.getCodigoPostal())
                .ciudad(i.getCiudad())
                .comunidad(i.getComunidad())
                .tieneDerrama(i.getTieneDerrama())
                .valorDerrama(i.getValorDerrama())
                .ibi(i.getIbi())
                .urlCertificadoEnergetico(i.getUrlCertificadoEnergetico())
                .caracteristicasExtra(i.getCaracteristicasExtra())
                .imagenes(imagenesDTO)
                .build();
    }

    // Limita el número de destacados a un máximo de 3.
    // Si ya hay 3, quita el más antiguo para hacer sitio al nuevo.
    // exceptoId permite excluir el inmueble que estamos editando del conteo.
    private void enforceDestacadoLimit(Long exceptoId) {
        List<Inmueble> destacados = inmuebleRepository.findByDestacadoTrueOrderByFechaRegistroAsc();
        List<Inmueble> otros = destacados.stream()
                .filter(i -> exceptoId == null || !i.getId().equals(exceptoId))
                .collect(Collectors.toList());
        while (otros.size() >= 3) {
            Inmueble oldest = otros.remove(0);
            oldest.setDestacado(false);
            inmuebleRepository.save(oldest);
        }
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

    @Transactional
    public Inmueble guardarDesdeDto(InmuebleCrearDTO dto) {
        // 1. Instanciamos la entidad real vacía y pasamos los datos básicos
        Inmueble inmueble = new Inmueble();
        inmueble.setTitulo(dto.getTitulo());
        inmueble.setDescripcion(dto.getDescripcion());
        inmueble.setPrecio(dto.getPrecio());
        inmueble.setOperacion(dto.getOperacion());
        inmueble.setEstado(dto.getEstado());
        inmueble.setTipo(dto.getTipo());
        inmueble.setSuperficieUtil(dto.getSuperficieUtil());
        inmueble.setMConstruidos(dto.getMConstruidos());
        inmueble.setHabitaciones(dto.getHabitaciones());
        inmueble.setBanos(dto.getBanos());
        inmueble.setDireccion(dto.getDireccion());
        if (dto.getZona() != null) inmueble.setZona(dto.getZona());
        inmueble.setCodigoPostal(dto.getCodigoPostal());
        inmueble.setCiudad(dto.getCiudad());

        if (Boolean.TRUE.equals(dto.getDestacado())) {
            enforceDestacadoLimit(null);
        }
        inmueble.setDestacado(Boolean.TRUE.equals(dto.getDestacado()));

        // Gastos y cargas
        if (dto.getComunidad() != null) inmueble.setComunidad(dto.getComunidad());
        if (dto.getTieneDerrama() != null) inmueble.setTieneDerrama(dto.getTieneDerrama());
        if (dto.getValorDerrama() != null) inmueble.setValorDerrama(dto.getValorDerrama());
        if (dto.getRefCatastral() != null) inmueble.setRefCatastral(dto.getRefCatastral());
        
        // URLs de documentación desde Cloudinary
        if (dto.getUrlNotaSimple() != null) inmueble.setUrlNotaSimple(dto.getUrlNotaSimple());
        if (dto.getUrlCertificadoEnergetico() != null) inmueble.setUrlCertificadoEnergetico(dto.getUrlCertificadoEnergetico());
        if (dto.getUrlPlanoInmueble() != null) inmueble.setUrlPlanoInmueble(dto.getUrlPlanoInmueble());
        if (dto.getNotasPrivadas() != null) inmueble.setNotasPrivadas(dto.getNotasPrivadas());

        // 2. PROCESAMOS EL MAPA DE PROPIETARIOS
        // Como 'inmueble' ya no se reasigna abajo, Java lo considerará "effectively
        // final" y compilará sin errores
        dto.getPropietariosPorcentaje().forEach((vendedorId, porcentaje) -> {
            Vendedor vendedor = vendedorRepository.findById(vendedorId)
                    .orElseThrow(
                            () -> new ResourceNotFoundException("El vendedor con ID " + vendedorId + " no existe."));

            inmueble.getPropietariosPorcentaje().put(vendedor, porcentaje);
        });

        // Executamos tus validaciones de negocio (comprobar el 100%, precios, etc.)
        validarInmueble(inmueble);

        // 3. Flujo de Referencia Automática
        String tempRef = "T-" + java.util.UUID.randomUUID().toString().substring(0, 4);
        inmueble.setReferencia(tempRef);

        // 🌟 CORRECCIÓN AQUÍ: Usamos otra variable para el retorno del guardado
        // intermedio 🌟
        Inmueble inmuebleGuardado = inmuebleRepository.save(inmueble);

        String referenciaDefinitiva = generarReferencia(inmuebleGuardado.getTipo(), inmuebleGuardado.getId());
        inmuebleGuardado.setReferencia(referenciaDefinitiva);

        // 4. Procesar imágenes desde Cloudinary
        if (dto.getImagenesUrls() != null && !dto.getImagenesUrls().isEmpty()) {
            for (int i = 0; i < dto.getImagenesUrls().size(); i++) {
                String urlImagen = dto.getImagenesUrls().get(i);
                Imagen imagen = Imagen.builder()
                        .url(urlImagen)
                        .nombreArchivo("imagen_" + System.currentTimeMillis() + "_" + i + ".jpg")
                        .esPortada(i == 0) // Primera imagen es portada
                        .inmueble(inmuebleGuardado)
                        .build();
                inmuebleGuardado.getImagenes().add(imagen);
            }
        }

        // 5. Guardado final
        return inmuebleRepository.save(inmuebleGuardado);
    }

    @Transactional
    public Inmueble actualizarDesdeDto(Long id, InmuebleActualizarDTO dto) {
        // 1. Obtener el inmueble existente
        Inmueble inmueble = buscarPorId(id);

        // 2. Actualizar campos si están presentes
        if (dto.getTitulo() != null) inmueble.setTitulo(dto.getTitulo());
        if (dto.getDescripcion() != null) inmueble.setDescripcion(dto.getDescripcion());
        if (dto.getPrecio() != null) inmueble.setPrecio(dto.getPrecio());
        if (dto.getOperacion() != null) inmueble.setOperacion(dto.getOperacion());
        if (dto.getEstado() != null) inmueble.setEstado(dto.getEstado());
        if (dto.getTipo() != null) inmueble.setTipo(dto.getTipo());
        if (dto.getSuperficieUtil() != null) inmueble.setSuperficieUtil(dto.getSuperficieUtil());
        if (dto.getMConstruidos() != null) inmueble.setMConstruidos(dto.getMConstruidos());
        if (dto.getHabitaciones() != null) inmueble.setHabitaciones(dto.getHabitaciones());
        if (dto.getBanos() != null) inmueble.setBanos(dto.getBanos());
        if (dto.getDireccion() != null) inmueble.setDireccion(dto.getDireccion());
        if (dto.getZona() != null) inmueble.setZona(dto.getZona());
        if (dto.getCodigoPostal() != null) inmueble.setCodigoPostal(dto.getCodigoPostal());
        if (dto.getCiudad() != null) inmueble.setCiudad(dto.getCiudad());

        if (dto.getDestacado() != null) {
            if (Boolean.TRUE.equals(dto.getDestacado()) && !Boolean.TRUE.equals(inmueble.getDestacado())) {
                enforceDestacadoLimit(id);
            }
            inmueble.setDestacado(dto.getDestacado());
        }

        // Gastos y cargas
        if (dto.getComunidad() != null) inmueble.setComunidad(dto.getComunidad());
        if (dto.getTieneDerrama() != null) inmueble.setTieneDerrama(dto.getTieneDerrama());
        if (dto.getValorDerrama() != null) inmueble.setValorDerrama(dto.getValorDerrama());
        if (dto.getRefCatastral() != null) inmueble.setRefCatastral(dto.getRefCatastral());

        // URLs de documentación desde Cloudinary
        if (dto.getUrlNotaSimple() != null) inmueble.setUrlNotaSimple(dto.getUrlNotaSimple());
        if (dto.getUrlCertificadoEnergetico() != null) inmueble.setUrlCertificadoEnergetico(dto.getUrlCertificadoEnergetico());
        if (dto.getUrlPlanoInmueble() != null) inmueble.setUrlPlanoInmueble(dto.getUrlPlanoInmueble());
        if (dto.getNotasPrivadas() != null) inmueble.setNotasPrivadas(dto.getNotasPrivadas());

        // 3. Actualizar propietarios si están presentes
        if (dto.getPropietariosPorcentaje() != null && !dto.getPropietariosPorcentaje().isEmpty()) {
            inmueble.getPropietariosPorcentaje().clear();
            dto.getPropietariosPorcentaje().forEach((vendedorId, porcentaje) -> {
                Vendedor vendedor = vendedorRepository.findById(vendedorId)
                        .orElseThrow(() -> new ResourceNotFoundException("El vendedor con ID " + vendedorId + " no existe."));
                inmueble.getPropietariosPorcentaje().put(vendedor, porcentaje);
            });
        }

        // 4. Procesar nuevas imágenes desde Cloudinary si existen
        if (dto.getImagenesUrls() != null && !dto.getImagenesUrls().isEmpty()) {
            for (int i = 0; i < dto.getImagenesUrls().size(); i++) {
                String urlImagen = dto.getImagenesUrls().get(i);
                Imagen imagen = Imagen.builder()
                        .url(urlImagen)
                        .nombreArchivo("imagen_" + System.currentTimeMillis() + "_" + i + ".jpg")
                        .esPortada(false) // Las nuevas imágenes no son portada
                        .inmueble(inmueble)
                        .build();
                inmueble.getImagenes().add(imagen);
            }
        }

        // 5. Validar cambios críticos
        validarInmueble(inmueble);

        // 6. Guardado final
        return inmuebleRepository.save(inmueble);
    }
}