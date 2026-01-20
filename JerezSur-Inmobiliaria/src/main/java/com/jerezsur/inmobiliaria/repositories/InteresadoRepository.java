package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Interesado;

@Repository
public interface InteresadoRepository extends JpaRepository<Interesado, Long> {
    
    Optional<Interesado> findByDni(String dni);
}