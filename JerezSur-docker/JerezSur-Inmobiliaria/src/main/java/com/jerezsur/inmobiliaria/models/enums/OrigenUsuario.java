// Enum del origen del usuario: REGISTRO_WEB, OAUTH_GOOGLE, OAUTH_FACEBOOK, CRM_TRABAJADOR.
package com.jerezsur.inmobiliaria.models.enums;

public enum OrigenUsuario {
    AUTOREGISTRO,      // Se registró desde la web con email/password
    OAUTH,             // Se registró con Google/Facebook/Apple
    CRM_TRABAJADOR,    // Un trabajador creó su ficha
    WEB_CITA,          // Solicitó cita anónima desde la web
    WEB_VENTA          // Pidió valoración para vender desde la web
}