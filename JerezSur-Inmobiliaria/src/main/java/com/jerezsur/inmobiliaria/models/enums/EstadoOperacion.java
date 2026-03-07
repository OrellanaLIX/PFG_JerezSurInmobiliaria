package com.jerezsur.inmobiliaria.models.enums;

public enum EstadoOperacion {
    ABIERTA,    // Se están negociando los términos
    DOCUMENTACION, // Generando contratos
    FINALIZADA, // Trámite concluido con éxito
    CANCELADA   // No se llegó a firmar
}