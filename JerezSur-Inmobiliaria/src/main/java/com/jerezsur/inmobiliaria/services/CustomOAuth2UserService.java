package com.jerezsur.inmobiliaria.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.models.enums.AuthProvider;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        // Identificar si es Google, Apple o Facebook.
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());
        
        return registrarOActualizarUsuario(oAuth2User, provider);
    }

    private OAuth2User registrarOActualizarUsuario(OAuth2User oAuth2User, AuthProvider provider) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String imageUrl = oAuth2User.getAttribute("picture"); // En Facebook puede variar la clave
        String providerId = oAuth2User.getAttribute("sub"); // "sub" es el ID estándar en Google

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        Usuario usuario;

        if (usuarioOpt.isEmpty()) {
            // Si no existe, lo creamos de cero
            usuario = Usuario.builder()
                    .email(email)
                    .nombre(name)
                    .imagenPerfilUrl(imageUrl)
                    .provider(provider)
                    .providerId(providerId)
                    .role(Role.ROLE_INTERESADO
                    ) // Por defecto es interesado
                    .build();
            usuarioRepository.save(usuario);
        } else {
            // Si existe, actualizamos sus datos de perfil por si han cambiado en el provider
            usuario = usuarioOpt.get();
            usuario.setImagenPerfilUrl(imageUrl);
            usuario.setProvider(provider);
            usuario.setProviderId(providerId);
            usuarioRepository.save(usuario);
        }

        return oAuth2User;
    }
}