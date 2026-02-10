package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // ------------------------------------------------------------------
    // CRUD BASICO
    // ------------------------------------------------------------------

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // BUSCAR INDIVIDUAL
    @Transactional(readOnly = true)
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario con ID " + id + " no existe."));
    }

    // GUARDAR (Con cifrado de contraseña)
    @Transactional
    public Usuario guardar(Usuario usuario) {
        validarUsuario(usuario);

        // Ciframos la contraseña antes de persistir
        String passwordCifrada = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passwordCifrada);

        return usuarioRepository.save(usuario);
    }

    // ELIMINAR
    @Transactional
    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El usuario con ID " + id + " no existe.");
        }
        usuarioRepository.deleteById(id);
    }

    // ------------------------------------------------------------------
    // METODOS DE APOYO PARA VALIDACIONES DE NEGOCIO
    // ------------------------------------------------------------------

    private void validarUsuario(Usuario usuario) {
        // REGLA DE ORO: Debe tener al menos uno de los dos
        boolean tieneEmail = usuario.getEmail() != null && !usuario.getEmail().trim().isEmpty();
        boolean tieneTelefono = usuario.getTelefono() != null && !usuario.getTelefono().trim().isEmpty();

        if (!tieneEmail && !tieneTelefono) {
            throw new BusinessValidationException("Es obligatorio registrar un email o un número de teléfono.");
        }

        // Validación de duplicados para Usuarios nuevos (ID nulo) o si se está actualizando el email/telefono
        if (tieneEmail && usuario.getId() == null) {
            if (usuarioRepository.existsByEmailOrTelefono(usuario.getEmail(), usuario.getTelefono())) {
                throw new BusinessValidationException("Este email o teléfono ya está en uso.");
            }
        }

        // Password mínima
        if (usuario.getPassword() == null || usuario.getPassword().length() < 4) {
            throw new BusinessValidationException("La contraseña debe tener al menos 4 caracteres.");
        }
    }
}