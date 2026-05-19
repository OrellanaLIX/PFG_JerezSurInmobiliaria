package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.services.PerfilService;
import com.jerezsur.inmobiliaria.services.UsuarioService;

import jakarta.persistence.EntityNotFoundException;

import com.jerezsur.inmobiliaria.dto.LoginRequest;
import com.jerezsur.inmobiliaria.dto.OnboardingRequest;
import com.jerezsur.inmobiliaria.dto.UpdatePerfilRequest;
import com.jerezsur.inmobiliaria.dto.UsuarioPerfilDTO;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.util.Collections;
import java.util.Map;

import com.jerezsur.inmobiliaria.models.enums.AuthProvider;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PerfilService perfilService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    // --- REGISTRO Y LOGIN TRADICIONAL ---

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            Usuario guardado = usuarioService.registrarUsuario(usuario);
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
        try {
            Usuario usuario = usuarioService.login(
                    loginRequest.getUsername(),
                    loginRequest.getPassword());
            return ResponseEntity.ok(usuario);
        } catch (BusinessValidationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al iniciar sesión.");
        }
    }

    // --- AUTENTICACIÓN SOCIAL ---

    @PostMapping("/auth/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                Usuario user = usuarioService.procesarLoginSocial(
                        payload.getEmail(),
                        (String) payload.get("name"),
                        AuthProvider.GOOGLE,
                        payload.getSubject());
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token de Google inválido");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error en Google Auth: " + e.getMessage());
        }
    }

    @PostMapping("/auth/facebook")
    public ResponseEntity<?> facebookLogin(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            // Validamos contra la Graph API de Facebook
            String url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + token;
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> fbResponse = restTemplate.getForObject(url, Map.class);

            if (fbResponse != null && fbResponse.containsKey("email")) {
                Usuario user = usuarioService.procesarLoginSocial(
                        (String) fbResponse.get("email"),
                        (String) fbResponse.get("name"),
                        AuthProvider.FACEBOOK,
                        (String) fbResponse.get("id"));
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token de Facebook inválido");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error en Facebook Auth");
        }
    }

    @PostMapping("/auth/apple")
    public ResponseEntity<?> appleLogin(@RequestBody Map<String, String> body) {
        // Nota: Apple requiere una validación de clave pública compleja o usar una
        // librería JWT.
        // Aquí simulamos la recepción del email que Apple envía en el primer login.
        try {
            String email = body.get("email");
            String name = body.get("name");
            String appleId = body.get("token"); // Usamos el identificador único

            Usuario user = usuarioService.procesarLoginSocial(email, name, AuthProvider.APPLE, appleId);
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
}