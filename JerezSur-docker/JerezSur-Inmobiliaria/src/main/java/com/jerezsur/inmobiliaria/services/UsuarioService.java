package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Tarea;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.models.enums.AuthProvider;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.repositories.TareaRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.jerezsur.inmobiliaria.dto.RegistroRequest;

// Servicio principal de usuarios: gestiona el CRUD, el login local y el registro social.
// Es el servicio más central del backend — casi todos los demás lo usan de alguna forma.
@Service
public class UsuarioService {

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private UsuarioRepository usuarioRepository;

    // BCrypt es el algoritmo de hashing de contraseñas que usa Spring Security por defecto
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Envía emails y WhatsApp al usuario en distintos momentos del flujo
    @Autowired
    private NotificacionService notificacionService;

    // Crea tareas automáticas en el dashboard cuando se registra un nuevo usuario
    @Autowired
    private TareaRepository tareaRepository;

    // ------------------------------------------------------------------
    // CRUD BASICO
    // ------------------------------------------------------------------

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findByFechaEliminacionIsNull();
    }

    // BUSCAR INDIVIDUAL
    @Transactional(readOnly = true)
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario con ID " + id + " no existe."));
    }

    // LOGIN POR PROVIDER SOCIAL (Google, Facebook, Apple)
    @Transactional
    public Usuario procesarLoginSocial(String email, String nombre, AuthProvider provider, String providerId) {

        // 1. Buscar por providerId (el ID único del proveedor — SIEMPRE presente)
        //    Esto cubre logins repetidos aunque cambie el email o no haya email
        var byProvider = usuarioRepository.findByProviderAndProviderId(provider, providerId);
        if (byProvider.isPresent()) {
            Usuario existente = byProvider.get();
            // Actualizamos el nombre por si cambió en la cuenta social
            if (nombre != null && !nombre.isBlank()) {
                existente.setNombre(nombre);
            }
            return usuarioRepository.save(existente);
        }

        // 2. Buscar por email (usuario existente que nunca usó OAuth)
        //    Solo si tenemos email válido
        if (email != null && !email.isBlank()) {
            var byEmail = usuarioRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                Usuario existente = byEmail.get();
                existente.setProvider(provider);
                existente.setProviderId(providerId);
                return usuarioRepository.save(existente);
            }
        }

        // 3. Usuario nuevo — crear cuenta
        String nombreFinal = (nombre != null && !nombre.isBlank()) ? nombre : "Usuario";
        String emailFinal  = (email  != null && !email.isBlank())  ? email  : null;

        Usuario nuevo = new Usuario();
        nuevo.setEmail(emailFinal);
        nuevo.setNombre(nombreFinal);
        nuevo.setRole(Role.ROLE_NOROL);
        nuevo.setProvider(provider);
        nuevo.setProviderId(providerId);
        nuevo.setCambiarPasswd(false);

        notificacionService.notificarNuevoUsuario(nuevo, null);
        Usuario guardado = usuarioRepository.save(nuevo);

        // Tarea para que el equipo complete el perfil del nuevo usuario
        tareaRepository.save(Tarea.builder()
            .titulo("👤 Nuevo usuario OAuth: " + nombreFinal)
            .descripcion("Proveedor: " + provider + "\n"
                + (emailFinal != null ? "Email: " + emailFinal + "\n" : "Sin email\n")
                + "Pendiente de completar perfil en onboarding.")
            .fecha(LocalDate.now().plusDays(2))
            .prioridad("MEDIA")
            .enlace("/usuarios")
            .etiquetaEnlace("Ver usuarios")
            .fechaCreacion(LocalDate.now())
            .build());

        return guardado;
    }

    // LOGIN (BUSCAR POR EMAIL O TELEFONO + VALIDAR CONTRASEÑA)
    @Transactional(readOnly = true)
    public Usuario login(String identifier, String password) {
        // Buscamos al usuario por email o teléfono (el identifier sirve para ambos)
        Usuario usuario = usuarioRepository.buscarPorEmailOTelefono(identifier)
                .orElseThrow(
                        () -> new BusinessValidationException("Credenciales incorrectas o usuario no encontrado."));

        // Verificamos si tiene password (casos de solo contacto no pueden loguearse)
        if (usuario.getPassword() == null) {
            throw new BusinessValidationException(
                    "Tu cuenta aún no tiene contraseña. Contacta con nosotros para activarla.");
        }

        // Comparamos la contraseña enviada con la cifrada en DB
        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new BusinessValidationException("Credenciales incorrectas.");
        }

        return usuario;
    }

    /**
     * MÉTODO PRINCIPAL PARA REGISTRO DE CLIENTES
     * Maneja los 3 escenarios:
     * 1. Registro web (trae password) -> Cifra y guarda.
     * 2. Formulario contacto (sin password) -> Guarda null y activa flag.
     * 3. Alta por trabajador (sin password) -> Guarda null y activa flag.
     */
    @Transactional
    public Usuario registrarUsuario(RegistroRequest request) {
        Usuario usuario = new Usuario();
        usuario.setEmail(nullIfEmpty(request.getEmail()));
        usuario.setTelefono(nullIfEmpty(request.getTelefono()));
        usuario.setNombre(request.getNombre());
        usuario.setApellidos(request.getApellidos());
        usuario.setPassword(nullIfEmpty(request.getPassword()));
        usuario.setDni(nullIfEmpty(request.getDni()));

        validarDatos(usuario);

        // Lógica de Contraseña
        if (usuario.getPassword() != null && !usuario.getPassword().trim().isEmpty()) {
            // Escenario 1: El usuario puso una contraseña
            String passCifrada = passwordEncoder.encode(usuario.getPassword());
            usuario.setPassword(passCifrada);
            usuario.setCambiarPasswd(false);
            usuario.setProvider(AuthProvider.LOCAL);
        } else {
            // Escenarios 2 y 3: No hay contraseña todavía
            usuario.setPassword(null);
            usuario.setCambiarPasswd(true); // Obligatorio cambiarla al entrar
            usuario.setProvider(AuthProvider.LOCAL);
        }

        usuario.setRole(Role.ROLE_NOROL);

        // Generar token de verificación de email
        String token = UUID.randomUUID().toString();
        usuario.setTokenVerificacion(token);

        Usuario guardado = usuarioRepository.save(usuario);
        notificacionService.notificarNuevoUsuario(guardado, token);

        // Tarea para que el equipo revise el nuevo registro
        tareaRepository.save(Tarea.builder()
            .titulo("👤 Nuevo registro: " + guardado.getNombre())
            .descripcion(
                (guardado.getEmail() != null ? "Email: " + guardado.getEmail() + "\n" : "") +
                (guardado.getTelefono() != null ? "Tel: " + guardado.getTelefono() + "\n" : "") +
                "Pendiente de completar onboarding.")
            .fecha(LocalDate.now().plusDays(2))
            .prioridad("MEDIA")
            .enlace("/usuarios")
            .etiquetaEnlace("Ver usuarios")
            .fechaCreacion(LocalDate.now())
            .build());

        return guardado;
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

    // ELIMINAR (Soft Delete)
    @Transactional
    public void eliminar(Long id) {
        // 1. Buscamos al usuario completo en lugar de solo comprobar si existe
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se puede eliminar: El usuario con ID " + id + " no existe."));

        // 2. Cambiamos su estado para el borrado lógico
        usuario.setCuentaActivada(false); // O si prefieres: usuario.setEliminado(true);

        // 3. Registramos la fecha de eliminación para el método de limpieza posterior
        usuario.setFechaEliminacion(LocalDateTime.now());

        // 4. Guardamos los cambios (Hará un UPDATE automático en la base de datos)
        usuarioRepository.save(usuario);
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

        // 2. Validación de duplicados (CAMBIADO PARA OAUTH2 / GOOGLE)
        if (usuario.getId() == null) {
            // Si es un registro normal (Local), comprobamos duplicados de forma estricta
            if (usuario.getProvider() == null || usuario.getProvider() == AuthProvider.LOCAL) {
                if (tieneEmail
                        && usuarioRepository.existePorEmailOTelefono(usuario.getEmail(), usuario.getTelefono())) {
                    throw new BusinessValidationException("El email " + usuario.getEmail() + " o el teléfono "
                            + usuario.getTelefono() + " ya está registrado.");
                }
            }
            // Si es de Google, solo debería saltar el error si el email ya existe PERO con
            // proveedor 'local'
            // (Evita que alguien se registre con contraseña usando el email de alguien de
            // Google)
            else if (usuario.getProvider() == AuthProvider.GOOGLE) {
                // Aquí puedes permitir el flujo de login/registro de Google libremente
                // ya que tu servicio se encargará de "mapear" o "recuperar" el usuario
                // existente.
            }
        }

        // 3. Validación de Password (removida porque se valida en el DTO
        // RegistroRequest)
        // Se deja para otros flujos si es necesario, pero idealmente migrar a DTOs
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()
                && !usuario.getPassword().startsWith("$2a$")) {
            // Si no empieza por $2a$ asumimos que no está encriptada y validamos
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

    private String nullIfEmpty(String str) {
        return (str == null || str.trim().isEmpty()) ? null : str.trim();
    }
}