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

    /**
     * Completa el perfil del usuario.
     * Solo actualiza campos que vienen con valor (no sobreescribe con null).
     */
    @Transactional
    public void completarPerfil(OnboardingRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // --- 1. ACTUALIZAR DATOS DEL USUARIO ---

        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            usuario.setNombre(request.getNombre().trim());
        }

        if (request.getApellidos() != null && !request.getApellidos().isBlank()) {
            usuario.setApellidos(request.getApellidos().trim());
        }

        if (request.getTelefono() != null && !request.getTelefono().isBlank()) {
            usuario.setTelefono(request.getTelefono().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            usuario.setEmail(request.getEmail().trim().toLowerCase());
        }

        if (request.getDni() != null && !request.getDni().isBlank()) {
            usuario.setDni(request.getDni().trim().toUpperCase());
        }

        // --- 2. CAMBIO DE CONTRASEÑA ---

        if (request.getNuevaPassword() != null && !request.getNuevaPassword().isBlank()) {
            if (request.getNuevaPassword().length() < 8) {
                throw new RuntimeException("La contraseña debe tener al menos 8 caracteres");
            }
            usuario.setPassword(passwordEncoder.encode(request.getNuevaPassword()));
            usuario.setCambiarPasswd(false);
        }

        // --- 3. CREAR INTERESADO ---

        boolean tieneInteresado = interesadoRepository.existsByUsuario(usuario);

        if (request.getPerfil() != null
                && (request.getPerfil().equals("interesado") || request.getPerfil().equals("ambos"))
                && !tieneInteresado) {

            Interesado interesado = new Interesado();
            interesado.setUsuario(usuario);
            interesado.setPresupuestoMaximo(request.getPresupuestoMaximo());
            interesado.setZonaInteres(request.getZonaInteres());
            interesado.setHabitacionesMinimas(request.getHabitacionesMinimas());
            interesado.setBanosMinimos(request.getBanosMinimos());

            // Mapear tipoOperacion al enum
            if (request.getTipoOperacion() != null && !request.getTipoOperacion().isBlank()) {
                try {
                    interesado.setTipoBusqueda(TipoOperacion.valueOf(request.getTipoOperacion()));
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException(
                            "Tipo de operación no válido: " + request.getTipoOperacion()
                                    + ". Valores permitidos: VENTA, ALQUILER, CUALQUIERA");
                }
            }

            interesado.setObservaciones(request.getComentariosExtra());
            interesadoRepository.save(interesado);
        }

        // --- 4. CREAR VENDEDOR ---

        boolean tieneVendedor = vendedorRepository.existsByUsuario(usuario);

        if (request.getPerfil() != null
                && (request.getPerfil().equals("propietario") || request.getPerfil().equals("ambos"))
                && !tieneVendedor) {

            Vendedor vendedor = new Vendedor();
            vendedor.setUsuario(usuario);

            // Construir observaciones sin nulls
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

        // --- 5. ASIGNAR ROL ---

        boolean esInteresado = interesadoRepository.existsByUsuario(usuario);
        boolean esVendedor = vendedorRepository.existsByUsuario(usuario);

        if (esInteresado && esVendedor) {
            usuario.setRole(Role.ROLE_AMBOS);
        } else if (esInteresado) {
            usuario.setRole(Role.ROLE_INTERESADO);
        } else if (esVendedor) {
            usuario.setRole(Role.ROLE_VENDEDOR);
        }

        usuarioRepository.save(usuario);
    }

    /**
     * Obtiene el perfil completo de un usuario por su ID.
     * Lanza EntityNotFoundException si no existe.
     */
    public UsuarioPerfilDTO obtenerPerfil(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Usuario no encontrado con ID: " + usuarioId));

        return buildPerfilDTO(usuario);
    }
}