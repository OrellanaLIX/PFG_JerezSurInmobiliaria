package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Trabajador;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {
    
    //Econtramos al cendedor por Email
    Optional<Trabajador> findByEmail(String email);
    
    //Econtramos al cendedor por DNI
    Boolean existsByDni(String dni);
}