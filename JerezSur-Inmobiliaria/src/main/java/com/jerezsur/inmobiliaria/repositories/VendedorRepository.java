package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Vendedor;

import com.jerezsur.inmobiliaria.models.Inmueble;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Long> {

    // Encontramos al vendedor por DNI
    Optional<Vendedor> findByDni(String dni);

    // Encontramos al vendedor por inmuebles que vende
    Optional<Vendedor> findByPropiedadesInmueble(Inmueble inmueble);
}