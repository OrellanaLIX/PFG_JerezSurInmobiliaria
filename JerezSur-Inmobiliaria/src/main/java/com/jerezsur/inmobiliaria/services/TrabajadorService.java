package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.repositories.TrabajadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrabajadorService {

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private TrabajadorRepository trabajadorRepository;

    @Autowired
    private UsuarioService usuarioService;

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
    public Trabajador guardar(Trabajador trabajador) {
        validarTrabajador(trabajador);

        // 1. GESTIÓN DEL USUARIO: Si es un trabajador nuevo y no tiene usuario, lo
        // creamos
        if (trabajador.getUsuario() == null) {
            Usuario nuevoUsuario = Usuario.builder()
                    .email(trabajador.getEmail())
                    .telefono(trabajador.getTelefono())
                    .nombre(trabajador.getNombre())
                    .role(Role.ROLE_TRABAJADOR)
                    .password(trabajador.getPassword())
                    .build();

            // Usamos el método que ya valida y cifra la contraseña
            Usuario usuarioPersistido = usuarioService.registrarUsuario(nuevoUsuario);
            trabajador.setUsuario(usuarioPersistido);
        }

        // 2. SINCRONIZACIÓN: Aseguramos que email/tel coincidan en ambas tablas
        sincronizarDatosContacto(trabajador);

        return trabajadorRepository.save(trabajador);
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
    // LÓGICA DE SINCRONIZACIÓN AUTOMÁTICA
    // ------------------------------------------------------------------

    private void sincronizarDatosContacto(Trabajador trabajador) {
        Usuario usuario = trabajador.getUsuario();

        // REGLA: Si el trabajador está vacío pero el usuario tiene el dato, se copia al
        // trabajador
        if (isEmpty(trabajador.getEmail()) && !isEmpty(usuario.getEmail())) {
            trabajador.setEmail(usuario.getEmail());
        }
        if (isEmpty(trabajador.getTelefono()) && !isEmpty(usuario.getTelefono())) {
            trabajador.setTelefono(usuario.getTelefono());
        }

        // REGLA INVERSA: Si el trabajador tiene un dato nuevo (ej. puso teléfono en un
        // form),
        // lo actualizamos también en su cuenta de usuario para que coincidan.
        if (!isEmpty(trabajador.getEmail())) {
            usuario.setEmail(trabajador.getEmail());
        }
        if (!isEmpty(trabajador.getTelefono())) {
            usuario.setTelefono(trabajador.getTelefono());
        }
    }

    // ------------------------------------------------------------------
    // METODOS DE APOYO PARA VALIDACIONES DE NEGOCIO
    // ------------------------------------------------------------------

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private void validarTrabajador(Trabajador trabajador) {
        // Validación: Nombre y Apellidos obligatorios
        if (trabajador.getNombre() == null || trabajador.getNombre().trim().isEmpty()) {
            throw new BusinessValidationException("El nombre del trabajador es obligatorio.");
        }

        // Validación: NIF/DNI (muy importante para la validez de contratos)
        if (trabajador.getDni() == null || trabajador.getDni().length() < 9) {
            throw new BusinessValidationException("El DNI debe tener un formato válido.");
        }

        // Validación: Puesto de trabajo
        if (trabajador.getCargo() == null || trabajador.getCargo().trim().isEmpty()) {
            throw new BusinessValidationException("El puesto del trabajador es obligatorio.");
        }

        // Al menos uno de los dos debe existir tras la sincronización
        if (isEmpty(trabajador.getEmail()) && isEmpty(trabajador.getTelefono())) {
            throw new BusinessValidationException(
                    "El trabajador debe tener al menos un Email o un Teléfono de contacto.");
        }
    }
}