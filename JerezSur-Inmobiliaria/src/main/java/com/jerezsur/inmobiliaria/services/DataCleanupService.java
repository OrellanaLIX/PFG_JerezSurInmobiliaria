package com.jerezsur.inmobiliaria.services;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.jerezsur.inmobiliaria.repositories.CitaRepository;
import com.jerezsur.inmobiliaria.repositories.ContratoRepository;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.OperacionRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class DataCleanupService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private ContratoRepository contratoRepository;

    @Autowired
    private InmuebleRepository inmuebleRepository;

    @Autowired
    private OperacionRepository operacionRepository;

    // ------------------------------------------------------------------
    // TAREAS PROGRAMADAS (CRON)
    // ------------------------------------------------------------------

    /**
     * MANTENIMIENTO MENSUAL: Se ejecuta el día 1 de cada mes a las 03:00 AM.
     * Purga registros antiguos o cancelados para optimizar el almacenamiento.
     */
    @Scheduled(cron = "0 0 3 1 * *")
    @Transactional
    public void ejecutarLimpiezaProfunda() {
        LocalDateTime haceUnAño = LocalDateTime.now().minusYears(1);
        LocalDateTime haceSeisMeses = LocalDateTime.now().minusMonths(6);

        log.info("Iniciando proceso de limpieza integral de la base de datos...");

        ejecutarLimpiezaPorModulos(haceUnAño, haceSeisMeses);

        log.info("Limpieza completada: Citas, Contratos, Operaciones, Inmuebles y Leads procesados.");
    }

    // ------------------------------------------------------------------
    // LÓGICA DE LIMPIEZA POR MÓDULOS
    // ------------------------------------------------------------------

    private void ejecutarLimpiezaPorModulos(LocalDateTime haceUnAño, LocalDateTime haceSeisMeses) {
        // GESTIÓN DE CITAS: Eliminar canceladas con más de 6 meses
        citaRepository.borrarCitasCanceladasAntiguas(haceSeisMeses);

        // GESTIÓN DE CONTRATOS: Purga de borradores o cancelados antiguos
        contratoRepository.borrarContratosCanceladosAntiguos(haceSeisMeses);

        // GESTIÓN DE OPERACIONES: Solo aquellas sin vínculos contractuales
        // (Integridad FK)
        operacionRepository.borrarOperacionesCanceladasSinContratos();

        // CATÁLOGO DE INMUEBLES: Eliminar inmuebles retirados hace más de 1 año
        inmuebleRepository.borrarInmueblesRetiradosAntiguos(haceUnAño);
    }
}