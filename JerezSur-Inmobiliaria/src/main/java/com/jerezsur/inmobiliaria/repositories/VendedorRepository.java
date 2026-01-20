package com.jerezsur.inmobiliaria.repositories;

import com.jerezsur.inmobiliaria.models.Vendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Long> {
    
    Optional<Vendedor> findByDni(String dni);
    
    Optional<Vendedor> findByEmail(String email);
}