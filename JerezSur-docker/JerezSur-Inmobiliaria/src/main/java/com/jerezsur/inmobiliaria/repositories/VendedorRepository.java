package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Vendedor;

import com.jerezsur.inmobiliaria.models.Usuario;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Long> {

    // Verificamos si el usuario ya tiene perfil de interesado o vendedor para
    // evitar duplicados
    boolean existsByUsuario(Usuario usuario);

    Optional<Vendedor> findByUsuario(Usuario usuario);

}