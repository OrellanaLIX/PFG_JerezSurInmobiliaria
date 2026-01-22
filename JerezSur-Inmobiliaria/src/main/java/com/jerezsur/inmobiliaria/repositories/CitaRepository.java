package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Cita;
import com.jerezsur.inmobiliaria.models.Inmueble;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    
    //Econtramos la imagen de portada del inmueble
    Optional<Cita> findByInmueble(Inmueble inmueble);

}
