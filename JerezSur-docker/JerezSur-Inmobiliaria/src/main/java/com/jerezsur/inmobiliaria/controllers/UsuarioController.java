package com.jerezsur.inmobiliaria.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.services.PerfilService;
import com.jerezsur.inmobiliaria.services.UsuarioService;
import com.jerezsur.inmobiliaria.dto.RegistroRequest;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

import com.jerezsur.inmobiliaria.dto.LoginRequest;
import com.jerezsur.inmobiliaria.dto.LoginResponseDTO;
import com.jerezsur.inmobiliaria.dto.OnboardingRequest;
import com.jerezsur.inmobiliaria.dto.UpdatePerfilRequest;
import com.jerezsur.inmobiliaria.dto.UsuarioPerfilDTO;
import com.jerezsur.inmobiliaria.services.AuthService;

import java.util.Map;

// Este controlador maneja todas las peticiones relacionadas con los usuarios:
// registro, login, autenticación social (Google, Facebook, Apple) y gestión de perfil.
// @Slf4j nos da el logger sin tener que declararlo a mano
@Slf4j
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    // Inyectamos los servicios que necesita este controlador
    @Autowired private UsuarioService usuarioService;
    @Autowired private PerfilService  perfilService;
    @Autowired private AuthService    authService;

    // Devuelve la lista completa de usuarios (solo para uso interno/admin)
    @GetMapping
    public ResponseEntity<?> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // ── REGISTRO Y LOGIN TRADICIONAL ──────────────────────────────────

    // Cuando el usuario manda sus datos de registro, los validamos y los guardamos en BD
    // @Valid activa las validaciones del DTO (campos obligatorios, formato email, etc.)
    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroRequest request) {
        try {
            return ResponseEntity.ok(usuarioService.registrarUsuario(request));
        } catch (BusinessValidationException e) {
            // Error de lógica de negocio (email duplicado, etc.) → 400 Bad Request
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al registrar usuario", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al procesar el registro."));
        }
    }

    // Endpoint de login tradicional con email/teléfono y contraseña
    // Devuelve un JWT que el frontend guarda en localStorage para las siguientes peticiones
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponseDTO response = authService.processLocalLogin(
                    loginRequest.getUsername(), loginRequest.getPassword());
            log.info("Login exitoso para: {}", loginRequest.getUsername());
            return ResponseEntity.ok(response);
        } catch (BusinessValidationException e) {
            log.warn("Login fallido para {}: {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado en login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al iniciar sesión."));
        }
    }

    // ── AUTENTICACIÓN SOCIAL ──────────────────────────────────────────
    // Los siguientes tres endpoints reciben el token del proveedor social
    // y lo validan contra sus APIs para obtener los datos del usuario

    // Recibe el token de identidad de Google y crea o recupera el usuario
    @PostMapping("/auth/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.processGoogleAuth(body.get("token")));
        } catch (BusinessValidationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error en Google Auth", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error en autenticación con Google."));
        }
    }

    @PostMapping("/auth/facebook")
    public ResponseEntity<?> facebookLogin(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.processFacebookAuth(body.get("token")));
        } catch (BusinessValidationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error en Facebook Auth", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error en autenticación con Facebook."));
        }
    }

    @PostMapping("/auth/apple")
    public ResponseEntity<?> appleLogin(@RequestBody Map<String, String> body) {
        try {
            LoginResponseDTO user = authService.processAppleAuth(
                    body.get("email"), body.get("name"), body.get("token"));
            return ResponseEntity.ok(user);
        } catch (BusinessValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error en Apple Auth", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error en autenticación con Apple."));
        }
    }

    // ── PERFIL ────────────────────────────────────────────────────────

    // Devuelve todos los datos del perfil de un usuario (incluyendo interesado y vendedor)
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPerfil(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(perfilService.obtenerPerfil(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // Actualiza los datos del perfil: datos básicos, contraseña, y perfiles asociados
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPerfil(@PathVariable Long id,
                                              @RequestBody UpdatePerfilRequest request) {
        try {
            return ResponseEntity.ok(perfilService.actualizarPerfil(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Endpoint del onboarding: el usuario recién registrado completa sus datos y elige perfil
    // (interesado, propietario o ambos)
    @PostMapping("/completar")
    public ResponseEntity<?> completarPerfil(@RequestBody OnboardingRequest request) {
        try {
            if (request.getUsuarioId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El ID del usuario es obligatorio"));
            }
            perfilService.completarPerfil(request);
            return ResponseEntity.ok(Map.of("message", "Perfil completado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Borrado lógico: no borramos de la BD, sino que marcamos la cuenta como desactivada
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
