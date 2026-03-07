package com.jerezsur.inmobiliaria.services;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.jerezsur.inmobiliaria.repositories.InteresadoRepository;

import jakarta.transaction.Transactional;

@Component
public class DataCleanupService {

    @Autowired private InteresadoRepository interesadoRepository;

    // Se ejecuta cada lunes a las 03:00 AM
    // Cron: segundos, minutos, horas, día mes, mes, día semana
    @Scheduled(cron = "0 0 3 1 * *")
    @Transactional
    public void limpiarLeadsInactivos() {
        LocalDateTime haceUnAño = LocalDateTime.now().minusYears(1);

        // Borramos interesados que:
        // 1. No tienen cuenta de usuario (@OneToOne Usuario == null)
        // 2. No tienen citas recientes o no tienen citas
        interesadoRepository.borrarLeadsAntiguos(haceUnAño);
        
        System.out.println("Limpieza periódica completada: Leads antiguos eliminados.");
    }
}