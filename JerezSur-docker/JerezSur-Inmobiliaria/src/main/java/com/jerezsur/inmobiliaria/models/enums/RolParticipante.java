package com.jerezsur.inmobiliaria.models.enums;

import java.util.List;

public enum RolParticipante {
    TITULAR, // El dueño o comprador principal
    APODERADO, // Firma en nombre de otro con poderes notariales
    AVALISTA // (Solo para interesados/alquiler) El que garantiza el pago
;

    public List<String> valuesAsList() {
        return List.of(values()).stream().map(Enum::name).toList();
    }
}
