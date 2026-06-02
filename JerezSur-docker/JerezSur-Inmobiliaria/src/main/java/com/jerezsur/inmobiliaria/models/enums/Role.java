// Enum de roles de usuario en el sistema: ROLE_ADMIN, ROLE_TRABAJADOR, ROLE_INTERESADO, etc.
package com.jerezsur.inmobiliaria.models.enums;

public enum Role {
    ROLE_ADMIN, // Administradores de la Web (YO)
    ROLE_TRABAJADOR, // Trabajadores de JerezSur
    ROLE_INTERESADO, // Interesados y/o compradores de inmuebles
    ROLE_VENDEDOR, // Vendedores de inmuebles
    ROLE_AMBOS, // Usuarios que son tanto interesados como vendedores
    ROLE_NOROL
}
