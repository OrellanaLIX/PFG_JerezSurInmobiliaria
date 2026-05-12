package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.repositories.VendedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VendedorService {

    @Autowired
    private VendedorRepository vendedorRepository;

    // ------------------------------------------------------------------
    // CRUD BÁSICO
    // ------------------------------------------------------------------

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public Page<Vendedor> listarTodos(int page, int size, String sortBy, String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        return vendedorRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Vendedor buscarPorId(Long id) {
        return vendedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El vendedor con ID " + id + " no existe."));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!vendedorRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El vendedor con ID " + id + " no existe.");
        }
        vendedorRepository.deleteById(id);
    }
}