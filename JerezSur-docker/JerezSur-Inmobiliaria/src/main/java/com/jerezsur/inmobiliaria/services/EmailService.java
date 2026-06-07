package com.jerezsur.inmobiliaria.services;

/**
 * Interfaz del servicio de email.
 * Usamos una interfaz para poder cambiar fácilmente de proveedor (Gmail, SendGrid, etc.)
 * sin tocar el código que usa este servicio (NotificacionService).
 * La implementación activa es GmailEmailService, cargada por Spring automáticamente.
 */
public interface EmailService {
    // Envía un email HTML al usuario (bienvenida, verificación, confirmación de cita, etc.)
    void enviarAlUsuario(String destinatario, String asunto, String cuerpoHtml);
}
