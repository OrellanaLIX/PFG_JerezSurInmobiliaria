package com.jerezsur.inmobiliaria.security;

import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Filtro de autenticación JWT.
 *
 * En Spring Security los filtros se ejecutan antes de que la petición llegue al controlador.
 * Este filtro lee el token JWT de la cabecera "Authorization", lo valida y,
 * si es correcto, establece la identidad del usuario en el contexto de seguridad.
 * Así los controladores pueden usar @PreAuthorize o simplemente funcionar seguros
 * de que el usuario está autenticado.
 *
 * Extiende OncePerRequestFilter para garantizar que solo se ejecuta UNA vez por petición
 * (Spring a veces aplica filtros varias veces si no se usa esta clase base).
 */
@Slf4j
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

        // Leemos la cabecera Authorization (donde el frontend manda el token)
        String authHeader = request.getHeader("Authorization");

        // Si no hay header o no empieza por "Bearer ", esta petición es pública
        // y simplemente la dejamos pasar sin autenticar
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Quitamos el prefijo "Bearer " (7 caracteres) para quedarnos solo con el token
        String token = authHeader.substring(7);

        try {
            if (jwtService.tokenValido(token)) {
                String email = jwtService.extraerEmail(token);

                // Solo procesamos si no hay autenticación ya establecida
                // (puede pasar si hay otros filtros que actúan antes)
                if (SecurityContextHolder.getContext().getAuthentication() == null) {

                    Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

                    if (usuarioOpt.isPresent()) {
                        Usuario usuario = usuarioOpt.get();

                        // Spring Security necesita que el rol empiece por "ROLE_"
                        String rolLimpio = usuario.getRole().name().startsWith("ROLE_")
                                ? usuario.getRole().name()
                                : "ROLE_" + usuario.getRole().name();

                        // Creamos el objeto de autenticación con el usuario y su rol
                        // El segundo parámetro (credentials) es null porque ya autenticamos con el token
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                usuario,
                                null,
                                List.of(new SimpleGrantedAuthority(rolLimpio)));

                        // Añadimos los detalles de la petición (IP, session ID...) al objeto de auth
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // Ponemos la autenticación en el contexto: a partir de aquí Spring sabe quién es el usuario
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    } else {
                        // El token es válido pero el usuario fue borrado de la BD
                        log.warn("[JWT] Token válido pero el usuario '{}' ya no existe en la base de datos", email);
                    }
                }
            } else {
                log.debug("[JWT] Token inválido o expirado en la petición a {}", request.getRequestURI());
            }

        } catch (Exception e) {
            // Si algo falla al procesar el token, simplemente no autenticamos
            // La petición seguirá su curso y Spring Security decidirá si es accesible o no
            log.warn("[JWT] Error al procesar el token: {}", e.getMessage());
        }

        // Siempre pasamos la petición al siguiente filtro/controlador
        filterChain.doFilter(request, response);
    }
}
