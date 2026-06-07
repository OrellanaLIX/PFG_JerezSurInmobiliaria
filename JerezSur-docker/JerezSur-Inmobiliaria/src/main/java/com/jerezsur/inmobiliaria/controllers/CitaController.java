package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.dto.ActualizarCitaDTO;
import com.jerezsur.inmobiliaria.dto.CitaAdminDTO;
import com.jerezsur.inmobiliaria.dto.CitaResponseDTO;
import com.jerezsur.inmobiliaria.dto.SolicitudCitaPublicaDTO;
import com.jerezsur.inmobiliaria.dto.SolicitudCitaUsuarioDTO;
import com.jerezsur.inmobiliaria.services.CitaPublicaService;
import com.jerezsur.inmobiliaria.services.CitaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controlador de citas: gestiona las solicitudes de visita tanto de usuarios registrados
// como de personas anónimas que piden cita desde el formulario público
@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaController {

    // CitaService gestiona las citas de usuarios registrados
    private final CitaService citaService;

    // CitaPublicaService gestiona las citas anónimas (sin cuenta)
    private final CitaPublicaService citaPublicaService;

    // Devuelve las citas asignadas a un trabajador concreto (para su calendario personal)
    @GetMapping("/trabajador/{trabajadorId}")
    public ResponseEntity<List<CitaResponseDTO>> misCitas(@PathVariable Long trabajadorId) {
        return ResponseEntity.ok(citaService.getCitasDelTrabajador(trabajadorId));
    }

    // Devuelve todas las citas del sistema (para el calendario general del panel admin)
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

    // Marca la cita como REALIZADA cuando la visita ha tenido lugar
    @PatchMapping("/{citaId}/completar")
    public ResponseEntity<CitaResponseDTO> completarCita(@PathVariable Long citaId) {
        return ResponseEntity.ok(citaService.completarCita(citaId));
    }

    // Cancela la cita pero la mantiene en BD para el histórico
    @PatchMapping("/{citaId}/cancelar")
    public ResponseEntity<CitaResponseDTO> cancelarCita(@PathVariable Long citaId) {
        return ResponseEntity.ok(citaService.cancelarCita(citaId));
    }

    // Endpoint público: cualquier persona (sin cuenta) puede pedir una cita con teléfono y nombre
    @PostMapping("/solicitar")
    public ResponseEntity<CitaResponseDTO> solicitarCita(
            @Valid @RequestBody SolicitudCitaPublicaDTO dto) {
        return ResponseEntity.ok(citaPublicaService.solicitarCitaAnonima(dto));
    }

    // Devuelve las citas de un usuario registrado (para "Mis citas" en el frontend)
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<CitaResponseDTO>> citasDelUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(citaService.getCitasDelUsuario(usuarioId));
    }

    // Crea una cita para un usuario ya registrado (desde la ficha del inmueble o desde su perfil)
    @PostMapping("/usuario/solicitar")
    public ResponseEntity<CitaResponseDTO> solicitarCitaUsuario(
            @Valid @RequestBody SolicitudCitaUsuarioDTO dto) {
        return new ResponseEntity<>(citaService.crearCitaDeUsuario(dto), HttpStatus.CREATED);
    }

    // Crea una cita desde el panel de administración: siempre usa el nombre del formulario
    // (no reutiliza el nombre de un usuario existente por teléfono) y permite asignar
    // un trabajador directamente, pasando la cita a CONFIRMADA al instante.
    @PostMapping("/admin/crear")
    public ResponseEntity<CitaResponseDTO> crearCitaAdmin(
            @Valid @RequestBody CitaAdminDTO dto) {
        return new ResponseEntity<>(citaPublicaService.solicitarCitaAdmin(dto), HttpStatus.CREATED);
    }

    // Marca la cita como NO_PRESENTADO cuando el cliente no acudió a la visita
    @PatchMapping("/{citaId}/no-presentado")
    public ResponseEntity<CitaResponseDTO> noPresentado(@PathVariable Long citaId) {
        return ResponseEntity.ok(citaService.noPresentadoCita(citaId));
    }

    // Actualiza la fecha/hora y el motivo de una cita sin cambiar su estado
    @PatchMapping("/{citaId}")
    public ResponseEntity<CitaResponseDTO> actualizarCita(
            @PathVariable Long citaId,
            @Valid @RequestBody ActualizarCitaDTO dto) {
        return ResponseEntity.ok(citaService.actualizarCita(citaId, dto.getFechaHora(), dto.getMotivo()));
    }
}