// Enum de estados de una cita: PENDIENTE, CONFIRMADA, REALIZADA, CANCELADA, NO_PRESENTADO.
package com.jerezsur.inmobiliaria.models.enums;

public enum EstadoCita {
    PENDIENTE, // Falta confirmacion del trabajador
    CONFIRMADA, // Por hacerse
    CANCELADA, // No se hará
    REALIZADA // Ya realizada
}
