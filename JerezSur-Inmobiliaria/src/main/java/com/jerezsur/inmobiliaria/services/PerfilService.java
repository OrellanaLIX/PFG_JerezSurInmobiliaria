package com.jerezsur.inmobiliaria.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.jerezsur.inmobiliaria.models.*;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.repositories.*;

import jakarta.persistence.EntityNotFoundException;

import com.jerezsur.inmobiliaria.dto.OnboardingRequest;
import com.jerezsur.inmobiliaria.dto.UpdatePerfilRequest;
import com.jerezsur.inmobiliaria.dto.UsuarioPerfilDTO;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class PerfilService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private InteresadoRepository interesadoRepository;

    @Autowired
    private VendedorRepository vendedorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Construye un DTO seguro a partir de un Usuario.
     * Nunca expone contraseña ni datos internos de seguridad.
     */
    public UsuarioPerfilDTO buildPerfilDTO(Usuario usuario) {
        UsuarioPerfilDTO dto = new UsuarioPerfilDTO();

        dto.setId(usuario.getId());
        dto.setEmail(usuario.getEmail());
        dto.setTelefono(usuario.getTelefono());
        dto.setNombre(usuario.getNombre());
        dto.setApellidos(usuario.getApellidos());
        dto.setDni(usuario.getDni());
        dto.setImagenPerfilUrl(usuario.getImagenPerfilUrl());
        dto.setRole(usuario.getRole());
        dto.setCambiarPasswd(usuario.getCambiarPasswd());
        dto.setFechaRegistro(usuario.getFechaRegistro());

        // Cargar datos de interesado si existe
        Interesado interesado = interesadoRepository.findByUsuario(usuario).orElse(null);
        if (interesado != null) {
            dto.setInteresadoId(interesado.getId());
            dto.setZonaInteres(interesado.getZonaInteres());
            dto.setPresupuestoMaximo(
                    interesado.getPresupuestoMaximo() != null
                            ? interesado.getPresupuestoMaximo().toPlainString()
                            : null);
            dto.setHabitacionesMinimas(interesado.getHabitacionesMinimas());
            dto.setBanosMinimos(interesado.getBanosMinimos());
            dto.setTipoBusqueda(
                    interesado.getTipoBusqueda() != null
                            ? interesado.getTipoBusqueda().name()
                            : null);
            dto.setObservacionesInteresado(interesado.getObservaciones());
        }

        // Cargar datos de vendedor si existe
        Vendedor vendedor = vendedorRepository.findByUsuario(usuario).orElse(null);
        if (vendedor != null) {
            dto.setVendedorId(vendedor.getId());
            dto.setObservacionesVendedor(vendedor.getObservaciones());
        }

        return dto;
    }

    // ==========================================
    // OBTENER PERFIL (ya lo tienes, OK)
    // ==========================================
    public UsuarioPerfilDTO obtenerPerfil(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Usuario no encontrado con ID: " + usuarioId));
        return buildPerfilDTO(usuario);
    }

    // ==========================================
    // 1️⃣ COMPLETAR PERFIL (Onboarding) - tu método actual ligeramente mejorado
    // ==========================================
    @Transactional
    public void completarPerfil(OnboardingRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Actualizar datos básicos (solo si vienen rellenos)
        actualizarDatosBasicos(usuario, request.getNombre(), request.getApellidos(),
                request.getTelefono(), request.getEmail(), request.getDni(), null);

        // Cambio de contraseña SIN validación (es primer acceso)
        if (request.getNuevaPassword() != null && !request.getNuevaPassword().isBlank()) {
            if (request.getNuevaPassword().length() < 8) {
                throw new RuntimeException("La contraseña debe tener al menos 8 caracteres");
            }
            usuario.setPassword(passwordEncoder.encode(request.getNuevaPassword()));
            usuario.setCambiarPasswd(false);
        }

        // Crear Interesado SI NO existe
        if (request.getPerfil() != null
                && (request.getPerfil().equals("interesado") || request.getPerfil().equals("ambos"))
                && !interesadoRepository.existsByUsuario(usuario)) {
            crearInteresado(usuario, request);
        }

        // Crear Vendedor SI NO existe
        if (request.getPerfil() != null
                && (request.getPerfil().equals("propietario") || request.getPerfil().equals("ambos"))
                && !vendedorRepository.existsByUsuario(usuario)) {
            crearVendedor(usuario, request);
        }

        // Asignar rol automáticamente
        actualizarRolSegunPerfiles(usuario);

        usuarioRepository.save(usuario);
    }

    // ==========================================
    // 2️⃣ ACTUALIZAR PERFIL (Edición desde Profile) - NUEVO MÉTODO
    // ==========================================
    @Transactional
    public UsuarioPerfilDTO actualizarPerfil(Long usuarioId, UpdatePerfilRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // --- 1. ACTUALIZAR DATOS BÁSICOS ---
        actualizarDatosBasicos(usuario, request.getNombre(), request.getApellidos(),
                request.getTelefono(), request.getEmail(), request.getDni(),
                request.getImagenPerfilUrl());

        // --- 2. CAMBIO DE CONTRASEÑA (con validación de actual) ---
        if (request.getNuevaPassword() != null && !request.getNuevaPassword().isBlank()) {
            if (request.getPasswordActual() == null || request.getPasswordActual().isBlank()) {
                throw new RuntimeException("Debes introducir tu contraseña actual");
            }
            if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPassword())) {
                throw new RuntimeException("La contraseña actual no es correcta");
            }
            if (request.getNuevaPassword().length() < 8) {
                throw new RuntimeException("La nueva contraseña debe tener al menos 8 caracteres");
            }
            usuario.setPassword(passwordEncoder.encode(request.getNuevaPassword()));
            usuario.setCambiarPasswd(false);
        }

        // --- 3. GESTIONAR PERFIL DE INTERESADO ---
        boolean quiereSerInteresado = request.getPerfil() != null
                && (request.getPerfil().equals("interesado") || request.getPerfil().equals("ambos"));

        Interesado interesadoExistente = interesadoRepository.findByUsuario(usuario).orElse(null);

        if (quiereSerInteresado) {
            if (interesadoExistente == null) {
                // No tenía → crear
                crearInteresadoDesdeUpdate(usuario, request);
            } else {
                // Ya tenía → actualizar
                actualizarInteresado(interesadoExistente, request);
            }
        }
        // OPCIONAL: Si NO quiere ser interesado y ya lo era, podemos eliminarlo
        // Por seguridad, lo dejamos comentado (conserva histórico)
        /*
         * else if (interesadoExistente != null) {
         * interesadoRepository.delete(interesadoExistente);
         * }
         */

        // --- 4. GESTIONAR PERFIL DE VENDEDOR ---
        boolean quiereSerVendedor = request.getPerfil() != null
                && (request.getPerfil().equals("propietario") || request.getPerfil().equals("ambos"));

        Vendedor vendedorExistente = vendedorRepository.findByUsuario(usuario).orElse(null);

        if (quiereSerVendedor) {
            if (vendedorExistente == null) {
                crearVendedorDesdeUpdate(usuario, request);
            } else {
                actualizarVendedor(vendedorExistente, request);
            }
        }

        // --- 5. ACTUALIZAR ROL ---
        actualizarRolSegunPerfiles(usuario);

        usuarioRepository.save(usuario);

        return buildPerfilDTO(usuario);
    }

    // ==========================================
    // MÉTODOS PRIVADOS REUTILIZABLES
    // ==========================================

    private void actualizarDatosBasicos(Usuario usuario, String nombre, String apellidos,
            String telefono, String email, String dni,
            String imagenPerfilUrl) {
        if (nombre != null && !nombre.isBlank())
            usuario.setNombre(nombre.trim());
        if (apellidos != null && !apellidos.isBlank())
            usuario.setApellidos(apellidos.trim());
        if (telefono != null && !telefono.isBlank())
            usuario.setTelefono(telefono.trim());
        if (email != null && !email.isBlank())
            usuario.setEmail(email.trim().toLowerCase());
        if (dni != null && !dni.isBlank())
            usuario.setDni(dni.trim().toUpperCase());
        if (imagenPerfilUrl != null)
            usuario.setImagenPerfilUrl(imagenPerfilUrl);
    }

    private void crearInteresado(Usuario usuario, OnboardingRequest request) {
        Interesado interesado = new Interesado();
        interesado.setUsuario(usuario);
        interesado.setPresupuestoMaximo(request.getPresupuestoMaximo());
        interesado.setZonaInteres(request.getZonaInteres());
        interesado.setHabitacionesMinimas(request.getHabitacionesMinimas());
        interesado.setBanosMinimos(request.getBanosMinimos());
        setTipoBusqueda(interesado, request.getTipoOperacion());
        interesado.setObservaciones(request.getComentariosExtra());
        interesadoRepository.save(interesado);
    }

    private void crearInteresadoDesdeUpdate(Usuario usuario, UpdatePerfilRequest request) {
        Interesado interesado = new Interesado();
        interesado.setUsuario(usuario);
        actualizarInteresado(interesado, request);
        interesadoRepository.save(interesado);
    }

    private void actualizarInteresado(Interesado interesado, UpdatePerfilRequest request) {
        if (request.getPresupuestoMaximo() != null)
            interesado.setPresupuestoMaximo(request.getPresupuestoMaximo());
        if (request.getZonaInteres() != null)
            interesado.setZonaInteres(request.getZonaInteres());
        if (request.getHabitacionesMinimas() != null)
            interesado.setHabitacionesMinimas(request.getHabitacionesMinimas());
        if (request.getBanosMinimos() != null)
            interesado.setBanosMinimos(request.getBanosMinimos());
        if (request.getTipoOperacion() != null)
            setTipoBusqueda(interesado, request.getTipoOperacion());
        if (request.getObservacionesInteresado() != null)
            interesado.setObservaciones(request.getObservacionesInteresado());

        interesadoRepository.save(interesado);
    }

    private void crearVendedor(Usuario usuario, OnboardingRequest request) {
        Vendedor vendedor = new Vendedor();
        vendedor.setUsuario(usuario);

        StringBuilder obs = new StringBuilder();
        if (request.getDetallesPropiedad() != null && !request.getDetallesPropiedad().isBlank()) {
            obs.append(request.getDetallesPropiedad().trim());
        }
        if (request.getComentariosExtra() != null && !request.getComentariosExtra().isBlank()) {
            if (obs.length() > 0)
                obs.append(". ");
            obs.append(request.getComentariosExtra().trim());
        }
        vendedor.setObservaciones(obs.length() > 0 ? obs.toString() : null);
        vendedorRepository.save(vendedor);
    }

    private void crearVendedorDesdeUpdate(Usuario usuario, UpdatePerfilRequest request) {
        Vendedor vendedor = new Vendedor();
        vendedor.setUsuario(usuario);
        actualizarVendedor(vendedor, request);
        vendedorRepository.save(vendedor);
    }

    private void actualizarVendedor(Vendedor vendedor, UpdatePerfilRequest request) {
        if (request.getObservacionesVendedor() != null) {
            vendedor.setObservaciones(request.getObservacionesVendedor());
        }
        vendedorRepository.save(vendedor);
    }

    private void setTipoBusqueda(Interesado interesado, String tipoOperacion) {
        if (tipoOperacion != null && !tipoOperacion.isBlank()) {
            try {
                interesado.setTipoBusqueda(TipoOperacion.valueOf(tipoOperacion));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException(
                        "Tipo de operación no válido: " + tipoOperacion
                                + ". Valores permitidos: VENTA, ALQUILER, CUALQUIERA");
            }
        }
    }

    private void actualizarRolSegunPerfiles(Usuario usuario) {
        boolean esInteresado = interesadoRepository.existsByUsuario(usuario);
        boolean esVendedor = vendedorRepository.existsByUsuario(usuario);

        if (esInteresado && esVendedor) {
            usuario.setRole(Role.ROLE_AMBOS);
        } else if (esInteresado) {
            usuario.setRole(Role.ROLE_INTERESADO);
        } else if (esVendedor) {
            usuario.setRole(Role.ROLE_VENDEDOR);
        }
    }
}