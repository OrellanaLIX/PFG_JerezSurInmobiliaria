package com.jerezsur.inmobiliaria.services;

public interface WhatsappService {
    void enviarAlUsuario(String telefono, String mensaje);
    void enviarAlAdmin(String mensaje);
}
