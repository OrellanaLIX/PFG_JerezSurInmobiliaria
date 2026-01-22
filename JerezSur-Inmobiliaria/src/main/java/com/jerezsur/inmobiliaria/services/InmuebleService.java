package com.jerezsur.inmobiliaria.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;

@Service
public class InmuebleService {

    @Autowired
    private InmuebleRepository inmuebleRepository;

    @Transactional(readOnly = true)
    public List<Inmueble> listarTodos() {
        return inmuebleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Inmueble> buscarPorId(Long id) {
        return inmuebleRepository.findById(id);
    }

    @Transactional
    public Inmueble guardar(Inmueble inmueble) {

        // Validar datos aquí antes de guardar
        return inmuebleRepository.save(inmueble);
    }

    @Transactional
    public void eliminar(Long id) {

        Optional<Inmueble> inmOptional = inmuebleRepository.findById(id);

        // Si está presente, lo borramos
        if (inmOptional.isPresent()) {
            inmuebleRepository.deleteById(id);
        } else {
            // Lanzar una excepción personalizada si no existe
            throw new RuntimeException("No se encontró el inmueble con ID: " + id);
        }
    }

    //aplicar busqueda con filtro en el repository y llamarla aqui
}
