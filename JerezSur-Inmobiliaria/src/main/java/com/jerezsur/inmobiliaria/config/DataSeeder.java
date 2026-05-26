package com.jerezsur.inmobiliaria.config;

import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Usuario admin = usuarioRepository.findByEmail("admin@jerezsur.com").orElse(new Usuario());
            admin.setEmail("admin@jerezsur.com");
            admin.setNombre("Administrador");
            admin.setApellidos("JerezSur");
            if (admin.getTelefono() == null) admin.setTelefono("000000000");
            admin.setPassword(passwordEncoder.encode("admin123")); // Obliga a usar esta contraseña
            admin.setRole(Role.ROLE_ADMIN);
            admin.setCuentaActivada(true);
            admin.setCambiarPasswd(false);
            usuarioRepository.save(admin);
            System.out.println("✅ Usuario admin asegurado: admin@jerezsur.com / admin123");
        };
    }
}
