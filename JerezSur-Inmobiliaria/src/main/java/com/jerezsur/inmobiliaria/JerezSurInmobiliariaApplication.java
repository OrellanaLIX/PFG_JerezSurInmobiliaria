package com.jerezsur.inmobiliaria;

import java.time.LocalDate;

import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.models.enums.AuthProvider;
import com.jerezsur.inmobiliaria.models.enums.OrigenUsuario;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.repositories.TrabajadorRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableScheduling
public class JerezSurInmobiliariaApplication {

	public static void main(String[] args) {
		SpringApplication.run(JerezSurInmobiliariaApplication.class, args);
	}

	@Bean
	public CommandLineRunner initAdminUsuario(
			UsuarioRepository usuarioRepository,
			TrabajadorRepository trabajadorRepository,
			PasswordEncoder passwordEncoder
	) {
		return args -> {
			String adminEmail = "admin@jerezsur.com";
			Usuario admin = usuarioRepository.findByEmail(adminEmail).orElse(null);

			if (admin == null) {
				admin = Usuario.builder()
					.email(adminEmail)
					.nombre("Administrador")
					.apellidos("JerezSur")
					.telefono("+34900000000")
					.password(passwordEncoder.encode("admin123"))
					.dni("00000000A")
					.role(Role.ROLE_ADMIN)
					.cambiarPasswd(false)
					.cuentaActivada(true)
					.verified(true)
					.provider(AuthProvider.LOCAL)
					.origen(OrigenUsuario.CRM_TRABAJADOR)
					.build();
				admin = usuarioRepository.save(admin);
				System.out.println("✅ Usuario administrador inicial creado: " + adminEmail);
			} else {
				boolean updated = false;
				if (!Role.ROLE_ADMIN.equals(admin.getRole())) {
					admin.setRole(Role.ROLE_ADMIN);
					updated = true;
				}
				if (!Boolean.TRUE.equals(admin.getCuentaActivada())) {
					admin.setCuentaActivada(true);
					updated = true;
				}
				if (updated) {
					usuarioRepository.save(admin);
					System.out.println("✅ Usuario administrador existente actualizado con permisos de administrador.");
				}
			}

			if (!trabajadorRepository.existsByUsuario(admin)) {
				Trabajador trabajador = Trabajador.builder()
					.dni(admin.getDni() != null ? admin.getDni() : "00000000A")
					.cargo("Administrador")
					.fechaInicioContrato(LocalDate.now())
					.activo(true)
					.usuario(admin)
					.build();
				trabajadorRepository.save(trabajador);
				System.out.println("✅ Perfil de trabajador creado para el administrador.");
			}
		};
	}

}
