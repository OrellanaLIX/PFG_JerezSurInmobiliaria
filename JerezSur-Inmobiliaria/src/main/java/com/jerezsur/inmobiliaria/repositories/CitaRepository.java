package com.jerezsur.inmobiliaria.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Cita;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.Trabajador;

import java.time.LocalDateTime;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    // Encontramos las cita para cada inmueble
    List<Cita> findByInmueble(Inmueble inmueble);

    // Encontramos la lista de citas en unas fechas
    Page<Cita> findByFechaHoraBetween(LocalDateTime fechaHoraMin, LocalDateTime fechaHoraMax, Pageable pageable);

    // Comprobacion para que no se pisen las fechas
    Boolean existsByTrabajadorAndFechaHoraBetween(Trabajador trabajador, LocalDateTime inicioRango,
            LocalDateTime finRango);

    // Query para limpieza de datos inutiles
    @Modifying
    @Query("DELETE FROM Cita c WHERE c.estado = 'CANCELADA' AND c.fechaHora < :fecha")
    void borrarCitasCanceladasAntiguas(LocalDateTime fecha);

    List<Cita> findByTelefonoAnonimoAndUsuarioIsNull(String telefono);

    long countByFechaHoraGreaterThanEqual(LocalDateTime fechaHora);
}
