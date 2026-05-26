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

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // ============================================================
    // GENERACIÓN DE TOKEN
    // ============================================================

    public String generarToken(Usuario usuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", usuario.getId());
        claims.put("nombre", usuario.getNombre());
        claims.put("role", usuario.getRole().name());

        if (usuario.getTrabajador() != null) {
            claims.put("trabajadorId", usuario.getTrabajador().getId());
        }

        return Jwts.builder()
                .claims(claims)
                .subject(usuario.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // ============================================================
    // EXTRACCIÓN DE DATOS
    // ============================================================

    public String extraerEmail(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public Long extraerUserId(String token) {
        return extraerClaim(token, claims -> claims.get("userId", Long.class));
    }

    public Long extraerTrabajadorId(String token) {
        return extraerClaim(token, claims -> claims.get("trabajadorId", Long.class));
    }

    public String extraerRole(String token) {
        return extraerClaim(token, claims -> claims.get("role", String.class));
    }

    // ============================================================
    // VALIDACIÓN
    // ============================================================

    public boolean tokenValido(String token) {
        try {
            Date expiracion = extraerClaim(token, Claims::getExpiration);
            return expiracion.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // ============================================================
    // PRIVADOS
    // ============================================================

    private <T> T extraerClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}