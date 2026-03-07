package com.jerezsur.inmobiliaria.repositories;

import com.jerezsur.inmobiliaria.models.Operacion;
import com.jerezsur.inmobiliaria.models.enums.EstadoOperacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperacionRepository extends JpaRepository<Operacion, Long> {

    // 1. Buscar todas las operaciones de un inmueble específico (historial)
    List<Operacion> findByInmuebleId(Long inmuebleId);

    // 2. Buscar operaciones abiertas para la gestión diaria
    List<Operacion> findByEstadoActual(EstadoOperacion estado);

    // 3. Buscar por el DNI del representante comprador (muy útil para el buscador)
    List<Operacion> findByRepresentanteCompradorDni(String dni);

    // 4. Consulta Polimórfica: Solo alquileres
    @Query("SELECT o FROM OperacionAlquiler o")
    List<Operacion> findAllAlquileres();

    // 5. Consulta Polimórfica: Solo ventas
    @Query("SELECT o FROM OperacionVenta o")
    List<Operacion> findAllVentas();
}