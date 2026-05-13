package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Usuario;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Econtramos al Usuario por email o telefono
    @Query("SELECT u FROM Usuario u WHERE u.email = :id OR u.telefono = :id")
    Optional<Usuario> buscarPorEmailOTelefono(@Param("id") String id);

    // Verificamos si el email o el telefono ya existe para evitar duplicados
    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE (:email IS NOT NULL AND u.email = :email) OR (:tel IS NOT NULL AND u.telefono = :tel)")
    boolean existePorEmailOTelefono(@Param("email") String email, @Param("tel") String tel);

    // Para login social, verificamos solo por email
    boolean existsByEmail(String email);

    // Para login social, buscamos solo por email
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByTelefono(String telefono);
}
