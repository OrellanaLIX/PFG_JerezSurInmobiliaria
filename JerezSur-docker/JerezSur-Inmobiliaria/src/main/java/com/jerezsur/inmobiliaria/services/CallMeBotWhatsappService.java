package com.jerezsur.inmobiliaria.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

// Implementación del servicio de WhatsApp usando la API gratuita de CallMeBot.
// CallMeBot permite enviar mensajes de WhatsApp a través de una URL GET con el texto y el número.
// IMPORTANTE: el número de teléfono debe estar registrado previamente en CallMeBot (enviar "/start" al bot).
@Slf4j
@Service
public class CallMeBotWhatsappService implements WhatsappService {

    // Clave de API de CallMeBot (se obtiene al activar el bot en WhatsApp)
    @Value("${app.whatsapp.apikey}")
    private String apiKey;

    // Número del administrador que recibirá las notificaciones internas
    @Value("${app.whatsapp.admin-telefono}")
    private String telefonoAdmin;

    @Override
    public void enviarAlUsuario(String telefono, String mensaje) {
        if (telefono == null || telefono.isBlank()) {
            log.warn("[WHATSAPP] Sin teléfono, mensaje no enviado.");
            return;
        }
        enviar(limpiarTelefono(telefono), mensaje);
    }

    @Override
    public void enviarAlAdmin(String mensaje) {
        enviar(limpiarTelefono(telefonoAdmin), mensaje);
    }

    private void enviar(String telefonoLimpio, String mensaje) {
        try {
            // CallMeBot requiere el texto URL-encodeado para que los emojis y caracteres especiales funcionen
            String textoCodificado = URLEncoder.encode(mensaje, StandardCharsets.UTF_8);

            String url = "https://api.callmebot.com/whatsapp.php"
                    + "?phone=" + telefonoLimpio
                    + "&text=" + textoCodificado
                    + "&apikey=" + apiKey;

            RestTemplate restTemplate = new RestTemplate();
            String respuesta = restTemplate.getForObject(url, String.class);
            log.info("[WHATSAPP] Enviado a {}. Respuesta: {}", telefonoLimpio, respuesta);

        } catch (Exception e) {
            log.error("[WHATSAPP] Error al enviar a {}: {}", telefonoLimpio, e.getMessage());
        }
    }

    private String limpiarTelefono(String telefono) {
        // Elimina +, espacios y guiones → "34600000000"
        return telefono.replaceAll("[+\\s\\-]", "");
    }
}