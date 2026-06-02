package com.jerezsur.inmobiliaria.repositories;

import com.jerezsur.inmobiliaria.models.Operacion;
import com.jerezsur.inmobiliaria.models.enums.EstadoOperacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// Repositorio de operaciones: consultas por inmueble, estado y tipo de operación.
public interface OperacionRepository extends JpaRepository<Operacion, Long> {

    // Buscar todas las operaciones de un inmueble específico (historial)
    List<Operacion> findByInmuebleId(Long inmuebleId);

    // Buscar operaciones abiertas para la gestión diaria
    List<Operacion> findByEstadoActual(EstadoOperacion estado);

    // Consulta Polimórfica: Solo alquileres
    @Query("SELECT o FROM OperacionAlquiler o")
    List<Operacion> findAllAlquileres();

    // Consulta Polimórfica: Solo ventas
    @Query("SELECT o FROM OperacionVenta o")
    List<Operacion> findAllVentas();

    // Query para limpieza de datos inutiles
    @Modifying
    @Query("DELETE FROM Operacion o WHERE o.estadoActual = 'CANCELADA' AND o.id NOT IN (SELECT c.operacion.id FROM Contrato c)")
    void borrarOperacionesCanceladasSinContratos();
}