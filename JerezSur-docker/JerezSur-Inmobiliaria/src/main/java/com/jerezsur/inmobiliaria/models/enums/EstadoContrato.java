// Enum de estados de un contrato: BORRADOR, PENDIENTE_FIRMA, FIRMADO, CANCELADO.
package com.jerezsur.inmobiliaria.models.enums;

public enum EstadoContrato {
    BORRADOR, // En proceso
    PENDIENTE_FIRMA, // Solo falta la firma
    FIRMADO, // Finalizado
    CANCELADO // Cancelado
}