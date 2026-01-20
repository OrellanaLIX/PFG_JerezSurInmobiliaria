package com.jerezsur.inmobiliaria.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Trabajador;

@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {
    
    // Método clave para el Login: busca al trabajador por su correo electrónico
    Optional<Trabajador> findByEmail(String email);
    
    // Útil para comprobar si ya existe un DNI antes de registrar a alguien
    Boolean existsByDni(String dni);
}