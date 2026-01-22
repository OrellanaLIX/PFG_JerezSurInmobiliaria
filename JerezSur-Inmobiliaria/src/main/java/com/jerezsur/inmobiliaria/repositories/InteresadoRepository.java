package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Interesado;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface InteresadoRepository extends JpaRepository<Interesado, Long> {
    
    //Econtramos al cendedor por DNI
    Optional<Interesado> findByDni(String dni);
}