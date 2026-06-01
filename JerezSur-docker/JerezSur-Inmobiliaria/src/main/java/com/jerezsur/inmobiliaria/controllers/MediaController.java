package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.models.Imagen;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.repositories.ImagenRepository;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import com.jerezsur.inmobiliaria.services.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired private CloudinaryService cloudinaryService;
    @Autowired private InmuebleRepository inmuebleRepository;
    @Autowired private ImagenRepository imagenRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private com.jerezsur.inmobiliaria.repositories.ContratoRepository contratoRepository;

    // ── IMÁGENES DE INMUEBLES (públicas, sin cambios) ─────────────────

    @PostMapping("/inmueble/{id}/imagen")
    @Transactional
    public ResponseEntity<?> subirImagenInmueble(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam(value = "esPortada", defaultValue = "false") boolean esPortada) {
        try {
            Inmueble inmueble = inmuebleRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Inmueble no encontrado"));

            if (esPortada) {
                inmueble.getImagenes().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getEsPortada()))
                    .forEach(img -> { img.setEsPortada(false); imagenRepository.save(img); });
            }

            String url = cloudinaryService.subirImagenInmueble(archivo, inmueble.getReferencia());

            Imagen imagen = Imagen.builder()
                    .url(url)
                    .nombreArchivo(archivo.getOriginalFilename())
                    .esPortada(esPortada)
                    .inmueble(inmueble)
                    .build();
            imagenRepository.save(imagen);

            return ResponseEntity.ok(Map.of("mensaje", "Imagen subida correctamente", "url", url, "id", imagen.getId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al subir imagen: " + e.getMessage()));
        }
    }

    @DeleteMapping("/imagen/{id}")
    public ResponseEntity<?> eliminarImagen(@PathVariable Long id) {
        try {
            Imagen imagen = imagenRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
            cloudinaryService.eliminar(imagen.getUrl(), false);
            imagenRepository.delete(imagen);
            return ResponseEntity.ok(Map.of("mensaje", "Imagen eliminada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── PDFs DE INMUEBLES (cifrados) ──────────────────────────────────

    /**
     * Sube un PDF de inmueble cifrado con AES-256.
     * tipo: certificado_energetico | nota_simple | plano
     */
    @PostMapping("/inmueble/{id}/documento")
    public ResponseEntity<?> subirDocumento(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("tipo") String tipo) {
        try {
            Inmueble inmueble = inmuebleRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Inmueble no encontrado"));

            String url = cloudinaryService.subirDocumentoPdfCifrado(
                    archivo, inmueble.getReferencia(), tipo);

            switch (tipo) {
                case "certificado_energetico" -> inmueble.setUrlCertificadoEnergetico(url);
                case "nota_simple"            -> inmueble.setUrlNotaSimple(url);
                case "plano"                  -> inmueble.setUrlPlanoInmueble(url);
                default -> throw new IllegalArgumentException(
                    "Tipo no válido. Usa: certificado_energetico, nota_simple, plano");
            }
            inmuebleRepository.save(inmueble);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Documento cifrado y subido correctamente",
                "url",     url,
                "tipo",    tipo
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al subir documento: " + e.getMessage()));
        }
    }

    // ── PDFs DE CONTRATOS (cifrados) ──────────────────────────────────

    @PostMapping("/contrato/{id}/documento")
    public ResponseEntity<?> subirDocumentoContrato(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        try {
            var contrato = contratoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Contrato no encontrado"));

            String referencia = "contratos/" + id;
            if (contrato.getOperacion() != null
                    && contrato.getOperacion().getInmueble() != null
                    && contrato.getOperacion().getInmueble().getReferencia() != null) {
                referencia = contrato.getOperacion().getInmueble().getReferencia();
            }

            String url = cloudinaryService.subirDocumentoPdfCifrado(
                    archivo, referencia, "contrato_" + id);

            contrato.setUrlDocumentoPdf(url);
            contratoRepository.save(contrato);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Contrato cifrado y subido correctamente",
                "url",     url,
                "id",      contrato.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al subir contrato: " + e.getMessage()));
        }
    }

    @DeleteMapping("/contrato/{id}")
    public ResponseEntity<?> eliminarDocumentoContrato(@PathVariable Long id) {
        try {
            var contrato = contratoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Contrato no encontrado"));
            String url = contrato.getUrlDocumentoPdf();
            if (url != null && !url.isBlank()) {
                cloudinaryService.eliminar(url, true);
                contrato.setUrlDocumentoPdf(null);
                contratoRepository.save(contrato);
            }
            return ResponseEntity.ok(Map.of("mensaje", "Documento de contrato eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── DESCARGA Y DESCIFRADO DE PDFs ─────────────────────────────────

    /**
     * GET /api/media/documento/descargar?url=URL_CLOUDINARY
     *
     * Endpoint protegido (requiere JWT). Descarga el blob cifrado de Cloudinary,
     * lo descifra con AES-256 y lo sirve como application/pdf al cliente.
     * La URL de Cloudinary por sí sola es inútil: contiene contenido binario cifrado.
     */
    @GetMapping("/documento/descargar")
    public ResponseEntity<byte[]> descargarDocumento(@RequestParam String url) {
        try {
            if (url == null || url.isBlank()) {
                return ResponseEntity.badRequest().build();
            }

            byte[] pdfBytes = cloudinaryService.descargarYDescifrarPdf(url);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"documento.pdf\"")
                    .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .body(pdfBytes);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // ── FOTO DE PERFIL (pública, sin cambios) ─────────────────────────

    @PostMapping("/usuario/{id}/foto")
    public ResponseEntity<?> subirFotoPerfil(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        try {
            var usuario = usuarioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            String url = cloudinaryService.subirFotoPerfil(archivo, id);
            usuario.setImagenPerfilUrl(url);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(Map.of("mensaje", "Foto de perfil actualizada", "url", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
