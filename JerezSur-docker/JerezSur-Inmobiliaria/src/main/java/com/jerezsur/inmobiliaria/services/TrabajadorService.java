package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.repositories.TrabajadorRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Servicio de gestión de trabajadores: CRUD del personal de la inmobiliaria.
// Solo los trabajadores activos pueden acceder al panel de administración.
@Service
public class TrabajadorService {

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private TrabajadorRepository trabajadorRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ------------------------------------------------------------------
    // CRUD BASICO
    // ------------------------------------------------------------------

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public Page<Trabajador> listarTodos(int page, int size, String sortBy, String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        return trabajadorRepository.findAll(pageable);
    }

    // BUSCAR INDIVIDUAL
    @Transactional(readOnly = true)
    public Trabajador buscarPorId(Long id) {
        return trabajadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El trabajador con ID " + id + " no existe."));
    }

    // GUARDAR
    @Transactional
    public void guardar(Trabajador trabajador, Usuario usuario) {

        validarTrabajador(trabajador);

        trabajadorRepository.save(trabajador);

        // 3. Actualizamos el rol del usuario para que ya no sea redirigido al
        // onboarding
        usuario.setRole(Role.ROLE_TRABAJADOR); // O el rol que designes para usuarios activos
        usuarioRepository.save(usuario);
    }
        
    // ELIMINAR
    @Transactional
    public void eliminar(Long id) {
        if (!trabajadorRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El trabajador con ID " + id + " no existe.");
        }
        trabajadorRepository.deleteById(id);
    }

    // ------------------------------------------------------------------
    // METODOS DE APOYO PARA VALIDACIONES DE NEGOCIO
    // ------------------------------------------------------------------

    private void validarTrabajador(Trabajador trabajador) {
        // Validación: NIF/DNI (muy importante para la validez de contratos)
        if (trabajador.getDni() == null || trabajador.getDni().length() < 9) {
            throw new BusinessValidationException("El DNI debe tener un formato válido.");
        }

        // Validación: Puesto de trabajo
        if (trabajador.getCargo() == null || trabajador.getCargo().trim().isEmpty()) {
            throw new BusinessValidationException("El puesto del trabajador es obligatorio.");
        }
    }
}