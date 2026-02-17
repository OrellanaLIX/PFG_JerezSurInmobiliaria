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

    /**
     * MÉTODO PRINCIPAL PARA REGISTRO DE CLIENTES (INTERESADOS)
     * Maneja los 3 escenarios:
     * 1. Registro web (trae password) -> Cifra y guarda.
     * 2. Formulario contacto (sin password) -> Guarda null y activa flag.
     * 3. Alta por trabajador (sin password) -> Guarda null y activa flag.
     */
    @Transactional
    public Usuario registrarUsuario(Usuario usuario) {
        validarDatos(usuario);

        // Lógica de Contraseña
        if (usuario.getPassword() != null && !usuario.getPassword().trim().isEmpty()) {
            // Escenario 1: El usuario puso una contraseña
            String passCifrada = passwordEncoder.encode(usuario.getPassword());
            usuario.setPassword(passCifrada);
            usuario.setCambiarPasswd(false);
        } else {
            // Escenarios 2 y 3: No hay contraseña todavía
            usuario.setPassword(null);
            usuario.setCambiarPasswd(true); // Obligatorio cambiarla al entrar
        }

        return usuarioRepository.save(usuario);
    }

    /**
     * MÉTODO PARA ACTUALIZACIONES O CAMBIOS DE CONTRASEÑA MANUALES
     */
    @Transactional
    public Usuario guardar(Usuario usuario) {
        // Validamos contacto y password obligatoria (si no es un update parcial)
        validarDatos(usuario);

        // Si estamos creando un admin o trabajador manualmente y ponemos pass, la
        // ciframos
        if (usuario.getId() == null && usuario.getPassword() != null) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

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

    private void validarDatos(Usuario usuario) {
        // 1. REGLA DE ORO: Debe tener al menos Email O Teléfono
        boolean tieneEmail = !isEmpty(usuario.getEmail());
        boolean tieneTelefono = !isEmpty(usuario.getTelefono());

        if (!tieneEmail && !tieneTelefono) {
            throw new BusinessValidationException("Es obligatorio registrar un email o un número de teléfono.");
        }

        // 2. Validación de duplicados (Solo para nuevos usuarios)
        if (usuario.getId() == null) {
            if (tieneEmail && usuarioRepository.existsByEmailOrTelefono(usuario.getEmail(), usuario.getTelefono())) {
                throw new BusinessValidationException("El email " + usuario.getEmail() + "o el telefono"
                        + usuario.getTelefono() + " ya está registrado.");
            }
        }

        // 3. Validación de Password (SOLO SI SE PROPORCIONA)
        // Si es null, no pasa nada (escenarios 2 y 3). Pero si escribe algo, que sea
        // seguro.
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            // Definimos el patrón de seguridad
            String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

            if (!usuario.getPassword().matches(regex)) {
                throw new BusinessValidationException(
                        "La contraseña es demasiado débil. Debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&).");
            }
        }
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
}