package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.services.PerfilService;
import com.jerezsur.inmobiliaria.services.UsuarioService;
import com.jerezsur.inmobiliaria.dto.RegistroRequest;
import jakarta.validation.Valid;

import jakarta.persistence.EntityNotFoundException;

import com.jerezsur.inmobiliaria.dto.LoginRequest;
import com.jerezsur.inmobiliaria.dto.LoginResponseDTO;
import com.jerezsur.inmobiliaria.dto.OnboardingRequest;
import com.jerezsur.inmobiliaria.dto.UpdatePerfilRequest;
import com.jerezsur.inmobiliaria.dto.UsuarioPerfilDTO;
import com.jerezsur.inmobiliaria.services.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PerfilService perfilService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<?> listarUsuarios() {
        try {
            return ResponseEntity.ok(usuarioService.listarTodos());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al listar usuarios: " + e.getMessage()));
        }
    }

    // --- REGISTRO Y LOGIN TRADICIONAL ---

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroRequest request) {
        try {
            Usuario guardado = usuarioService.registrarUsuario(request);
            return ResponseEntity.ok(guardado);
        } catch (BusinessValidationException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error real: " + e.toString());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("🔴 [AUTH LOG] Petición de login recibida.");
        System.out.println("   -> Username/Email recibido: '" + loginRequest.getUsername() + "'");
        System.out.println("   -> Password proporcionada: " + (loginRequest.getPassword() != null ? "SÍ" : "NO"));
        try {
            LoginResponseDTO response = authService.processLocalLogin(
                    loginRequest.getUsername(),
                    loginRequest.getPassword());
            System.out.println("🟢 [AUTH LOG] Login exitoso para el usuario: " + response.getEmail());
            return ResponseEntity.ok(response);
        } catch (BusinessValidationException e) {
            System.out.println("❌ [AUTH LOG] Error de validación de negocio en login: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            System.out.println("💥 [AUTH LOG] Excepción inesperada durante el login:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al iniciar sesión.");
        }
    }

    // --- AUTENTICACIÓN SOCIAL ---

    @PostMapping("/auth/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        try {
            LoginResponseDTO user = authService.processGoogleAuth(body.get("token"));
            return ResponseEntity.ok(user);
        } catch (BusinessValidationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error en Google Auth: " + e.getMessage());
        }
    }

    @PostMapping("/auth/facebook")
    public ResponseEntity<?> facebookLogin(@RequestBody Map<String, String> body) {
        try {
            LoginResponseDTO user = authService.processFacebookAuth(body.get("token"));
            return ResponseEntity.ok(user);
        } catch (BusinessValidationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error en Facebook Auth");
        }
    }

    @PostMapping("/auth/apple")
    public ResponseEntity<?> appleLogin(@RequestBody Map<String, String> body) {
        try {
            LoginResponseDTO user = authService.processAppleAuth(
                    body.get("email"),
                    body.get("name"),
                    body.get("token"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error en Apple Auth");
        }
    }

    /**
     * GET /api/usuarios/{id}
     * Devuelve el perfil completo del usuario como DTO seguro.
     * Solo el propio usuario debería poder acceder a sus datos.
     */
    @GetMapping("/{id}")
    // @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<?> obtenerPerfil(@PathVariable Long id) {
        try {
            UsuarioPerfilDTO dto = perfilService.obtenerPerfil(id);
            return ResponseEntity.ok(dto);

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener el perfil: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/usuarios/{id}
     * Actualiza el perfil del usuario.
     * Solo el propio usuario debería poder actualizar sus datos.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPerfil(
            @PathVariable Long id,
            @RequestBody UpdatePerfilRequest request) {
        try {
            UsuarioPerfilDTO actualizado = perfilService.actualizarPerfil(id, request);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/usuarios/completar
     * Completa el onboarding del usuario.
     */
    @PostMapping("/completar")
    public ResponseEntity<?> completarPerfil(@RequestBody OnboardingRequest request) {
        try {
            if (request.getUsuarioId() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El ID del usuario es obligatorio"));
            }

            perfilService.completarPerfil(request);

            return ResponseEntity.ok(Map.of("message", "Perfil completado correctamente"));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al procesar el perfil: " + e.getMessage()));
        }
    }

    // --- ELIMINAR USUARIO ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}