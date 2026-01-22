package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Inmueble;

@Repository
public interface InmuebleRepository extends JpaRepository<Inmueble, Long> {
    
    //Econtramos al cendedor por Email
    Optional<Inmueble> findByContainingTitulo(String titulo);

}
