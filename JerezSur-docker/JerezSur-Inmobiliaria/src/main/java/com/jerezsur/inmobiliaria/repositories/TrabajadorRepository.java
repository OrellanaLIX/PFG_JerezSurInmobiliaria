package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Trabajador;
import com.jerezsur.inmobiliaria.models.Usuario;

@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {

    Boolean existsByDni(String dni);

    boolean existsByUsuario(Usuario usuario);

    Optional<Trabajador> findByUsuario(Usuario usuario);

    @Query("SELECT t FROM Trabajador t WHERE :tit IS NULL OR " +
           "LOWER(CONCAT(t.usuario.nombre, ' ', t.usuario.apellidos)) LIKE LOWER(CONCAT('%', :tit, '%'))")
    Page<Trabajador> buscarPorNombre(@Param("tit") String tit, Pageable pageable);
}