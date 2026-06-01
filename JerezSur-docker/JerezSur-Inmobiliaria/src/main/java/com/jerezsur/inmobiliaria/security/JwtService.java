package com.jerezsur.inmobiliaria.security;

import com.jerezsur.inmobiliaria.models.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Servicio para generar y validar tokens JWT (JSON Web Tokens).
 *
 * El JWT es la forma en que el backend sabe quién es el usuario en cada petición.
 * En vez de guardar sesiones en el servidor (como hacía PHP tradicional),
 * le damos al usuario un "ticket" firmado cuando hace login.
 * Ese ticket contiene su email, rol y otros datos, y el usuario lo manda
 * en cada petición en la cabecera "Authorization: Bearer <token>".
 *
 * El token tiene tres partes separadas por puntos:
 *   header.payload.signature
 * - header: algoritmo de firma (HS256)
 * - payload: datos del usuario (email, rol, etc.) en Base64
 * - signature: firma HMAC con nuestra clave secreta (para que nadie pueda falsificarlo)
 *
 * La clave secreta viene del application.properties y NUNCA se comparte.
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration; // Tiempo en milisegundos hasta que expira el token (24h = 86400000ms)

    // =========================================================================
    // GENERACIÓN DE TOKEN
    // =========================================================================

    /**
     * Genera un token JWT para el usuario.
     * Incluimos en el payload el ID, nombre y rol del usuario
     * para que el frontend los pueda leer sin hacer otra petición al backend.
     *
     * Si el usuario es trabajador, también incluimos su ID de trabajador
     * (lo necesita el panel de administración para ciertas operaciones).
     */
    public String generarToken(Usuario usuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", usuario.getId());
        claims.put("nombre", usuario.getNombre());
        claims.put("role",   usuario.getRole().name());

        // Solo los trabajadores tienen este campo en el token
        if (usuario.getTrabajador() != null) {
            claims.put("trabajadorId", usuario.getTrabajador().getId());
        }

        return Jwts.builder()
                .claims(claims)
                .subject(usuario.getEmail())           // el "subject" estándar del JWT es el email
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())              // firmamos con HMAC-SHA256
                .compact();                            // genera el string final header.payload.signature
    }

    // =========================================================================
    // EXTRACCIÓN DE DATOS
    // =========================================================================

    // El email es el "subject" del token (campo estándar JWT)
    public String extraerEmail(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    // ID del usuario guardado en el payload como campo personalizado
    public Long extraerUserId(String token) {
        return extraerClaim(token, claims -> claims.get("userId", Long.class));
    }

    // ID del trabajador (solo está si el usuario es trabajador)
    public Long extraerTrabajadorId(String token) {
        return extraerClaim(token, claims -> claims.get("trabajadorId", Long.class));
    }

    public String extraerRole(String token) {
        return extraerClaim(token, claims -> claims.get("role", String.class));
    }

    // =========================================================================
    // VALIDACIÓN
    // =========================================================================

    /**
     * Comprueba si el token es válido: que esté bien firmado y que no haya expirado.
     * Si el token ha sido manipulado, Jwts lanzará una excepción al parsear y devolveremos false.
     */
    public boolean tokenValido(String token) {
        try {
            Date expiracion = extraerClaim(token, Claims::getExpiration);
            return expiracion.after(new Date()); // true si la fecha de expiración es futura
        } catch (Exception e) {
            return false; // token inválido, expirado o con mala firma
        }
    }

    // =========================================================================
    // MÉTODOS PRIVADOS
    // =========================================================================

    /**
     * Método genérico para extraer cualquier campo del payload.
     * Usa un Function<Claims, T> (como una lambda) para indicar qué campo queremos.
     * Así evitamos repetir el código de parseo en cada método get.
     */
    private <T> T extraerClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey()) // comprueba la firma antes de leer los datos
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }

    /**
     * Convierte la clave textual de configuración en una SecretKey para HMAC-SHA256.
     * La clave tiene que ser suficientemente larga (al menos 256 bits = 32 chars) para HS256.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
