package com.jerezsur.inmobiliaria.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Cita;
import com.jerezsur.inmobiliaria.models.Inmueble;
import java.time.LocalDateTime;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    // Encontramos las cita para cada inmueble
    List<Cita> findByInmueble(Inmueble inmueble);

    // Encontramos la lista de citas en unas fechas
    Page<Cita> findByFechaHoraBetween(LocalDateTime fechaHoraMin, LocalDateTime fechaHoraMax, Pageable pageable);

}
