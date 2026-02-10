package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Imagen; // Asumiendo que tienes esta entidad
import com.jerezsur.inmobiliaria.repositories.ImagenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ImagenService {

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private ImagenRepository imagenRepository;

    //------------------------------------------------------------------
    // CRUD BASICO
    //------------------------------------------------------------------

    // LISTAR TODAS
    @Transactional(readOnly = true)
    public List<Imagen> listarTodas() {
        return imagenRepository.findAll();
    }

    // BUSCAR INDIVIDUAL
    @Transactional(readOnly = true)
    public Imagen buscarPorId(Long id) {
        return imagenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La imagen con ID " + id + " no existe."));
    }

    // GUARDAR
    @Transactional
    public Imagen guardar(Imagen imagen) {
        validarImagen(imagen);
        return imagenRepository.save(imagen);
    }

    // ELIMINAR
    @Transactional
    public void eliminar(Long id) {
        if (!imagenRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: La imagen con ID " + id + " no existe.");
        }
        imagenRepository.deleteById(id);
    }

    //------------------------------------------------------------------
    // METODOS DE APOYO PARA VALIDACIONES DE NEGOCIO
    //------------------------------------------------------------------

    private void validarImagen(Imagen imagen) {
        // Validación: La URL o ruta no puede estar vacía
        if (imagen.getUrl() == null || imagen.getUrl().trim().isEmpty()) {
            throw new BusinessValidationException("La URL o ruta de la imagen es obligatoria.");
        }

        // Validación: Debe estar asociada a un inmueble
        if (imagen.getInmueble() == null) {
            throw new BusinessValidationException("Una imagen debe estar vinculada a un inmueble específico.");
        }
    }
}