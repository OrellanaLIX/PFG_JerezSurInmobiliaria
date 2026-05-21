package com.jerezsur.inmobiliaria.repositories;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
public interface InmuebleRepository extends JpaRepository<Inmueble, Long> {

        // Econtramos al cendedor por Email
        Optional<Inmueble> findByTituloContaining(String titulo);

        // Query de filtrado
        @Query("SELECT i FROM Inmueble i WHERE " +
                        "(:referencia IS NULL OR i.referencia = :referencia) AND " +
                        "(:titulo IS NULL OR LOWER(i.titulo) LIKE LOWER(CONCAT('%', :titulo, '%'))) AND " +
                        "(:desc IS NULL OR LOWER(i.descripcion) LIKE LOWER(CONCAT('%', :desc, '%'))) AND " +
                        "(:operacion IS NULL OR i.operacion = :operacion) AND " +
                        "(:estado IS NULL OR i.estado = :estado) AND " +
                        "(:precioMin IS NULL OR i.precio >= :precioMin) AND " +
                        "(:precioMax IS NULL OR i.precio <= :precioMax) AND " +
                        "(:habs IS NULL OR i.habitaciones >= :habs) AND " +
                        "(:banos IS NULL OR i.banos >= :banos) AND " +
                        "(:supMin IS NULL OR i.superficieUtil >= :supMin) AND " +
                        "(:ciudad IS NULL OR LOWER(i.ciudad) LIKE LOWER(CONCAT('%', :ciudad, '%'))) AND " +
                        "(:cp IS NULL OR i.codigoPostal = :cp)")
        Page<Inmueble> busquedaFiltrada(
                        @Param("referencia") String referencia,
                        @Param("titulo") String titulo,
                        @Param("desc") String desc,
                        @Param("operacion") TipoOperacion operacion,
                        @Param("estado") EstadoInmueble estado,
                        @Param("precioMin") BigDecimal precioMin,
                        @Param("precioMax") BigDecimal precioMax,
                        @Param("habs") Integer habs,
                        @Param("banos") Integer banos,
                        @Param("supMin") Double supMin,
                        @Param("ciudad") String ciudad,
                        @Param("cp") String cp,
                        Pageable pageable);

        // Query para limpieza de datos inutiles
        @Modifying
        @Query("DELETE FROM Inmueble i WHERE i.estado = 'RETIRADO' AND i.fechaRegistro < :fecha")
        void borrarInmueblesRetiradosAntiguos(LocalDateTime fecha);

        long countByEstado(EstadoInmueble estado);
}
