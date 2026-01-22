package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Contrato;
import com.jerezsur.inmobiliaria.models.Inmueble;

@Repository
public interface ContratoRepository extends JpaRepository<Contrato, Long> {
    
    //Econtramos la imagen de portada del inmueble
    Optional<Contrato> findByInmueble(Inmueble inmueble);

}
