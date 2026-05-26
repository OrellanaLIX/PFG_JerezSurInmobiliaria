package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.dto.CitaResponseDTO;
import com.jerezsur.inmobiliaria.dto.SolicitudCitaPublicaDTO;
import com.jerezsur.inmobiliaria.services.CitaPublicaService;
import com.jerezsur.inmobiliaria.services.CitaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaController {

    private final CitaService citaService;

    private final CitaPublicaService citaPublicaService;

    @GetMapping("/trabajador/{trabajadorId}")
    public ResponseEntity<List<CitaResponseDTO>> misCitas(@PathVariable Long trabajadorId) {
        return ResponseEntity.ok(citaService.getCitasDelTrabajador(trabajadorId));
    }

    @GetMapping("/todas")
    public ResponseEntity<List<CitaResponseDTO>> todasLasCitas() {
        return ResponseEntity.ok(citaService.getAllCitas());
    }

    /**
     * Acepta una cita pendiente. El trabajador que la acepta queda asignado.
     * TODO: extraer trabajadorId del usuario logueado (JWT) en lugar de
     * PathVariable.
     */
    @PatchMapping("/{citaId}/aceptar")
    public ResponseEntity<CitaResponseDTO> aceptarCita(
            @PathVariable Long citaId,
            @RequestParam Long trabajadorId) {
        return ResponseEntity.ok(citaService.aceptarCita(citaId, trabajadorId));
    }

    @PatchMapping("/{citaId}/completar")
    public ResponseEntity<CitaResponseDTO> completarCita(@PathVariable Long citaId) {
        return ResponseEntity.ok(citaService.completarCita(citaId));
    }

    @PatchMapping("/{citaId}/cancelar")
    public ResponseEntity<CitaResponseDTO> cancelarCita(@PathVariable Long citaId) {
        return ResponseEntity.ok(citaService.cancelarCita(citaId));
    }

    @PostMapping("/solicitar")
    public ResponseEntity<CitaResponseDTO> solicitarCita(
            @Valid @RequestBody SolicitudCitaPublicaDTO dto) {
        return ResponseEntity.ok(citaPublicaService.solicitarCitaAnonima(dto));
    }
}