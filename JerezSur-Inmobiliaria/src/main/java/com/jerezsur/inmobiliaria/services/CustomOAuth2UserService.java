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

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());
        
        return registrarOActualizarUsuario(oAuth2User, provider);
    }

    private OAuth2User registrarOActualizarUsuario(OAuth2User oAuth2User, AuthProvider provider) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String imageUrl = oAuth2User.getAttribute("picture"); 
        String providerId = oAuth2User.getAttribute("sub"); 

        // IMPORTANTE: Buscamos por el email o el teléfono que devuelva el provider
        // Como OAuth2 suele dar solo email, usamos nuestro nuevo método del repositorio
        // Pasamos el email en ambos parámetros o usamos findByEmail si estamos seguros de que viene.
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailOrTelefono(email, null);

        Usuario usuario;

        if (usuarioOpt.isEmpty()) {
            // Caso 1: El usuario es totalmente nuevo
            usuario = Usuario.builder()
                    .email(email)
                    .nombre(name)
                    .imagenPerfilUrl(imageUrl)
                    .provider(provider)
                    .providerId(providerId)
                    .role(Role.ROLE_INTERESADO)
                    .build();
        } else {
            // Caso 2: El usuario ya existía (quizás se registró antes con teléfono)
            usuario = usuarioOpt.get();
            
            // Si el usuario existía por teléfono pero no tenía email, se lo vinculamos ahora
            if (usuario.getEmail() == null && email != null) {
                usuario.setEmail(email);
            }
            
            usuario.setImagenPerfilUrl(imageUrl);
            usuario.setProvider(provider);
            usuario.setProviderId(providerId);
        }

        usuarioRepository.save(usuario);
        return oAuth2User;
    }
}