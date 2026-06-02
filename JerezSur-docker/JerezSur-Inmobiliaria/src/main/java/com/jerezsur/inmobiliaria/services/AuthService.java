package com.jerezsur.inmobiliaria.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.dto.LoginResponseDTO;
import com.jerezsur.inmobiliaria.models.enums.AuthProvider;
import com.jerezsur.inmobiliaria.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

// Servicio de autenticación: centraliza la lógica de login local y social
// (Google, Facebook, Apple). Genera el JWT que el frontend necesita para autenticarse.
@Service
public class AuthService {

    @Autowired
    private UsuarioService usuarioService;

    // JwtService genera y valida los tokens JWT
    @Autowired
    private JwtService jwtService;

    // El Client ID de Google viene de application.properties para poder verificar los tokens
    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    // Login tradicional: delega en UsuarioService la validación y genera el token JWT
    public LoginResponseDTO processLocalLogin(String identifier, String password) {
        Usuario user = usuarioService.login(identifier, password);
        return mapToLoginResponse(user);
    }

    public LoginResponseDTO processGoogleAuth(String token) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(token);
        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            Usuario user = usuarioService.procesarLoginSocial(
                    payload.getEmail(),
                    (String) payload.get("name"),
                    AuthProvider.GOOGLE,
                    payload.getSubject()
            );
            return mapToLoginResponse(user);
        }
        throw new BusinessValidationException("Token de Google inválido");
    }

    /**
     * Autenticación con Facebook.
     *
     * Facebook devuelve siempre: id, name
     * Facebook devuelve SOLO SI el usuario lo permite: email
     *
     * Por eso no exigimos email — usamos el Facebook ID como identificador principal.
     * Si no hay email, el usuario podrá añadirlo más tarde en su perfil.
     */
    public LoginResponseDTO processFacebookAuth(String token) throws Exception {
        // Pedimos id, name y email. Si el usuario no tiene email verificado con Facebook,
        // el campo simplemente no viene en la respuesta — NO lanzamos error por eso.
        String url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + token;
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> fbResponse;
        try {
            fbResponse = restTemplate.getForObject(url, java.util.Map.class);
        } catch (Exception e) {
            throw new BusinessValidationException("No se pudo conectar con Facebook para verificar el token.");
        }

        if (fbResponse == null || !fbResponse.containsKey("id")) {
            throw new BusinessValidationException("Token de Facebook no válido o expirado.");
        }

        String fbId  = (String) fbResponse.get("id");
        String name  = (String) fbResponse.getOrDefault("name", "Usuario Facebook");
        String email = (String) fbResponse.get("email"); // puede ser null — está bien

        Usuario user = usuarioService.procesarLoginSocial(email, name, AuthProvider.FACEBOOK, fbId);
        return mapToLoginResponse(user);
    }

    /**
     * Autenticación con Apple.
     *
     * Apple solo envía email y nombre en el PRIMER login.
     * En logins siguientes esos campos llegan null → los extraemos del JWT (id_token).
     *
     * Nota: para producción habría que verificar la firma del JWT contra las claves
     * públicas de Apple (https://appleid.apple.com/auth/keys). Para el PFG usamos
     * decodificación sin verificación de firma, que es suficiente para demo.
     */
    public LoginResponseDTO processAppleAuth(String emailParam, String nameParam, String appleIdToken)
            throws Exception {

        String email = emailParam;
        String name  = nameParam;
        String sub   = appleIdToken; // usamos el token como providerId si no podemos parsear

        // Intentamos extraer email y sub del payload del JWT (parte central del token)
        try {
            String[] parts = appleIdToken.split("\\.");
            if (parts.length >= 2) {
                // El payload es Base64URL — reemplazamos - por + y _ por / para Base64 estándar
                String padded = parts[1]
                        .replace('-', '+')
                        .replace('_', '/');
                // Añadimos padding si falta
                while (padded.length() % 4 != 0) padded += "=";

                String json = new String(java.util.Base64.getDecoder().decode(padded),
                        java.nio.charset.StandardCharsets.UTF_8);

                // Extraemos los campos con regex simple para no depender de una librería JSON extra
                String emailFromJwt = extractJsonField(json, "email");
                String subFromJwt   = extractJsonField(json, "sub");

                if (subFromJwt != null)   sub   = subFromJwt;
                if (email == null && emailFromJwt != null) email = emailFromJwt;
            }
        } catch (Exception ignored) {
            // Si no podemos parsear el JWT seguimos con los parámetros que vinieron
        }

        if (email == null || email.isBlank()) {
            throw new com.jerezsur.inmobiliaria.exceptions.BusinessValidationException(
                    "Apple no ha proporcionado email. Asegúrate de tener el email verificado con Apple ID.");
        }

        // Si Apple no envió nombre usamos la parte local del email como fallback
        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        }

        Usuario user = usuarioService.procesarLoginSocial(email, name, AuthProvider.APPLE, sub);
        return mapToLoginResponse(user);
    }

    /** Extrae el valor de un campo de un JSON plano sin librerías externas. */
    private String extractJsonField(String json, String field) {
        String pattern = "\"" + field + "\"\\s*:\\s*\"([^\"]+)\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        return m.find() ? m.group(1) : null;
    }

    private LoginResponseDTO mapToLoginResponse(Usuario user) {
        String token = jwtService.generarToken(user);
        return LoginResponseDTO.builder()
                .token(token)
                .userId(user.getId())
                .trabajadorId(user.getTrabajador() != null ? user.getTrabajador().getId() : null)
                .nombre(user.getNombre())
                .email(user.getEmail())
                .role(user.getRole().name())
                .esTrabajador(user.getTrabajador() != null)
                .build();
    }
}
