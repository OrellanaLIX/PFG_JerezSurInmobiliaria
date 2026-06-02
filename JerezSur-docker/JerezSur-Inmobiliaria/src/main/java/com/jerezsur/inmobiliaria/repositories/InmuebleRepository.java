package com.jerezsur.inmobiliaria.repositories;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;

@Repository
// Repositorio de inmuebles: incluye la consulta JPQL con filtros opcionales para el buscador público.
public interface InmuebleRepository extends JpaRepository<Inmueble, Long> {

        // Econtramos al cendedor por Email
        Optional<Inmueble> findByTituloContaining(String titulo);

        // Query de filtrado completa con todos los parámetros del panel de búsqueda
        @Query("SELECT i FROM Inmueble i WHERE " +
                        "(:referencia IS NULL OR i.referencia = :referencia) AND " +
                        "(:titulo IS NULL OR LOWER(i.titulo) LIKE LOWER(CONCAT('%', :titulo, '%'))) AND " +
                        "(:desc IS NULL OR LOWER(i.descripcion) LIKE LOWER(CONCAT('%', :desc, '%'))) AND " +
                        "(:operacion IS NULL OR i.operacion = :operacion) AND " +
                        "(:estado IS NULL OR i.estado = :estado) AND " +
                        "(:tipo IS NULL OR i.tipo = :tipo) AND " +
                        "(:precioMin IS NULL OR i.precio >= :precioMin) AND " +
                        "(:precioMax IS NULL OR i.precio <= :precioMax) AND " +
                        "(:habs IS NULL OR i.habitaciones >= :habs) AND " +
                        "(:banos IS NULL OR i.banos >= :banos) AND " +
                        "(:supMin IS NULL OR i.superficieUtil >= :supMin) AND " +
                        "(:supMax IS NULL OR i.superficieUtil <= :supMax) AND " +
                        "(:zona IS NULL OR LOWER(i.zona) LIKE LOWER(CONCAT('%', :zona, '%'))) AND " +
                        "(:ciudad IS NULL OR LOWER(i.ciudad) LIKE LOWER(CONCAT('%', :ciudad, '%'))) AND " +
                        "(:cp IS NULL OR i.codigoPostal = :cp)")
        Page<Inmueble> busquedaFiltrada(
                        @Param("referencia") String referencia,
                        @Param("titulo") String titulo,
                        @Param("desc") String desc,
                        @Param("operacion") TipoOperacion operacion,
                        @Param("estado") EstadoInmueble estado,
                        @Param("tipo") com.jerezsur.inmobiliaria.models.enums.TipoInmueble tipo,
                        @Param("precioMin") BigDecimal precioMin,
                        @Param("precioMax") BigDecimal precioMax,
                        @Param("habs") Integer habs,
                        @Param("banos") Integer banos,
                        @Param("supMin") Double supMin,
                        @Param("supMax") Double supMax,
                        @Param("zona") String zona,
                        @Param("ciudad") String ciudad,
                        @Param("cp") String cp,
                        Pageable pageable);

        // Query para limpieza de datos inutiles
        @Modifying
        @Query("DELETE FROM Inmueble i WHERE i.estado = 'RETIRADO' AND i.fechaRegistro < :fecha")
        void borrarInmueblesRetiradosAntiguos(LocalDateTime fecha);

        long countByEstado(EstadoInmueble estado);

        List<Inmueble> findByEstado(EstadoInmueble estado);

        List<Inmueble> findByEstadoAndOperacion(EstadoInmueble disponible, TipoOperacion operacion);

        List<Inmueble> findByDestacadoTrueOrderByFechaRegistroAsc();

        List<Inmueble> findByDestacadoTrueOrderByFechaRegistroDesc();
}
