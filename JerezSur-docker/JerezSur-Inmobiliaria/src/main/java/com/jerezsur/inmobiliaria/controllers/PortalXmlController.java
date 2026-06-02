package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.services.PortalInmobiliarioXmlService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Controlador que genera los feeds XML para portales inmobiliarios (Fotocasa, Idealista, etc.).
// Los feeds son públicos y sin autenticación para que los portales puedan importarlos automáticamente.
@Slf4j
@RestController
@RequestMapping("/api/portal")
public class PortalXmlController {

    @Autowired
    private PortalInmobiliarioXmlService xmlService;

    /**
     * Feed completo — todos los inmuebles disponibles.
     * GET /api/portal/feed.xml
     *
     * Este es el endpoint que entregas a Fotocasa/Idealista
     * cuando tengas credenciales de agencia.
     */
    @GetMapping(value = "/feed.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> feedCompleto() {
        try {
            String xml = xmlService.generarFeedCompleto();
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_XML)
                    .header("Content-Disposition", "inline; filename=\"feed.xml\"")
                    .body(xml);
        } catch (Exception e) {
            log.error("Error al generar feed XML completo", e);
            return ResponseEntity.internalServerError().body("<error>Error al generar el feed</error>");
        }
    }

    /**
     * Feed solo ventas.
     * GET /api/portal/feed-ventas.xml
     */
    @GetMapping(value = "/feed-ventas.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> feedVentas() {
        try {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlService.generarFeedPorTipoOperacion(TipoOperacion.VENTA));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Feed solo alquileres.
     * GET /api/portal/feed-alquileres.xml
     */
    @GetMapping(value = "/feed-alquileres.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> feedAlquileres() {
        try {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_XML)
                    .body(xmlService.generarFeedPorTipoOperacion(TipoOperacion.ALQUILER));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}