package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.dto.CitaAnonimaRequest;
import com.jerezsur.inmobiliaria.models.Cita;
import com.jerezsur.inmobiliaria.services.CitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaService citaService;

    /**
     * POST /api/citas/verificar-telefono
     * Envía código de verificación al teléfono.
     * Endpoint público (no requiere autenticación).
     */
    @PostMapping("/verificar-telefono")
    public ResponseEntity<?> enviarCodigo(@RequestBody Map<String, String> body) {
        try {
            String telefono = body.get("telefono");

            if (telefono == null || telefono.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El teléfono es obligatorio"));
            }

            String mensaje = citaService.enviarCodigoVerificacion(telefono);
            return ResponseEntity.ok(Map.of("message", mensaje));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/citas/anonima
     * Crea una cita anónima tras verificación de teléfono.
     * Endpoint público (no requiere autenticación).
     */
    @PostMapping("/anonima")
    public ResponseEntity<?> crearCitaAnonima(@RequestBody CitaAnonimaRequest request) {
        try {
            Cita cita = citaService.crearCitaAnonima(request);

            String lugarTexto = cita.getInmueble() != null
                    ? "en el inmueble seleccionado"
                    : "en nuestra oficina";

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                        "message", "Cita solicitada correctamente " + lugarTexto
                                + ". Un trabajador se pondrá en contacto contigo para confirmarla.",
                        "citaId", cita.getId()
                    ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al crear la cita: " + e.getMessage()));
        }
    }
}