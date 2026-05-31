package com.jerezsur.inmobiliaria.models.enums;

public enum EstadoComprador {
    INTERESADO,    // Solo nombre y teléfono, buscando casa
    ACTIVO,       // Visitando casas con frecuencia
    NEGOCIACION,  // Ha hecho una oferta o está en trámites
    CONTRATADO,   // Ya ha firmado un contrato con nosotros
    DESCARTADO    // Ya no busca o no interesa
}
