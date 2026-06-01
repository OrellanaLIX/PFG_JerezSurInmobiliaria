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

    @SuppressWarnings("rawtypes")
    public String generarGrafico(String endpoint, Map<String, Object> datos) {
        try {
            String url = pythonUrl + endpoint;
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, datos, Map.class);
            return (String) resp.getBody().get("imagen");
        } catch (Exception e) {
            System.err.println("⚠️ Python stats no disponible: " + e.getMessage());
            return null;
        }
    }

    /**
     * Llama al endpoint /grafico/panel de Python que devuelve los 4 gráficos
     * en un único Map: { kpis, barras, dona, evolucion } → todos base64.
     */
    @SuppressWarnings("rawtypes")
    public Map<?, ?> generarGraficoPanel(String endpoint, Map<String, Object> datos) {
        try {
            String url = pythonUrl + endpoint;
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, datos, Map.class);
            return resp.getBody();
        } catch (Exception e) {
            System.err.println("⚠️ Python panel no disponible: " + e.getMessage());
            return null;
        }
    }
}