package com.jerezsur.inmobiliaria.services;

import java.time.LocalDate;

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
import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;

import org.springframework.security.crypto.password.PasswordEncoder;

// Servicio que gestiona el perfil completo del usuario.
// Un usuario puede tener uno o varios "subperfiles" según su rol:
//   - Interesado: busca inmuebles para comprar o alquilar
//   - Vendedor: tiene inmuebles que quiere vender
//   - Trabajador: empleado de la agencia con acceso al panel admin
// Este servicio maneja la creación, actualización y vinculación de esos subperfiles.
@Service
public class PerfilService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private InteresadoRepository interesadoRepository;

    @Autowired
    private VendedorRepository vendedorRepository;

    @Autowired
    private TrabajadorRepository trabajadorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private NotificacionService notificacionService;

    // ==========================================
    // BUILD DTO — construye el DTO completo del perfil incluyendo todos los subperfiles
    // ==========================================
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
        dto.setCuentaActivada(usuario.getCuentaActivada());
        dto.setOrigen(usuario.getOrigen());
        dto.setFechaRegistro(usuario.getFechaRegistro());

        // Trabajador
        Trabajador trabajador = trabajadorRepository.findByUsuario(usuario).orElse(null);
        if (trabajador != null) {
            dto.setTrabajadorId(trabajador.getId());
            dto.setCargo(trabajador.getCargo());
            dto.setDniTrabajador(trabajador.getDni());
            dto.setFechaInicioContrato(trabajador.getFechaInicioContrato());
            dto.setFechaFinContrato(trabajador.getFechaFinContrato());
            dto.setActivoTrabajador(trabajador.getActivo());
            dto.setObservacionesLaborales(trabajador.getObservacionesLaborales());
        }

        // Interesado (igual que lo tenías)
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

        // Vendedor (igual que lo tenías)
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
    // COMPLETAR PERFIL (Onboarding): el usuario recién registrado elige su rol
    // y rellena sus datos completos por primera vez
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
    // ACTUALIZAR PERFIL — versión ampliada
    // ==========================================
    @Transactional
    public UsuarioPerfilDTO actualizarPerfil(Long usuarioId, UpdatePerfilRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 1. DATOS BÁSICOS
        actualizarDatosBasicos(usuario, request.getNombre(), request.getApellidos(),
                request.getTelefono(), request.getEmail(), request.getDni(),
                request.getImagenPerfilUrl());

        // 2. CAMBIO DE CONTRASEÑA (solo si viene nueva)
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

        if (request.getCambiarPasswd() != null) {
            usuario.setCambiarPasswd(request.getCambiarPasswd());
        }

        // 3. GESTIONAR PERFIL DE TRABAJADOR
        gestionarPerfilTrabajador(usuario, request);

        // 4. GESTIONAR PERFIL DE INTERESADO
        gestionarPerfilInteresado(usuario, request);

        // 5. GESTIONAR PERFIL DE VENDEDOR
        gestionarPerfilVendedor(usuario, request);

        // 6. ROL Y ESTADO DE CUENTA
        if (request.getRole() != null && !request.getRole().isBlank()) {
            usuario.setRole(Role.valueOf(request.getRole()));
        } else if (request.getPerfil() != null) {
            // Solo auto-calcular el rol si no viene explícito
            actualizarRolSegunPerfiles(usuario);
        }

        if (request.getCuentaActivada() != null) {
            usuario.setCuentaActivada(request.getCuentaActivada());
        }

        usuarioRepository.save(usuario);
        return buildPerfilDTO(usuario);
    }

    // ==========================================
    // MÉTODOS PRIVADOS REUTILIZABLES
    // ==========================================

    // Crea o actualiza el perfil de trabajador de un usuario
    // Si desvincularTrabajador=true, desvincula al usuario del trabajador (sin borrar el trabajador)
    private void gestionarPerfilTrabajador(Usuario usuario, UpdatePerfilRequest request) {
        // Desvinculación explícita
        if (Boolean.TRUE.equals(request.getDesvincularTrabajador())) {
            trabajadorRepository.findByUsuario(usuario)
                    .ifPresent(t -> {
                        t.setUsuario(null);
                        trabajadorRepository.save(t);
                        // Si quieres eliminación física en vez de desvinculación, usa:
                        // trabajadorRepository.delete(t);
                    });
            return;
        }

        boolean quiereSerTrabajador = "trabajador".equals(request.getPerfil());
        if (!quiereSerTrabajador)
            return;

        Trabajador trabajador = trabajadorRepository.findByUsuario(usuario)
                .orElse(null);

        if (trabajador == null) {
            // Crear nuevo trabajador
            if (request.getDniTrabajador() == null || request.getDniTrabajador().isBlank()) {
                throw new BusinessValidationException("El DNI es obligatorio para crear un trabajador");
            }
            if (request.getFechaInicioContrato() == null) {
                throw new BusinessValidationException("La fecha de inicio de contrato es obligatoria");
            }
            if (trabajadorRepository.existsByDni(request.getDniTrabajador())) {
                throw new BusinessValidationException(
                        "Ya existe un trabajador con el DNI: " + request.getDniTrabajador());
            }
            trabajador = new Trabajador();
            trabajador.setUsuario(usuario);
        }

        // Actualizar campos (tanto en creación como en edición)
        actualizarTrabajador(trabajador, request);
        trabajadorRepository.save(trabajador);
    }

    private void actualizarTrabajador(Trabajador trabajador, UpdatePerfilRequest request) {
        if (request.getDniTrabajador() != null && !request.getDniTrabajador().isBlank())
            trabajador.setDni(request.getDniTrabajador().trim().toUpperCase());
        if (request.getCargo() != null)
            trabajador.setCargo(request.getCargo().trim());
        if (request.getFechaInicioContrato() != null)
            trabajador.setFechaInicioContrato(request.getFechaInicioContrato());
        if (request.getFechaFinContrato() != null)
            trabajador.setFechaFinContrato(request.getFechaFinContrato());
        if (request.getActivoTrabajador() != null)
            trabajador.setActivo(request.getActivoTrabajador());
        if (request.getObservacionesLaborales() != null)
            trabajador.setObservacionesLaborales(request.getObservacionesLaborales());
    }

    private void gestionarPerfilInteresado(Usuario usuario, UpdatePerfilRequest request) {
        if (Boolean.TRUE.equals(request.getDesvincularInteresado())) {
            interesadoRepository.findByUsuario(usuario)
                    .ifPresent(interesadoRepository::delete);
            return;
        }

        boolean quiereSerInteresado = "interesado".equals(request.getPerfil())
                || "ambos".equals(request.getPerfil());
        if (!quiereSerInteresado)
            return;

        Interesado interesado = interesadoRepository.findByUsuario(usuario).orElse(null);
        if (interesado == null) {
            interesado = new Interesado();
            interesado.setUsuario(usuario);
            crearTareaRevisionUsuario(usuario, "interesado");
            notificacionService.notificarNuevoInteresado(usuario);
        }
        actualizarInteresado(interesado, request);
    }

    private void gestionarPerfilVendedor(Usuario usuario, UpdatePerfilRequest request) {
        if (Boolean.TRUE.equals(request.getDesvincularVendedor())) {
            vendedorRepository.findByUsuario(usuario)
                    .ifPresent(vendedorRepository::delete);
            return;
        }

        boolean quiereSerVendedor = "propietario".equals(request.getPerfil())
                || "ambos".equals(request.getPerfil());
        if (!quiereSerVendedor)
            return;

        Vendedor vendedor = vendedorRepository.findByUsuario(usuario).orElse(null);
        if (vendedor == null) {
            vendedor = new Vendedor();
            vendedor.setUsuario(usuario);
            crearTareaRevisionUsuario(usuario, "vendedor");
            notificacionService.notificarNuevoVendedor(usuario);
        }
        actualizarVendedor(vendedor, request);
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
        if (request.getRequiereHipoteca() != null)
            interesado.setRequiereHipoteca(request.getRequiereHipoteca());
        interesadoRepository.save(interesado);
    }

    private void actualizarVendedor(Vendedor vendedor, UpdatePerfilRequest request) {
        if (request.getObservacionesVendedor() != null)
            vendedor.setObservaciones(request.getObservacionesVendedor());
        vendedorRepository.save(vendedor);
    }

    private void actualizarDatosBasicos(Usuario usuario, String nombre, String apellidos,
            String telefono, String email, String dni, String imagenPerfilUrl) {
        if (nombre != null && !nombre.isBlank())
            usuario.setNombre(nombre.trim());
        if (apellidos != null && !apellidos.isBlank())
            usuario.setApellidos(apellidos.trim());

        // Verificar que el teléfono no esté ya registrado en OTRO usuario antes de actualizar
        if (telefono != null && !telefono.isBlank()) {
            String telefonoNormalizado = telefono.trim();
            usuarioRepository.findByTelefono(telefonoNormalizado)
                    .ifPresent(existente -> {
                        if (!existente.getId().equals(usuario.getId())) {
                            throw new BusinessValidationException(
                                "El teléfono " + telefonoNormalizado + " ya está registrado en otra cuenta. "
                                + "Por favor, usa un número de teléfono diferente.");
                        }
                    });
            usuario.setTelefono(telefonoNormalizado);
        }

        if (email != null && !email.isBlank()) {
            String emailNormalizado = email.trim().toLowerCase();
            // Verificar email duplicado también
            usuarioRepository.findByEmail(emailNormalizado)
                    .ifPresent(existente -> {
                        if (!existente.getId().equals(usuario.getId())) {
                            throw new BusinessValidationException(
                                "El email " + emailNormalizado + " ya está registrado en otra cuenta.");
                        }
                    });
            usuario.setEmail(emailNormalizado);
        }

        if (dni != null && !dni.isBlank())
            usuario.setDni(dni.trim().toUpperCase());
        if (imagenPerfilUrl != null)
            usuario.setImagenPerfilUrl(imagenPerfilUrl);
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

    // Calcula y asigna el rol del usuario según los subperfiles que tenga activos.
    // El orden de prioridad es: trabajador > interesado+vendedor > interesado > vendedor
    private void actualizarRolSegunPerfiles(Usuario usuario) {
        boolean esTrabajador = trabajadorRepository.existsByUsuario(usuario);
        boolean esInteresado = interesadoRepository.existsByUsuario(usuario);
        boolean esVendedor = vendedorRepository.existsByUsuario(usuario);

        if (esTrabajador) {
            usuario.setRole(Role.ROLE_TRABAJADOR);
        } else if (esInteresado && esVendedor) {
            // Usuario que tiene tanto inmuebles propios como busca uno nuevo
            usuario.setRole(Role.ROLE_AMBOS);
        } else if (esInteresado) {
            usuario.setRole(Role.ROLE_INTERESADO);
        } else if (esVendedor) {
            usuario.setRole(Role.ROLE_VENDEDOR);
        }
    }

    private void crearTareaRevisionUsuario(Usuario usuario, String motivo) {
        String nombreCompleto = usuario.getNombre()
                + (usuario.getApellidos() != null ? " " + usuario.getApellidos() : "");

        String titulo = "👤 Revisar nuevo " + motivo + ": " + nombreCompleto;

        StringBuilder descripcion = new StringBuilder();
        if (usuario.getEmail() != null)
            descripcion.append("Email: ").append(usuario.getEmail()).append("\n");
        if (usuario.getTelefono() != null)
            descripcion.append("Teléfono: ").append(usuario.getTelefono()).append("\n");
        descripcion.append("Origen: ").append(usuario.getOrigen()).append("\n");
        descripcion.append("Motivo: ").append(motivo);

        Tarea tarea = Tarea.builder()
                .titulo(titulo)
                .descripcion(descripcion.toString())
                .fecha(LocalDate.now().plusDays(2))
                .prioridad("MEDIA")
                .enlace("/usuarios")
                .etiquetaEnlace("Ver usuarios")
                .fechaCreacion(LocalDate.now())
                .build();

        tareaRepository.save(tarea);
    }
}