// Enum de estados de una cita. Nombres alineados con el frontend del panel admin.
package com.jerezsur.inmobiliaria.models.enums;

public enum EstadoCita {
    PENDIENTE_ASIGNACION, // Sin trabajador asignado todavía
    CONFIRMADA,           // Trabajador asignado y cita confirmada
    COMPLETADA,           // La visita tuvo lugar correctamente
    CANCELADA,            // Se canceló por cualquier motivo
    NO_PRESENTADO         // El cliente no acudió a la cita
}
