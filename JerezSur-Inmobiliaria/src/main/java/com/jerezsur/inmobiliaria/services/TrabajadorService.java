package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.repositories.TrabajadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TrabajadorService {

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private TrabajadorRepository trabajadorRepository;

    // ------------------------------------------------------------------
    // CRUD BASICO
    // ------------------------------------------------------------------

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public List<Trabajador> listarTodos() {
        return trabajadorRepository.findAll();
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
            throw new BusinessValidationException("El cliente debe tener al menos un Email o un Teléfono de contacto.");
        }
    }
}