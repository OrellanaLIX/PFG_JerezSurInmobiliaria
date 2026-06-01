package com.jerezsur.inmobiliaria.handlers;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manejador global de errores de la API REST.
 * Centraliza todas las respuestas de error para que el frontend siempre reciba
 * el mismo formato JSON: { "error": "...", "status": 400, "timestamp": "..." }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404 — Recurso no encontrado ──────────────────────────────────
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // ── 400 — Validación de negocio ──────────────────────────────────
    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessValidation(BusinessValidationException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // ── 400 — Argumento ilegal ────────────────────────────────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // ── 400 — Errores de validación de Bean (@Valid en los DTOs) ─────
    // Cuando el frontend manda un cuerpo que no cumple las anotaciones (@NotBlank, @Email, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleBeanValidation(MethodArgumentNotValidException ex) {
        // Recorremos todos los errores de campo y los juntamos en un mapa { campo: "mensaje" }
        Map<String, String> camposConError = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fieldError ->
            camposConError.put(fieldError.getField(), fieldError.getDefaultMessage())
        );

        // El primer error es el mensaje principal que mostramos al usuario
        String mensajePrincipal = camposConError.values().stream()
                .findFirst()
                .orElse("Hay campos del formulario con errores.");

        Map<String, Object> cuerpo = buildErrorBody(HttpStatus.BAD_REQUEST, mensajePrincipal);
        cuerpo.put("campos", camposConError);
        return ResponseEntity.badRequest().body(cuerpo);
    }

    // ── 400 — Errores de validación de parámetros de URL (@RequestParam) ─
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        String mensaje = ex.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
        return error(HttpStatus.BAD_REQUEST, mensaje.isEmpty() ? "Parámetros no válidos." : mensaje);
    }

    // ── 400 — Falta un parámetro obligatorio en la URL ───────────────
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(MissingServletRequestParameterException ex) {
        return error(HttpStatus.BAD_REQUEST,
                "Falta el parámetro obligatorio '" + ex.getParameterName() + "'.");
    }

    // ── 413 — Archivo demasiado grande ───────────────────────────────
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleFileTooLarge(MaxUploadSizeExceededException ex) {
        return error(HttpStatus.PAYLOAD_TOO_LARGE,
                "El archivo es demasiado grande. El tamaño máximo permitido es 20 MB.");
    }

    // ── 500 — Cualquier otro error inesperado ────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        // En producción nunca mostramos el mensaje técnico al cliente por seguridad
        return error(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ha ocurrido un error inesperado en el servidor. Por favor, inténtalo de nuevo.");
    }

    // ── Helper: construye el cuerpo de error estándar ────────────────
    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String mensaje) {
        return ResponseEntity.status(status).body(buildErrorBody(status, mensaje));
    }

    private Map<String, Object> buildErrorBody(HttpStatus status, String mensaje) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error",   mensaje);
        body.put("status",  status.value());
        body.put("timestamp", LocalDateTime.now().toString());
        return body;
    }
}
