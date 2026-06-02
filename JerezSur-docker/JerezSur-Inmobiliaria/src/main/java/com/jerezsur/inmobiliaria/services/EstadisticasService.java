package com.jerezsur.inmobiliaria.services;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.PostConstruct;

// Servicio que se comunica con el microservicio Python de generación de gráficos.
// Python usa matplotlib para generar imágenes base64 que el frontend pinta directamente en <img>.
// Si Python no está disponible, devuelve null y el frontend muestra un estado alternativo.
@Slf4j
@Service
public class EstadisticasService {

    // URL del microservicio Python configurada en application.properties o variable de entorno
    @Value("${app.python.stats-url:http://localhost:5000}")
    private String pythonUrl;

    private RestTemplate restTemplate;

    // @PostConstruct se ejecuta justo después de crear el bean (al arrancar la app)
    // Lo usamos para inicializar RestTemplate y loguear la URL de Python configurada
    @PostConstruct
    public void init() {
        this.restTemplate = new RestTemplate();
        log.info("Python stats URL: {}", pythonUrl);
    }

    // Llama a un endpoint de Python y devuelve la imagen en base64 (un único gráfico)
    // Si Python no responde, devuelve null sin romper la app — el gráfico simplemente no aparece
    @SuppressWarnings("rawtypes")
    public String generarGrafico(String endpoint, Map<String, Object> datos) {
        try {
            String url = pythonUrl + endpoint;
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, datos, Map.class);
            return (String) resp.getBody().get("imagen");
        } catch (Exception e) {
            log.warn("Python stats no disponible en {}: {}", endpoint, e.getMessage());
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
            log.warn("Python panel no disponible en {}: {}", endpoint, e.getMessage());
            return null;
        }
    }
}