package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.models.Usuario;

@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Long> {

    boolean existsByUsuario(Usuario usuario);

    Optional<Vendedor> findByUsuario(Usuario usuario);

    @Query("SELECT v FROM Vendedor v WHERE :tit IS NULL OR " +
           "LOWER(CONCAT(v.usuario.nombre, ' ', v.usuario.apellidos)) LIKE LOWER(CONCAT('%', :tit, '%'))")
    Page<Vendedor> buscarPorNombre(@Param("tit") String tit, Pageable pageable);
}