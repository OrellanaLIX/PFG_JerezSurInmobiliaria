package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Usuario;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    //Econtramos al Vendedor por email o telefono
    Optional<Usuario> findByEmailOrTelefono(String email, String telefono);

    // Verificamos si el email o el telefono ya existe para evitar duplicados
    boolean existsByEmailOrTelefono(String email, String telefono);
}
