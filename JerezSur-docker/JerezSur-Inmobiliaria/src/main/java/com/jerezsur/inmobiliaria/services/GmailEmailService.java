package com.jerezsur.inmobiliaria.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

// Implementación del servicio de email usando JavaMailSender (Spring Mail + SMTP de Gmail).
// La configuración SMTP (host, puerto, usuario, contraseña) está en application.properties.
// Implementa la interfaz EmailService para que podamos cambiar de proveedor fácilmente.
@Service
public class GmailEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(GmailEmailService.class);

    // JavaMailSender es el bean de Spring que gestiona la conexión SMTP
    @Autowired
    private JavaMailSender mailSender;

    // Dirección desde la que se envían los emails (configurada en application.properties)
    @Value("${app.email.remitente}")
    private String remitente;

    // Nombre que verá el destinatario en el campo "De:" del email
    @Value("${app.email.nombre-remitente}")
    private String nombreRemitente;

    // Email del administrador que recibe las notificaciones internas
    @Value("${app.email.admin}")
    private String emailAdmin;

    @Override
    public void enviarAlUsuario(String destinatario, String asunto, String cuerpoHtml) {
        enviar(destinatario, asunto, cuerpoHtml);
    }

    // Método privado que realiza el envío real del email en formato HTML
    // Si falla, solo lo logueamos como error — no lanzamos excepción para no romper el flujo principal
    private void enviar(String destinatario, String asunto, String cuerpoHtml) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            // true = multipart (necesario para HTML), "UTF-8" = codificación para acentos y caracteres especiales
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(new InternetAddress(remitente, nombreRemitente));
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true); // true = es HTML (no texto plano)

            mailSender.send(mensaje);
            log.info("✅ [EMAIL] Enviado correctamente a: {}", destinatario);

        } catch (Exception e) {
            log.error("❌ [EMAIL] Error al enviar a {}: {}", destinatario, e.getMessage());
        }
    }
}