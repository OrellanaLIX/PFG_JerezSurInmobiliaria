package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.models.enums.Role;
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

    @Autowired
    private UsuarioService usuarioService;

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
    public Vendedor guardar(Vendedor vendedor) {
        // 1. Validar reglas de negocio (DNI, Nombre, etc.)
        validarVendedor(vendedor);

        // 2. Gestionar la cuenta de usuario (Escenarios 1, 2 y 3)
        if (vendedor.getUsuario() == null) {
            Usuario nuevoUsuario = Usuario.builder()
                    .email(vendedor.getEmail())
                    .telefono(vendedor.getTelefono())
                    .nombre(vendedor.getNombre())
                    .role(Role.ROLE_VENDEDOR) // Importante: Rol específico para vendedores
                    .password(vendedor.getPassword()) // Campo @Transient
                    .build();

            // Delegamos en usuarioService la lógica de cifrado y flag de cambio
            Usuario usuarioPersistido = usuarioService.registrarUsuario(nuevoUsuario);
            vendedor.setUsuario(usuarioPersistido);
        }

        // 3. Sincronizar datos para que sean coherentes en ambas tablas
        sincronizarDatosContacto(vendedor);

        return vendedorRepository.save(vendedor);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!vendedorRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El vendedor con ID " + id + " no existe.");
        }
        vendedorRepository.deleteById(id);
    }

    // ------------------------------------------------------------------
    // LÓGICA DE SINCRONIZACIÓN
    // ------------------------------------------------------------------

    private void sincronizarDatosContacto(Vendedor vendedor) {
        Usuario usuario = vendedor.getUsuario();
        if (usuario == null) return;

        // Priorizamos los datos actuales del objeto Vendedor (los que vienen del form)
        if (!isEmpty(vendedor.getEmail())) {
            usuario.setEmail(vendedor.getEmail());
        } else if (!isEmpty(usuario.getEmail())) {
            vendedor.setEmail(usuario.getEmail());
        }

        if (!isEmpty(vendedor.getTelefono())) {
            usuario.setTelefono(vendedor.getTelefono());
        } else if (!isEmpty(usuario.getTelefono())) {
            vendedor.setTelefono(usuario.getTelefono());
        }
    }

    // ------------------------------------------------------------------
    // VALIDACIONES
    // ------------------------------------------------------------------

    private void validarVendedor(Vendedor vendedor) {
        if (isEmpty(vendedor.getNombre())) {
            throw new BusinessValidationException("El nombre del vendedor es obligatorio.");
        }

        // El DNI es crítico para un vendedor (Escrituras, IBI, Contratos de Arras)
        if (isEmpty(vendedor.getDni())) {
            throw new BusinessValidationException("El DNI/NIF es obligatorio para la gestión de inmuebles.");
        }

        // Validación de contacto
        if (isEmpty(vendedor.getEmail()) && isEmpty(vendedor.getTelefono())) {
            throw new BusinessValidationException("El vendedor debe tener al menos un Email o un Teléfono.");
        }
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
}