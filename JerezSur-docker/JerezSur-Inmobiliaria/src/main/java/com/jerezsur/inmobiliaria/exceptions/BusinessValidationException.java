// Excepción para errores de validación de negocio (datos incorrectos, duplicados, etc.).
// El GlobalExceptionHandler la captura y devuelve un 400 Bad Request al cliente.
package com.jerezsur.inmobiliaria.exceptions;

//ERRORRES 400/422 (VALIDACIÓN DE NEGOCIO)

public class BusinessValidationException extends AppException {
    public BusinessValidationException(String message) {
        super(message);
    }
}