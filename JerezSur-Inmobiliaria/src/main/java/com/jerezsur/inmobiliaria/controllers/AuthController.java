package com.jerezsur.inmobiliaria.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/me")
    public Optional<Usuario> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        // Retorna los datos del usuario logueado mediante su email [cite: 24]
        return usuarioRepository.findByEmail(userDetails.getUsername());
    }
}