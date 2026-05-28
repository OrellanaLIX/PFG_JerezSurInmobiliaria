package com.jerezsur.inmobiliaria.services;

public interface EmailService {
    void enviarAlUsuario(String destinatario, String asunto, String cuerpoHtml);
    void enviarAlAdmin(String asunto, String cuerpoHtml);
}
