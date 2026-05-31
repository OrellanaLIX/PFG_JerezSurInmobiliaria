package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.models.Usuario;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {

    Boolean existsByDni(String dni);

    // Estos dos son los que necesita PerfilService:
    boolean existsByUsuario(Usuario usuario);

    Optional<Trabajador> findByUsuario(Usuario usuario);
}