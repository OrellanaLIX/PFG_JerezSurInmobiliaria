package com.jerezsur.inmobiliaria.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Interesado;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.models.enums.EstadoComprador;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.repositories.InteresadoRepository;

@Service
public class InteresadoService {

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private InteresadoRepository interesadoRepository;

    @Autowired
    private UsuarioService usuarioService;

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

    // GUARDAR
    @Transactional
    public Interesado guardar(Interesado interesado) {
        // 1. Validar primero lo básico (Nombre, etc.)
        validarInteresado(interesado);

        // 2. Gestionar el Usuario si no existe
        if (interesado.getUsuario() == null) {
            Usuario nuevoUsuario = Usuario.builder()
                    .email(interesado.getEmail())
                    .telefono(interesado.getTelefono())
                    .nombre(interesado.getNombre())
                    .role(Role.ROLE_INTERESADO)
                    .password(interesado.getPassword()) // Campo @Transient
                    .build();

            // Guardamos el usuario y lo vinculamos
            Usuario usuarioPersistido = usuarioService.registrarUsuario(nuevoUsuario);
            interesado.setUsuario(usuarioPersistido);
        }

        // 3. Ahora que el usuario existe sí o sí, sincronizamos datos
        sincronizarDatosContacto(interesado);

        // 4. Persistir el interesado
        return interesadoRepository.save(interesado);
    }

    // ELIMINAR
    @Transactional
    public void eliminar(Long id) {
        if (!interesadoRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El interesado con ID " + id + " no existe.");
        }
        interesadoRepository.deleteById(id);
    }

    // ------------------------------------------------------------------
    // LÓGICA DE SINCRONIZACIÓN AUTOMÁTICA
    // ------------------------------------------------------------------

    private void sincronizarDatosContacto(Interesado interesado) {
        Usuario usuario = interesado.getUsuario();

        // REGLA: Si el interesado está vacío pero el usuario tiene el dato, se copia al
        // interesado
        if (isEmpty(interesado.getEmail()) && !isEmpty(usuario.getEmail())) {
            interesado.setEmail(usuario.getEmail());
        }
        if (isEmpty(interesado.getTelefono()) && !isEmpty(usuario.getTelefono())) {
            interesado.setTelefono(usuario.getTelefono());
        }

        // REGLA INVERSA: Si el interesado tiene un dato nuevo (ej. puso teléfono en un
        // form),
        // lo actualizamos también en su cuenta de usuario para que coincidan.
        if (!isEmpty(interesado.getEmail())) {
            usuario.setEmail(interesado.getEmail());
        }
        if (!isEmpty(interesado.getTelefono())) {
            usuario.setTelefono(interesado.getTelefono());
        }
    }

    // ------------------------------------------------------------------
    // METODOS DE APOYO PARA VALIDACIONES DE NEGOCIO
    // ------------------------------------------------------------------

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private void validarInteresado(Interesado interesado) {
        // Validación: El nombre y contacto son obligatorios
        if (interesado.getNombre() == null || interesado.getNombre().trim().isEmpty()) {
            throw new BusinessValidationException("El nombre del interesado es obligatorio.");
        }

        // Al menos uno de los dos debe existir tras la sincronización
        if (isEmpty(interesado.getEmail()) && isEmpty(interesado.getTelefono())) {
            throw new BusinessValidationException("El cliente debe tener al menos un Email o un Teléfono de contacto.");
        }

        // Validación: Estado por defecto
        if (interesado.getEstado() == null) {
            interesado.setEstado(EstadoComprador.INTERESADO);
        }
    }
}