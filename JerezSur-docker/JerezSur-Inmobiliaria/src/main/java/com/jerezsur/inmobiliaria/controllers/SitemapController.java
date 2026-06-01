package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final InmuebleRepository inmuebleRepository;

    @Value("${app.base-url:http://localhost}")
    private String baseUrl;

    private static final DateTimeFormatter W3C = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * GET /sitemap.xml
     * Genera un sitemap dinámico con todas las páginas públicas de la web
     * y todas las fichas de inmuebles disponibles.
     */
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    @Transactional(readOnly = true)
    public ResponseEntity<String> sitemap() {
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Páginas estáticas
        addUrl(xml, baseUrl + "/", "1.0", "weekly");
        addUrl(xml, baseUrl + "/inmuebles", "0.9", "daily");
        addUrl(xml, baseUrl + "/sobre-nosotros", "0.5", "monthly");
        addUrl(xml, baseUrl + "/contacto", "0.6", "monthly");
        addUrl(xml, baseUrl + "/propietarios", "0.7", "monthly");

        // Fichas de inmuebles disponibles
        List<Inmueble> disponibles = inmuebleRepository.findByEstado(EstadoInmueble.DISPONIBLE);
        for (Inmueble inmueble : disponibles) {
            String loc = baseUrl + "/inmuebles/" + inmueble.getId();
            String lastmod = inmueble.getFechaUltimaActualizacion() != null
                    ? inmueble.getFechaUltimaActualizacion().format(W3C)
                    : inmueble.getFechaRegistro() != null
                        ? inmueble.getFechaRegistro().format(W3C)
                        : null;

            xml.append("  <url>\n");
            xml.append("    <loc>").append(escapeXml(loc)).append("</loc>\n");
            if (lastmod != null) {
                xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
            }
            xml.append("    <changefreq>weekly</changefreq>\n");
            xml.append("    <priority>0.8</priority>\n");
            xml.append("  </url>\n");
        }

        xml.append("</urlset>");
        return ResponseEntity.ok(xml.toString());
    }

    private void addUrl(StringBuilder xml, String loc, String priority, String changefreq) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(escapeXml(loc)).append("</loc>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }

    private String escapeXml(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
