package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.dto.LoginRequest;
import com.jerezsur.inmobiliaria.dto.LoginResponseDTO;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import com.jerezsur.inmobiliaria.services.AuthAdminService;
import com.jerezsur.inmobiliaria.services.NotificacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

// Controlador de autenticación general: login del admin, verificación de email
// y flujo de recuperación de contraseña (solicitar enlace + resetear con token).
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthAdminController {

    private final AuthAdminService authAdminService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    // NotificacionService envía el email con el enlace de recuperación de contraseña
    private final NotificacionService notificacionService;

    // URL base de la aplicación, usada para construir los enlaces de los emails
    @Value("${app.base-url:http://localhost}")
    private String baseUrl;

    // ── LOGIN ADMIN ───────────────────────────────────────────────────────────

    // Solo los usuarios con perfil de Trabajador pueden entrar al panel
    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(@Valid @RequestBody LoginRequest dto) {
        try {
            LoginResponseDTO response = authAdminService.loginAdmin(
                    dto.getUsername(),
                    dto.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── VERIFICAR CUENTA (enlace del email) ───────────────────────────────────

    /**
     * GET /api/auth/verificar?token=<uuid>
     * El usuario llega aquí desde el email. Activa la cuenta y redirige al login.
     */
    @GetMapping("/verificar")
    public ResponseEntity<Void> verificarCuenta(@RequestParam String token) {
        Usuario usuario = usuarioRepository.findByTokenVerificacion(token).orElse(null);

        if (usuario == null) {
            // Token inválido → redirige al login con error
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(baseUrl + "/acceder?verificado=error"))
                    .build();
        }

        usuario.setCuentaActivada(true);
        usuario.setVerified(true);
        usuario.setTokenVerificacion(null);
        usuarioRepository.save(usuario);

        // Redirige al frontend con mensaje de éxito
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(baseUrl + "/acceder?verificado=ok"))
                .build();
    }

    // ── SOLICITAR RECUPERACIÓN DE CONTRASEÑA ──────────────────────────────────

    /**
     * POST /api/auth/solicitar-recuperacion
     * Body: { "email": "usuario@email.com" }
     * Genera un token UUID, lo guarda en el usuario y envía el email.
     * Responde siempre 200 (no revela si el email existe).
     */
    @PostMapping("/solicitar-recuperacion")
    public ResponseEntity<?> solicitarRecuperacion(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El email es obligatorio."));
        }

        usuarioRepository.findByEmail(email.trim().toLowerCase()).ifPresent(usuario -> {
            String token = UUID.randomUUID().toString();
            usuario.setTokenRecuperacion(token);
            usuario.setTokenRecuperacionExpira(LocalDateTime.now().plusHours(24));
            usuarioRepository.save(usuario);
            notificacionService.notificarRecuperarPassword(usuario, token);
        });

        return ResponseEntity.ok(Map.of("message",
                "Si el email existe en nuestro sistema, recibirás instrucciones en breve."));
    }

    // ── RESETEAR CONTRASEÑA ───────────────────────────────────────────────────

    /**
     * POST /api/auth/reset-password
     * Body: { "token": "...", "nuevaPassword": "..." }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String nuevaPassword = body.get("nuevaPassword");

        if (token == null || nuevaPassword == null || nuevaPassword.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Token y contraseña (mín. 8 caracteres) son obligatorios."));
        }

        Usuario usuario = usuarioRepository.findByTokenRecuperacion(token).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "El enlace de recuperación no es válido o ya fue usado."));
        }

        if (usuario.getTokenRecuperacionExpira() == null
                || LocalDateTime.now().isAfter(usuario.getTokenRecuperacionExpira())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "El enlace ha expirado. Solicita uno nuevo."));
        }

        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuario.setCambiarPasswd(false);
        usuario.setTokenRecuperacion(null);
        usuario.setTokenRecuperacionExpira(null);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente."));
    }
}