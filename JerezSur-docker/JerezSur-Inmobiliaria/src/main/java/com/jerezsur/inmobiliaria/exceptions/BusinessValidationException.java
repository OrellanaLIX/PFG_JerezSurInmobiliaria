package com.jerezsur.inmobiliaria.exceptions;

//ERRORRES 400/422 (VALIDACIÓN DE NEGOCIO)

public class BusinessValidationException extends AppException {
    public BusinessValidationException(String message) {
        super(message);
    }
}