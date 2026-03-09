package com.jerezsur.inmobiliaria.repositories;

import com.jerezsur.inmobiliaria.models.Contrato;
import com.jerezsur.inmobiliaria.models.enums.EstadoContrato;
import com.jerezsur.inmobiliaria.models.enums.ModeloContrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContratoRepository extends JpaRepository<Contrato, Long> {

    // Listar todos los documentos de una operación concreta (la bandeja de
    // contratos)
    List<Contrato> findByOperacionId(Long operacionId);

    // Buscar si ya existe un modelo específico firmado para una operación
    Optional<Contrato> findByOperacionIdAndModeloAndEstado(Long operacionId, ModeloContrato modelo,
            EstadoContrato estado);

    // Buscar contratos gestionados por un trabajador específico
    List<Contrato> findByTrabajadorId(Long trabajadorId);

    // Buscar contratos pendientes de firma
    List<Contrato> findByEstado(EstadoContrato estado);

    // Query para limpieza de datos inutiles
    @Modifying
    @Query("DELETE FROM Contrato c WHERE c.estado = 'CANCELADO' AND c.fechaRegistro < :fecha")
    void borrarContratosCanceladosAntiguos(LocalDateTime fecha);
}