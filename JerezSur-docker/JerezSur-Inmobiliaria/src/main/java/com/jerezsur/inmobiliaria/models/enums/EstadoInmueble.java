package com.jerezsur.inmobiliaria.models.enums;

public enum EstadoInmueble {
    DISPONIBLE,   // Visible en la web
    RESERVADO,    // Visible pero con aviso de reserva
    VENDIDO,      // Ya no aparece en búsquedas públicas, pero sigue en el historial
    RETIRADO      // El dueño decidió no venderlo más
}