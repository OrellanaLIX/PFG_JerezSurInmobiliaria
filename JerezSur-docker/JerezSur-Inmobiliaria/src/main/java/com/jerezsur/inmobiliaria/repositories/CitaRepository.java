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
// Repositorio de citas: acceso a la BD para las operaciones CRUD y consultas especiales de citas.
public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByInmueble(Inmueble inmueble);

    Page<Cita> findByFechaHoraBetween(LocalDateTime fechaHoraMin, LocalDateTime fechaHoraMax, Pageable pageable);

    Boolean existsByTrabajadorAndFechaHoraBetween(Trabajador trabajador, LocalDateTime inicioRango,
            LocalDateTime finRango);

    @Modifying
    @Query("DELETE FROM Cita c WHERE c.estado = 'CANCELADA' AND c.fechaHora < :fecha")
    void borrarCitasCanceladasAntiguas(LocalDateTime fecha);

    long countByFechaHoraGreaterThanEqual(LocalDateTime fechaHora);

    List<Cita> findByTrabajadorIdOrderByFechaHoraAsc(Long trabajadorId);

    List<Cita> findByUsuarioIdOrderByFechaHoraDesc(Long usuarioId);

    @Query("""
        SELECT DISTINCT c FROM Cita c
        WHERE c.usuario.id = :usuarioId
           OR (:email IS NOT NULL AND c.usuario.email = :email)
           OR (:telefono IS NOT NULL AND c.usuario.telefono = :telefono)
        ORDER BY c.fechaHora DESC
        """)
    List<Cita> findCitasPorUsuarioEmailOTelefono(
        @org.springframework.data.repository.query.Param("usuarioId") Long usuarioId,
        @org.springframework.data.repository.query.Param("email") String email,
        @org.springframework.data.repository.query.Param("telefono") String telefono
    );

    @Query("SELECT COUNT(c) FROM Cita c WHERE c.fechaHora >= CURRENT_TIMESTAMP")
    long countProximas();
}
