package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Usuario;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    //Econtramos al cendedor por email
    Optional<Usuario> findByEmail(String email);
}
