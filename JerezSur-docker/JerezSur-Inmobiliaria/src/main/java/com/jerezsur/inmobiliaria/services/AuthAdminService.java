package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.dto.LoginResponseDTO;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import com.jerezsur.inmobiliaria.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthAdminService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Login específico para el panel de administración.
     * Solo permite acceso a usuarios con perfil de Trabajador.
     */
    public LoginResponseDTO loginAdmin(String email, String password) {
        // 1️⃣ Buscar por email
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        // 2️⃣ Verificar password
        if (usuario.getPassword() == null
                || !passwordEncoder.matches(password, usuario.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        // 3️⃣ Verificar cuenta activada
        if (!Boolean.TRUE.equals(usuario.getCuentaActivada())) {
            throw new RuntimeException("La cuenta no está activada");
        }

        // 4️⃣ Verificar que es TRABAJADOR
        if (usuario.getTrabajador() == null) {
            throw new RuntimeException(
                "Acceso denegado: solo personal autorizado puede acceder al panel"
            );
        }

        // 5️⃣ Generar JWT
        String token = jwtService.generarToken(usuario);

        return LoginResponseDTO.builder()
                .token(token)
                .userId(usuario.getId())
                .trabajadorId(usuario.getTrabajador().getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .role(usuario.getRole().name())
                .esTrabajador(true)
                .build();
    }
}