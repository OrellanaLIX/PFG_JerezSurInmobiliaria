package com.jerezsur.inmobiliaria;

import java.time.LocalDate;

import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.models.enums.AuthProvider;
import com.jerezsur.inmobiliaria.models.enums.OrigenUsuario;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.repositories.TrabajadorRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Clase principal de la aplicación Spring Boot.
 *
 * @SpringBootApplication activa el autoconfigurado de Spring, el escaneo de componentes
 * y permite que todo funcione sin tener que configurar cada cosa manualmente.
 *
 * @EnableScheduling lo necesito para las tareas programadas (@Scheduled) que
 * hacen limpieza automática de datos en la base de datos.
 */
@Slf4j
@SpringBootApplication
@EnableScheduling
public class JerezSurInmobiliariaApplication {

	public static void main(String[] args) {
		SpringApplication.run(JerezSurInmobiliariaApplication.class, args);
	}

	/**
	 * CommandLineRunner que se ejecuta nada más arrancar la aplicación.
	 *
	 * Lo uso para asegurarme de que siempre exista un usuario administrador en la base
	 * de datos. Si no existiera y se borrara la BD, no podría entrar al panel de admin.
	 *
	 * @Order(1) significa que este se ejecuta ANTES que el DataSeeder (que es @Order(2))
	 * Así cuando el seeder intente crear datos, el admin ya existe.
	 */
	@Bean
	@Order(1)
	public CommandLineRunner initAdminUsuario(
			UsuarioRepository usuarioRepository,
			TrabajadorRepository trabajadorRepository,
			PasswordEncoder passwordEncoder
	) {
		return args -> {
			String adminEmail = "admin@jerezsur.com";

			// Buscamos si ya existe el admin en la BD
			// Si usamos findByEmail devuelve Optional, por eso el orElse(null)
			Usuario admin = usuarioRepository.findByEmail(adminEmail).orElse(null);

			if (admin == null) {
				// No existe, lo creamos con todos los datos necesarios
				// La contraseña la ciframos con BCrypt (nunca en texto plano)
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
				log.info("Admin inicial creado: {}", adminEmail);
			} else {
				// Ya existe, comprobamos que tenga el rol correcto
				// Esto lo añadí por si alguien cambia el rol por error en la BD
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
					log.info("Admin existente actualizado con permisos correctos.");
				}
			}

			// El admin también necesita un perfil de Trabajador para poder entrar al panel
			// Sin el Trabajador vinculado, el login del admin rechaza el acceso
			if (!trabajadorRepository.existsByUsuario(admin)) {
				Trabajador trabajador = Trabajador.builder()
					.dni(admin.getDni() != null ? admin.getDni() : "00000000A")
					.cargo("Administrador")
					.fechaInicioContrato(LocalDate.now())
					.activo(true)
					.usuario(admin)
					.build();
				trabajadorRepository.save(trabajador);
				log.info("Perfil de trabajador creado para el admin.");
			}
		};
	}

}
