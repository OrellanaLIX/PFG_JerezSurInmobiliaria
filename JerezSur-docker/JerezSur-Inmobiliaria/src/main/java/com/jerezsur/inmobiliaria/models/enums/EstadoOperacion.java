package com.jerezsur.inmobiliaria.models.enums;

public enum EstadoOperacion {
    ABIERTA,        // Se están negociando los términos
    EN_TRAMITE,     // Generando contratos / documentación
    CERRADA,        // Trámite concluido con éxito
    CANCELADA       // No se llegó a firmar
}
