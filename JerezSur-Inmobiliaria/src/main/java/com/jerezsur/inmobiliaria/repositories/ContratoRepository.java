package com.jerezsur.inmobiliaria.repositories;

import com.jerezsur.inmobiliaria.models.Contrato;
import com.jerezsur.inmobiliaria.models.enums.EstadoContrato;
import com.jerezsur.inmobiliaria.models.enums.ModeloContrato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContratoRepository extends JpaRepository<Contrato, Long> {

    // 1. Listar todos los documentos de una operación concreta (la bandeja de contratos)
    List<Contrato> findByOperacionId(Long operacionId);

    // 2. Buscar si ya existe un modelo específico firmado para una operación
    // (Ej: Para no generar dos veces el contrato de Arras)
    Optional<Contrato> findByOperacionIdAndModeloAndEstado(Long operacionId, ModeloContrato modelo, EstadoContrato estado);

    // 3. Buscar contratos gestionados por un trabajador específico
    List<Contrato> findByTrabajadorId(Long trabajadorId);
    
    // 4. Buscar contratos pendientes de firma
    List<Contrato> findByEstado(EstadoContrato estado);
}