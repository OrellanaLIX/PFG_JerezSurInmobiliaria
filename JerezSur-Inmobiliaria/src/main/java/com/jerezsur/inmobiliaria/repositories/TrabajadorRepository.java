package com.jerezsur.inmobiliaria.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Trabajador;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {
        
    //Encontramos al trabajador por DNI
    Boolean existsByDni(String dni);
}