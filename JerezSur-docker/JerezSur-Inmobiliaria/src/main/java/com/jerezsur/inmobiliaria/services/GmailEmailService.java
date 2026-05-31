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

@Service
public class GmailEmailService implements EmailService {

    // Cambiamos los System.out por un Logger profesional
    private static final Logger log = LoggerFactory.getLogger(GmailEmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.email.remitente}")
    private String remitente;

    @Value("${app.email.nombre-remitente}")
    private String nombreRemitente;

    @Value("${app.email.admin}")
    private String emailAdmin;

    @Override
    public void enviarAlUsuario(String destinatario, String asunto, String cuerpoHtml) {
        enviar(destinatario, asunto, cuerpoHtml);
    }

    @Override
    public void enviarAlAdmin(String asunto, String cuerpoHtml) {
        enviar(emailAdmin, asunto, cuerpoHtml);
    }

    private void enviar(String destinatario, String asunto, String cuerpoHtml) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(new InternetAddress(remitente, nombreRemitente));
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true); // true = es HTML

            mailSender.send(mensaje);
            log.info("✅ [EMAIL] Enviado correctamente a: {}", destinatario);
            
        } catch (Exception e) {
            // Excelente decisión la de no romper el flujo principal, pero lo registramos como error
            log.error("❌ [EMAIL] Error al enviar a {}: {}", destinatario, e.getMessage());
        }
    }
}