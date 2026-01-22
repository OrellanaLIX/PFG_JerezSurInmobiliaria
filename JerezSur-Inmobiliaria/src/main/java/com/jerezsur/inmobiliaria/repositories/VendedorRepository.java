package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Vendedor;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Long> {
    
    //Econtramos al cendedor por DNI
    Optional<Vendedor> findByDni(String dni);
    
    //Econtramos al cendedor por Email
    Optional<Vendedor> findByEmail(String email);
}