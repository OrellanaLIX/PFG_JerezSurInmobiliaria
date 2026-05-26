package com.jerezsur.inmobiliaria.security;

import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Si no hay header o no empieza por "Bearer ", continuar sin autenticar
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (jwtService.tokenValido(token)) {
                String email = jwtService.extraerEmail(token);
                System.out.println("✅ [JWT FILTER] Token válido. Email extraído: " + email);

                // Solo autenticar si no hay autenticación ya en el contexto
                if (SecurityContextHolder.getContext().getAuthentication() == null) {

                    Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
                    System.out.println("   -> [JWT FILTER] Usuario encontrado en BD: " + usuarioOpt.isPresent());

                    if (usuarioOpt.isPresent()) {
                        Usuario usuario = usuarioOpt.get();

                        String rolLimpio = usuario.getRole().name().startsWith("ROLE_") 
                                ? usuario.getRole().name() 
                                : "ROLE_" + usuario.getRole().name();
                                
                        System.out.println("   -> [JWT FILTER] Asignando rol de seguridad: " + rolLimpio);

                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                usuario,
                                null,
                                List.of(new SimpleGrantedAuthority(rolLimpio)));
                                
                        auth.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        System.out.println("✅ [JWT FILTER] Autenticación establecida en el contexto de Spring.");
                    } else {
                        System.out.println("⚠️ [JWT FILTER] El email del token ya no existe en la base de datos.");
                    }
                } else {
                    System.out.println("ℹ️ [JWT FILTER] Ya había autenticación en el contexto.");
                }
            } else {
                System.out.println("❌ [JWT FILTER] El token JWT enviado no es válido o ha expirado.");
            }
        } catch (Exception e) {
            System.out.println("💥 [JWT FILTER] Excepción procesando el token: " + e.getMessage());
            e.printStackTrace();

        }

        filterChain.doFilter(request, response);
    }
}