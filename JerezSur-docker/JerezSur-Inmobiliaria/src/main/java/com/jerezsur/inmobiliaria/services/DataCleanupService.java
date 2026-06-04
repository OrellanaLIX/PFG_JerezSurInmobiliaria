package com.jerezsur.inmobiliaria.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.repositories.CitaRepository;
import com.jerezsur.inmobiliaria.repositories.ContratoRepository;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.MensajeContactoRepository;
import com.jerezsur.inmobiliaria.repositories.OperacionRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class DataCleanupService {

    @Autowired private CitaRepository           citaRepository;
    @Autowired private ContratoRepository       contratoRepository;
    @Autowired private InmuebleRepository       inmuebleRepository;
    @Autowired private OperacionRepository      operacionRepository;
    @Autowired private UsuarioRepository        usuarioRepository;
    @Autowired private MensajeContactoRepository mensajeContactoRepository;

    // ------------------------------------------------------------------
    // LIMPIEZA MENSUAL — dia 1 de cada mes a las 03:00 AM
    // ------------------------------------------------------------------

    @Scheduled(cron = "0 0 3 1 * *")
    @Transactional
    public void ejecutarLimpiezaMensual() {
        LocalDateTime haceUnAño     = LocalDateTime.now().minusYears(1);
        LocalDateTime haceSeisMeses = LocalDateTime.now().minusMonths(6);
        LocalDateTime haceTresMeses = LocalDateTime.now().minusMonths(3);

        log.info("[CLEANUP] Iniciando limpieza mensual de la base de datos...");

        // 1. CITAS canceladas con mas de 6 meses
        citaRepository.borrarCitasCanceladasAntiguas(haceSeisMeses);
        log.info("[CLEANUP] Citas canceladas antiguas eliminadas.");

        // 2. CONTRATOS borradores o cancelados con mas de 6 meses
        contratoRepository.borrarContratosCanceladosAntiguos(haceSeisMeses);
        log.info("[CLEANUP] Contratos cancelados antiguos eliminados.");

        // 3. OPERACIONES canceladas sin contratos vinculados
        operacionRepository.borrarOperacionesCanceladasSinContratos();
        log.info("[CLEANUP] Operaciones canceladas sin contratos eliminadas.");

        // 4. INMUEBLES retirados con mas de 1 año
        inmuebleRepository.borrarInmueblesRetiradosAntiguos(haceUnAño);
        log.info("[CLEANUP] Inmuebles retirados con >1 año eliminados.");

        // 5. USUARIOS sin cuenta activada con mas de 6 meses (el plazo para verificar)
        usuarioRepository.deleteByCuentaActivadaFalseAndFechaEliminacionBefore(haceSeisMeses);
        log.info("[CLEANUP] Cuentas no verificadas antiguas eliminadas.");

        // 6. MENSAJES DE CONTACTO leídos con mas de 6 meses (ya gestionados)
        int mensajesBorrados = mensajeContactoRepository.borrarMensajesLeidosAntiguos(haceSeisMeses);
        log.info("[CLEANUP] {} mensajes de contacto leídos eliminados (>6 meses).", mensajesBorrados);

        // 7. USUARIOS con ROLE_NOROL sin perfil con mas de 3 meses (abandonaron el onboarding)
        int usuariosSinPerfil = usuarioRepository.borrarUsuariosSinPerfilAntiguos(haceTresMeses);
        log.info("[CLEANUP] {} usuarios sin perfil eliminados (>3 meses sin completar registro).", usuariosSinPerfil);

        // 8. TOKENS de recuperacion de contraseña expirados (limpieza de seguridad)
        limpiarTokensExpirados();

        log.info("[CLEANUP] Limpieza mensual completada.");
    }

    // ------------------------------------------------------------------
    // LIMPIEZA SEMANAL — lunes a las 04:00 AM (datos mas volátiles)
    // ------------------------------------------------------------------

    @Scheduled(cron = "0 0 4 * * MON")
    @Transactional
    public void ejecutarLimpiezaSemanal() {
        log.info("[CLEANUP] Iniciando limpieza semanal...");

        // Tokens de recuperacion de contraseña expirados (mas sensibles en cuanto a seguridad)
        limpiarTokensExpirados();

        log.info("[CLEANUP] Limpieza semanal completada.");
    }

    // ------------------------------------------------------------------
    // MÉTODOS INTERNOS
    // ------------------------------------------------------------------

    // Limpia tokens de recuperacion de contraseña que ya han expirado.
    // Estos tokens son sensibles: mantenerlos mas tiempo del necesario es un riesgo.
    private void limpiarTokensExpirados() {
        List<Usuario> conTokenExpirado = usuarioRepository
                .findByTokenRecuperacionExpiraLessThan(LocalDateTime.now());
        for (Usuario u : conTokenExpirado) {
            u.setTokenRecuperacion(null);
            u.setTokenRecuperacionExpira(null);
            usuarioRepository.save(u);
        }
        if (!conTokenExpirado.isEmpty()) {
            log.info("[CLEANUP] {} tokens de recuperacion expirados eliminados.", conTokenExpirado.size());
        }
    }
}
