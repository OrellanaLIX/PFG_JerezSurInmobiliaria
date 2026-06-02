// Excepción base de la aplicación: todas las excepciones personalizadas heredan de esta.
package com.jerezsur.inmobiliaria.exceptions;

//EXCEPCIÓN BASE PERSONALIZADA

public class AppException extends RuntimeException {
    public AppException(String message) {
        super(message);
    }
}