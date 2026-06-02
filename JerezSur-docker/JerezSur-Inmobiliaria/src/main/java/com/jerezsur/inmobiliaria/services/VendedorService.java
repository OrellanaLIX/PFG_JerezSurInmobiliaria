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

// Servicio de gestión de vendedores (propietarios): CRUD y búsquedas para el equipo comercial.
// Un vendedor es el propietario que cede su inmueble a la inmobiliaria para su venta.
@Service
public class VendedorService {

    @Autowired
    private VendedorRepository vendedorRepository;

    // ------------------------------------------------------------------
    // CRUD BÁSICO
    // ------------------------------------------------------------------

    // LISTAR TODOS CORREGIDO
    @Transactional(readOnly = true)
    public Page<Vendedor> listarTodos(int page, int size, String sortBy, String sortDir) {

        // Creamos la dirección del ordenamiento
        Sort.Direction direction = Sort.Direction.fromString(sortDir);
        Sort sort;

        // Si el frontend pide "usuario.nombre", Spring Data JPA requiere que se
        // mapee reconociendo la propiedad anidada.
        if ("usuario.nombre".equals(sortBy)) {
            // Esto le dice a Hibernate: ordena por la propiedad 'nombre' dentro del objeto
            // 'usuario'
            sort = Sort.by(direction, "usuario.nombre");
        } else if ("id".equals(sortBy)) {
            sort = Sort.by(direction, "id");
        } else {
            // Por si acaso mandan cualquier otra propiedad que pueda romper el backend
            sort = Sort.by(direction, "id");
        }

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