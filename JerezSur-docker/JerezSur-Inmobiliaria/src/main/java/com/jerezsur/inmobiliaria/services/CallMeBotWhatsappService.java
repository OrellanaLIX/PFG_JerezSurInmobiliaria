package com.jerezsur.inmobiliaria.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

// Implementación del servicio de WhatsApp usando la API gratuita de CallMeBot.
// CallMeBot permite enviar mensajes de WhatsApp a través de una URL GET con el texto y el número.
// IMPORTANTE: el número de teléfono debe estar registrado previamente en CallMeBot (enviar "/start" al bot).
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
            // CallMeBot decodifica '+' como espacio y '%0A' como salto de línea,
            // PERO no decodifica '%3A', '%40' etc. (limitación de su API).
            // Por eso hacemos el encoding mínimo necesario: solo los caracteres
            // que romperían la estructura de la URL, dejando ':' y '@' sin codificar.
            String texto = mensaje
                    .replace("&",  "%26")   // & separaría parámetros URL
                    .replace("#",  "%23")   // # iniciaría un fragmento URL
                    .replace("\n", "%0A")   // CallMeBot SI decodifica %0A como salto de línea
                    .replace(" ",  "+");    // CallMeBot SI decodifica + como espacio

            String urlStr = "https://api.callmebot.com/whatsapp.php"
                    + "?phone=" + telefonoLimpio
                    + "&text="  + texto
                    + "&apikey=" + apiKey;

            // Usamos HttpURLConnection directamente para que Spring no re-codifique la URL
            URL url = URI.create(urlStr).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(10000);
            int code = conn.getResponseCode();
            // Consumimos el stream para liberar la conexión
            try (InputStream is = conn.getInputStream()) { is.readAllBytes(); }
            conn.disconnect();
            log.info("[WHATSAPP] Enviado a {}. HTTP {}", telefonoLimpio, code);

        } catch (Exception e) {
            log.error("[WHATSAPP] Error al enviar a {}: {}", telefonoLimpio, e.getMessage());
        }
    }

    private String limpiarTelefono(String telefono) {
        return telefono.replaceAll("[+\\s\\-]", "");
    }
}
