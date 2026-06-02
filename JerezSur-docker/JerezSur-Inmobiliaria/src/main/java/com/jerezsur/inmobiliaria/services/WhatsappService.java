package com.jerezsur.inmobiliaria.services;

// Interfaz del servicio de WhatsApp: define el contrato para enviar mensajes.
// La implementación real es CallMeBotWhatsappService (usa la API gratuita de CallMeBot).
public interface WhatsappService {
    void enviarAlUsuario(String telefono, String mensaje);
    void enviarAlAdmin(String mensaje);
}
