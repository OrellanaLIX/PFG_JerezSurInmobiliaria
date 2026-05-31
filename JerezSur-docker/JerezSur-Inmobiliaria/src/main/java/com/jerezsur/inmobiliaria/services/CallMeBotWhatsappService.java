package com.jerezsur.inmobiliaria.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;


@Service
public class CallMeBotWhatsappService implements WhatsappService {

    @Value("${app.whatsapp.apikey}")
    private String apiKey;

    @Value("${app.whatsapp.admin-telefono}")
    private String telefonoAdmin;

    @Override
    public void enviarAlUsuario(String telefono, String mensaje) {
        if (telefono == null || telefono.isBlank()) {
            System.out.println("⚠️ [WHATSAPP] Sin teléfono, mensaje no enviado: " + mensaje);
            return;
        }
        enviar(limpiarTelefono(telefono), mensaje);
    }

    @Override
    public void enviarAlAdmin(String mensaje) {
        enviar(telefonoAdmin, mensaje);
    }

private void enviar(String telefono, String mensaje) {
    try {
        // Limpiamos el teléfono antes por si acaso viene con espacios o el '+'
        String telefonoLimpio = limpiarTelefono(telefono);

        // USAMOS fromUriString en lugar de fromHttpUrl
        String url = org.springframework.web.util.UriComponentsBuilder
                .fromUriString("https://api.callmebot.com/whatsapp.php")
                .queryParam("phone", telefonoLimpio)
                .queryParam("text", mensaje)
                .queryParam("apikey", apiKey) // Asegúrate de tener esta variable inyectada con @Value
                .build()
                .toUriString();

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getForObject(url, String.class);
        System.out.println("✅ [WHATSAPP] Enviado a: " + telefonoLimpio);

    } catch (Exception e) {
        System.err.println("❌ [WHATSAPP] Error al enviar a " + telefono + ": " + e.getMessage());
    }
}

    private String limpiarTelefono(String telefono) {
        // Elimina +, espacios y guiones → "34600000000"
        return telefono.replaceAll("[+\\s\\-]", "");
    }
}