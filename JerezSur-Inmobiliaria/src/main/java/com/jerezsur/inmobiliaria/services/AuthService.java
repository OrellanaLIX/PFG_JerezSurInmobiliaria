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

@Service
public class AuthService {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtService jwtService;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

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

    public LoginResponseDTO processFacebookAuth(String token) throws Exception {
        String url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + token;
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> fbResponse = restTemplate.getForObject(url, Map.class);

        if (fbResponse != null && fbResponse.containsKey("email")) {
            Usuario user = usuarioService.procesarLoginSocial(
                    (String) fbResponse.get("email"),
                    (String) fbResponse.get("name"),
                    AuthProvider.FACEBOOK,
                    (String) fbResponse.get("id")
            );
            return mapToLoginResponse(user);
        }
        throw new BusinessValidationException("Token de Facebook inválido");
    }

    public LoginResponseDTO processAppleAuth(String email, String name, String appleIdToken) throws Exception {
        // En un caso real se validaría el signature de Apple
        Usuario user = usuarioService.procesarLoginSocial(email, name, AuthProvider.APPLE, appleIdToken);
        return mapToLoginResponse(user);
    }

    private LoginResponseDTO mapToLoginResponse(Usuario user) {
        String token = jwtService.generarToken(user);
        return LoginResponseDTO.builder()
                .token(token)
                .userId(user.getId())
                .nombre(user.getNombre())
                .email(user.getEmail())
                .role(user.getRole().name())
                .esTrabajador(user.getTrabajador() != null)
                .build();
    }
}
