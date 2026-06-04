package com.jerezsur.inmobiliaria.repositories;

import com.jerezsur.inmobiliaria.models.MensajeContacto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repositorio de mensajes de contacto: consultas por estado de lectura y paginadas.
public interface MensajeContactoRepository extends JpaRepository<MensajeContacto, Long> {
    
    // Para que el admin vea primero los mensajes no leídos
    Page<MensajeContacto> findByLeidoFalseOrderByFechaEnvioDesc(Pageable pageable);

    // Para ver todos los mensajes asociados a un piso específico
    List<MensajeContacto> findByInmuebleId(Long inmuebleId);

    // Para buscar mensajes de un mismo emisor
    Page<MensajeContacto> findByEmailOrTelefono(String email, String telefono, Pageable pageable);

    // LIMPIEZA: elimina mensajes ya leídos con más de 6 meses (ya gestionados, no aportan valor)
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
        "DELETE FROM MensajeContacto m WHERE m.leido = true AND m.fechaEnvio < :fecha")
    int borrarMensajesLeidosAntiguos(@org.springframework.data.repository.query.Param("fecha") java.time.LocalDateTime fecha);
}