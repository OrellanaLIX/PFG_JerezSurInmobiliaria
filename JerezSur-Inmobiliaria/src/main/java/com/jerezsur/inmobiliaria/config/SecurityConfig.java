package com.jerezsur.inmobiliaria.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private OAuth2UserService<OAuth2UserRequest, OAuth2User> customOAuth2UserService;

    @Autowired
    private CustomLoginSuccessHandler successHandler; // Inyectamos tu nuevo handler

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Configuración de CORS para permitir peticiones desde React
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. Deshabilitar CSRF para la API
            .csrf(csrf -> csrf.disable())
            
            // 3. Configurar permisos de rutas según tus roles definidos
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/api/inmuebles/**", "/login/**", "/css/**", "/js/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/trabajador/**").hasAnyRole("ADMIN", "TRABAJADOR")
                .anyRequest().authenticated()
            )
            
            // 4. Configurar Login Formulario (Local)
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/api/auth/login") // URL que llamará React para el login
                .successHandler(successHandler) // Devolverá el JSON con el rol
                .permitAll()
            )

            // 5. Configurar OAuth2 (Google/Facebook)
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login")
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService) // Lógica de registro automático
                )
                .successHandler(successHandler) // Redirección inteligente post-login social
            )

            // 6. Configurar Logout
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            );

        return http.build();
    }

    // Bean para configurar qué dominios externos pueden llamar a tu API
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // URL de tu React
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}