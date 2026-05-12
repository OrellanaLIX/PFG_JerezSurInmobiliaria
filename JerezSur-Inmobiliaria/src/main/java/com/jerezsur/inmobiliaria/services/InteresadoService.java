package com.jerezsur.inmobiliaria.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Interesado;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.repositories.InteresadoRepository;

@Service
public class InteresadoService {

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private InteresadoRepository interesadoRepository;

    // ------------------------------------------------------------------
    // CRUD BASICO
    // ------------------------------------------------------------------

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public Page<Interesado> listarTodo(boolean hipo, Double presu, String zona, int habs, int banos, TipoOperacion tipo,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        return interesadoRepository.listarFiltrado(hipo, presu, zona, habs, banos, tipo, pageable);
    }

    // BUSCAR INDIVIDUAL
    @Transactional(readOnly = true)
    public Interesado buscarPorId(Long id) {
        return interesadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El interesado con ID " + id + " no existe."));
    }

    // ELIMINAR
    @Transactional
    public void eliminar(Long id) {
        if (!interesadoRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El interesado con ID " + id + " no existe.");
        }
        interesadoRepository.deleteById(id);
    }
}