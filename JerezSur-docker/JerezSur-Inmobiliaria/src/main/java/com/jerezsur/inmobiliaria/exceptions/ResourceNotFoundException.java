// Excepción para cuando no se encuentra un recurso en la BD (equivalente a un 404).
package com.jerezsur.inmobiliaria.exceptions;

//ERRORRES 404 (RECURSO NO ENCONTRADO)

public class ResourceNotFoundException extends AppException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}