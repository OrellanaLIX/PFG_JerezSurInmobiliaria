package com.jerezsur.inmobiliaria.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private OAuth2UserService<OAuth2UserRequest, OAuth2User> customOAuth2UserService;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. Deshabilitar CSRF (común en APIs o desarrollos iniciales para facilitar pruebas)
            .csrf(csrf -> csrf.disable())
            
            // 2. Configurar permisos de rutas
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas (Ver inmuebles, página de inicio, recursos estáticos)
                .requestMatchers("/", "/api/inmuebles/**", "/login/**", "/css/**", "/js/**").permitAll()
                // Rutas de administración (Solo para trabajadores/admin)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/trabajador/**").hasAnyRole("ADMIN", "TRABAJADOR")
                // El resto requiere estar autenticado
                .anyRequest().authenticated()
            )
            
            // 3. Configurar Login Formulario (Local)
            .formLogin(form -> form
                .loginPage("/login") // Tu vista de login personalizada
                .defaultSuccessUrl("/home", true)
                .permitAll()
            )

            // 4. Configurar OAuth2 (Google/GitHub)
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login")
                .userInfoEndpoint(userInfo -> userInfo
                .userService(customOAuth2UserService)
            )
    .defaultSuccessUrl("/home", true)
)

            // 5. Configurar Logout
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            );

        return http.build();
    }
}