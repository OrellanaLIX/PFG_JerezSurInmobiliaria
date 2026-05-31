package com.jerezsur.inmobiliaria.exceptions;

//ERRORRES 404 (RECURSO NO ENCONTRADO)

public class ResourceNotFoundException extends AppException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}