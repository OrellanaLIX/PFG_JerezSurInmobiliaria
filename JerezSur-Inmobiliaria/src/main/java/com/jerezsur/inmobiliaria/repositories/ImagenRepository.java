package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Imagen;
import com.jerezsur.inmobiliaria.models.Inmueble;

@Repository
public interface ImagenRepository extends JpaRepository<Imagen, Long> {
    
    //Econtramos la imagen de portada del inmueble
    Optional<Imagen> findByInmuebleAndEsPortadaTrue(Inmueble inmueble);

}
