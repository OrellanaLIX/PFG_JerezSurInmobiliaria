package com.jerezsur.inmobiliaria.repositories;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jerezsur.inmobiliaria.models.Interesado;
import com.jerezsur.inmobiliaria.models.enums.Operacion;

// Al hacer extends tenemos save, findById, deleteById, etc... por defecto
@Repository
public interface InteresadoRepository extends JpaRepository<Interesado, Long> {

        // Encontramos al interesado por DNI
        Optional<Interesado> findByDni(String dni);

        // Query de filtrado
        @Query("SELECT i FROM Interesado i WHERE " +
                        "(:hipoteca IS NULL OR i.requiereHipoteca = :hipoteca) AND " +
                        "(:presupuesto IS NULL OR i.presupuestoMaximo <= :presupuesto) AND " +
                        "(:zona IS NULL OR i.zonaInteres LIKE %:zona%) AND " +
                        "(:habs IS NULL OR i.habitacionesMinimas >= :habs) AND " +
                        "(:banos IS NULL OR i.banosMinimos >= :banos) AND " +
                        "(:tipo IS NULL OR i.tipoBusqueda = :tipo)")
        Page<Interesado> listarFiltrado(
                        @Param("hipoteca") Boolean hipoteca,
                        @Param("presupuesto") Double presupuesto,
                        @Param("zona") String zona,
                        @Param("habs") Integer habs,
                        @Param("banos") Integer banos,
                        @Param("tipo") Operacion tipo,
                        Pageable pageable);

        // Query para el cleanup
        @Modifying
        @Query("DELETE FROM Interesado i WHERE i.usuario IS NULL AND " +
                        "NOT EXISTS (SELECT c FROM Cita c WHERE c.interesado = i AND c.fechaCita > :fecha)")
        void borrarLeadsAntiguos(@Param("fecha") LocalDateTime fecha);
}