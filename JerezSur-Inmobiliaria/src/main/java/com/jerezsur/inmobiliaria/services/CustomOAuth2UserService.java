package com.jerezsur.inmobiliaria.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.models.enums.AuthProvider;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ------------------------------------------------------------------
    // CARGA DE USUARIO OAUTH2
    // ------------------------------------------------------------------

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        // Obtenemos los datos base del proveedor (Google, Facebook, etc.)
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Identificamos el origen de la autenticación
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        return registrarOActualizarUsuario(oAuth2User, provider);
    }

    // ------------------------------------------------------------------
    // LÓGICA DE PERSISTENCIA Y VINCULACIÓN
    // ------------------------------------------------------------------

    /**
     * Procesa la información recibida del proveedor externo para crear un
     * nuevo perfil de usuario o actualizar uno existente mediante el email.
     */
    private OAuth2User registrarOActualizarUsuario(OAuth2User oAuth2User, AuthProvider provider) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String imageUrl = oAuth2User.getAttribute("picture");
        String providerId = oAuth2User.getAttribute("sub");

        // Intentamos localizar al usuario por email o teléfono (coincidencia de
        // identidad)
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailOrTelefono(email, null);

        Usuario usuario;

        if (usuarioOpt.isEmpty()) {
            // CASO 1: Registro inicial vía Social Login
            usuario = Usuario.builder()
                    .email(email)
                    .nombre(name)
                    .imagenPerfilUrl(imageUrl)
                    .provider(provider)
                    .providerId(providerId)
                    .role(Role.ROLE_INTERESADO)
                    .cambiarPasswd(false) // No requiere cambio al ser externo
                    .build();
        } else {
            // CASO 2: El usuario ya existe en nuestra base de datos
            usuario = usuarioOpt.get();

            // Si el usuario existía por teléfono pero no tenía email, vinculamos la cuenta
            if (usuario.getEmail() == null && email != null) {
                usuario.setEmail(email);
            }

            // Actualizamos metadatos del perfil con la info más reciente del proveedor
            usuario.setImagenPerfilUrl(imageUrl);
            usuario.setProvider(provider);
            usuario.setProviderId(providerId);
        }

        usuarioRepository.save(usuario);
        return oAuth2User;
    }
}