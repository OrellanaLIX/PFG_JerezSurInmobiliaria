package com.jerezsur.inmobiliaria.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.List;

/**
 * Clase de configuración de seguridad de Spring Boot
 *
 * Aquí es donde definimos qué rutas son públicas y cuáles necesitan un token JWT.
 * También configuramos el CORS para que el frontend pueda hacer peticiones al backend
 * sin que el navegador las bloquee por política de mismo origen.
 *
 * Aprendí que Spring Security funciona con una cadena de filtros: cada petición
 * pasa por ellos antes de llegar al controlador. El filtro JWT que creé va el primero.
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    // Nuestro filtro personalizado que comprueba el token JWT en cada petición
    private final JwtAuthFilter jwtAuthFilter;

    /**
     * BCrypt es el algoritmo que usamos para cifrar las contraseñas en la base de datos.
     * Nunca guardamos la contraseña en texto plano, eso sería un fallo de seguridad enorme.
     * BCrypt genera un hash diferente cada vez aunque la contraseña sea la misma (por el salt).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Aquí está la configuración principal de seguridad.
     * Le decimos a Spring qué rutas necesitan autenticación y cuáles son públicas.
     *
     * Desactivamos CSRF porque usamos JWT (tokens) en vez de sesiones de servidor.
     * Con JWT no hay problema de CSRF porque el token lo manda el cliente en cada petición.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Desactivamos CSRF porque con JWT no lo necesitamos
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth

                        // Rutas de autenticación (login, registro, OAuth, verificación de cuenta...)
                        // Estas tienen que ser públicas o nadie podría registrarse
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/usuarios/login").permitAll()
                        .requestMatchers("/api/usuarios/registro").permitAll()
                        .requestMatchers("/api/usuarios/auth/**").permitAll()
                        .requestMatchers("/api/usuarios/completar").permitAll()
                        .requestMatchers("/error").permitAll()

                        // El sitemap.xml tiene que ser público para que Google pueda indexarlo
                        .requestMatchers(HttpMethod.GET, "/sitemap.xml").permitAll()

                        // Pedir cita y mandar un mensaje de contacto no requiere cuenta
                        // Lo permití porque si no, los usuarios anónimos no pueden pedir visitas
                        .requestMatchers(HttpMethod.POST, "/api/citas/solicitar").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/contactos/enviar").permitAll()

                        // El feed XML lo usan portales como Idealista para sincronizar inmuebles
                        .requestMatchers(HttpMethod.GET, "/api/portal/**").permitAll()

                        // Los inmuebles se pueden ver sin estar registrado (web pública)
                        // Solo el GET, las operaciones de escritura sí requieren token
                        .requestMatchers(HttpMethod.GET, "/api/inmuebles/**").permitAll()

                        // Lo mismo con vendedores, el frontend los necesita para mostrar info
                        .requestMatchers(HttpMethod.GET, "/api/vendedores/**").permitAll()

                        // Lo demás requiere un JWT válido en la cabecera Authorization
                        .anyRequest().authenticated())

                // Usamos sesiones STATELESS: el servidor no guarda estado de sesión
                // Toda la información del usuario viaja en el token JWT
                .sessionManagement(s -> s
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Añadimos nuestro filtro JWT antes del filtro de usuario/contraseña de Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuración CORS (Cross-Origin Resource Sharing).
     *
     * Sin esto, el navegador bloquearía las peticiones del frontend al backend
     * porque están en puertos distintos (5173 vs 8080 en desarrollo, por ejemplo).
     * En Docker van en el mismo dominio pero por si acaso lo dejamos configurado bien.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Orígenes permitidos: el frontend público, el admin y Docker en producción
        config.setAllowedOrigins(List.of(
                "http://localhost",
                "http://localhost:5173",
                "http://localhost:5174"));

        // Métodos HTTP que permitimos desde el frontend
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Permitimos todas las cabeceras, incluyendo Authorization para el JWT
        config.setAllowedHeaders(List.of("*"));

        // Necesario para que el navegador envíe las credenciales (cookie o Authorization header)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
