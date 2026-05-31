package com.jerezsur.inmobiliaria.services;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.PostConstruct;

@Service
public class EstadisticasService {

    @Value("${app.python.stats-url:http://localhost:5000}")
    private String pythonUrl;

    private RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        this.restTemplate = new RestTemplate();
        System.out.println("🐍 Python URL configurada: " + pythonUrl);
    }

    @SuppressWarnings("rawtypes") // Para quitar el aviso amarillo del Map.class sin genéricos
    public String generarGrafico(String endpoint, Map<String, Object> datos) {
        try {
            String url = pythonUrl + endpoint;
            System.out.println("🐍 Llamando a Python: " + url);
            ResponseEntity<Map> respuesta = restTemplate.postForEntity(url, datos, Map.class);
            return (String) respuesta.getBody().get("imagen");
        } catch (Exception e) {
            System.err.println("⚠️ Python stats service no disponible: " + e.getMessage());
            return null;
        }
    }
}