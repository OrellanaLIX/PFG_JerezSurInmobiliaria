package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.Inmueble_Vendedor;
import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.Inmueble_VendedorRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public List<Inmueble> listarTodos() {
        // Devuelve lista llena o []
        return inmuebleRepository.findAll();
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
}