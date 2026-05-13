package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.dto.CitaAnonimaRequest;
import com.jerezsur.inmobiliaria.models.*;
import com.jerezsur.inmobiliaria.models.enums.EstadoCita;
import com.jerezsur.inmobiliaria.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private InmuebleRepository inmuebleRepository;

    // Almacén temporal de códigos de verificación (en producción usar Redis)
    private final Map<String, CodigoVerificacion> codigosVerificacion = new ConcurrentHashMap<>();

    private static class CodigoVerificacion {
        String codigo;
        LocalDateTime expiracion;

        CodigoVerificacion(String codigo) {
            this.codigo = codigo;
            this.expiracion = LocalDateTime.now().plusMinutes(10);
        }

        boolean esValido(String intentoCodigo) {
            return this.codigo.equals(intentoCodigo)
                    && LocalDateTime.now().isBefore(this.expiracion);
        }
    }

    /**
     * Genera y "envía" un código de verificación al teléfono.
     * En producción, aquí iría Twilio o similar.
     */
    public String enviarCodigoVerificacion(String telefono) {
        if (telefono == null || telefono.isBlank()) {
            throw new RuntimeException("El teléfono es obligatorio");
        }

        String telefonoNormalizado = telefono.trim().replaceAll("[\\s\\-()]", "");

        // Generar código de 6 dígitos
        String codigo = String.format("%06d", new Random().nextInt(999999));

        codigosVerificacion.put(telefonoNormalizado, new CodigoVerificacion(codigo));

        // SIMULACIÓN: En producción enviar SMS real
        System.out.println("==============================================");
        System.out.println("CÓDIGO DE VERIFICACIÓN para " + telefonoNormalizado);
        System.out.println("Código: " + codigo);
        System.out.println("Expira en 10 minutos");
        System.out.println("==============================================");

        return "Código enviado al teléfono " + telefonoNormalizado;
    }

    /**
     * Verifica si el código es correcto para ese teléfono.
     */
    public boolean verificarCodigo(String telefono, String codigo) {
        String telefonoNormalizado = telefono.trim().replaceAll("[\\s\\-()]", "");
        CodigoVerificacion cv = codigosVerificacion.get(telefonoNormalizado);

        if (cv == null) return false;

        boolean valido = cv.esValido(codigo);

        if (valido) {
            codigosVerificacion.remove(telefonoNormalizado);
        }

        return valido;
    }

    /**
     * Crea una cita anónima (o vinculada si el teléfono ya existe como usuario).
     * Implementa la Opción C: busca usuario existente por teléfono.
     */
    @Transactional
    public Cita crearCitaAnonima(CitaAnonimaRequest request) {
        // Validaciones básicas
        if (request.getNombre() == null || request.getNombre().isBlank()) {
            throw new RuntimeException("El nombre es obligatorio");
        }
        if (request.getTelefono() == null || request.getTelefono().isBlank()) {
            throw new RuntimeException("El teléfono es obligatorio");
        }
        if (request.getFechaHoraDeseada() == null) {
            throw new RuntimeException("La fecha y hora son obligatorias");
        }
        if (request.getFechaHoraDeseada().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("La fecha debe ser futura");
        }

        // Verificar código
        if (!verificarCodigo(request.getTelefono(), request.getCodigoVerificacion())) {
            throw new RuntimeException("Código de verificación inválido o expirado");
        }

        String telefonoNormalizado = request.getTelefono().trim().replaceAll("[\\s\\-()]", "");

        Cita cita = new Cita();
        cita.setFechaHora(request.getFechaHoraDeseada());
        cita.setEstado(EstadoCita.PENDIENTE);
        cita.setMensajeSolicitud(request.getMensaje());

        // OPCIÓN C: Buscar si ya existe un usuario con ese teléfono
        Usuario usuarioExistente = usuarioRepository.findByTelefono(telefonoNormalizado).orElse(null);

        if (usuarioExistente != null) {
            // Vincular la cita al usuario existente
            cita.setUsuario(usuarioExistente);
            cita.setNombreAnonimo(null);
            cita.setTelefonoAnonimo(null);
            cita.setEmailAnonimo(null);
        } else {
            // Cita anónima: guardar datos de contacto
            cita.setUsuario(null);
            cita.setNombreAnonimo(request.getNombre().trim());
            cita.setTelefonoAnonimo(telefonoNormalizado);
            cita.setEmailAnonimo(
                request.getEmail() != null && !request.getEmail().isBlank()
                    ? request.getEmail().trim().toLowerCase()
                    : null
            );
        }

        // Vincular inmueble si se proporcionó
        if (request.getInmuebleId() != null) {
            Inmueble inmueble = inmuebleRepository.findById(request.getInmuebleId())
                    .orElseThrow(() -> new RuntimeException(
                        "Inmueble no encontrado con ID: " + request.getInmuebleId()
                    ));
            cita.setInmueble(inmueble);
        }

        // trabajador queda null hasta que un trabajador la apruebe

        return citaRepository.save(cita);
    }

    /**
     * Vincula citas anónimas antiguas cuando un usuario se registra.
     * Llamar desde el servicio de registro/onboarding.
     */
    @Transactional
    public int vincularCitasAnonimas(Usuario usuario) {
        if (usuario.getTelefono() == null) return 0;

        List<Cita> citasAnonimas = citaRepository
                .findByTelefonoAnonimoAndUsuarioIsNull(usuario.getTelefono());

        for (Cita cita : citasAnonimas) {
            cita.setUsuario(usuario);
            cita.setNombreAnonimo(null);
            cita.setTelefonoAnonimo(null);
            cita.setEmailAnonimo(null);
        }

        citaRepository.saveAll(citasAnonimas);
        return citasAnonimas.size();
    }
}