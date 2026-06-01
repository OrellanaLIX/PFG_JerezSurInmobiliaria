package com.jerezsur.inmobiliaria.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class CallMeBotWhatsappService implements WhatsappService {

    @Value("${app.whatsapp.apikey}")
    private String apiKey;

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
            // CallMeBot requiere el texto URL-encodeado manualmente
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