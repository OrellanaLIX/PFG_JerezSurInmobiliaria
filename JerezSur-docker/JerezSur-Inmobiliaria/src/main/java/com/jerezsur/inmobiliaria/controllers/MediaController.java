package com.jerezsur.inmobiliaria.controllers;

import com.jerezsur.inmobiliaria.models.Imagen;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.repositories.ImagenRepository;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import com.jerezsur.inmobiliaria.services.CloudinaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

// Controlador que gestiona todas las subidas y descargas de archivos.
// Las imágenes se suben directamente a Cloudinary (servicio cloud de almacenamiento).
// Los PDFs se cifran con AES-256 antes de subir para proteger documentos sensibles.
@Slf4j
@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired private CloudinaryService cloudinaryService;
    @Autowired private InmuebleRepository inmuebleRepository;
    @Autowired private ImagenRepository imagenRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private com.jerezsur.inmobiliaria.repositories.ContratoRepository contratoRepository;

    // ── IMÁGENES DE INMUEBLES ─────────────────────────────────────────

    // Sube una imagen a Cloudinary y la asocia al inmueble en la BD
    // Si esPortada=true, quita la portada anterior y pone esta como nueva portada
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
            log.error("Error al subir imagen del inmueble {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al subir la imagen."));
        }
    }

    // Elimina una imagen tanto de Cloudinary como de la base de datos
    @DeleteMapping("/imagen/{id}")
    public ResponseEntity<?> eliminarImagen(@PathVariable Long id) {
        try {
            Imagen imagen = imagenRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
            cloudinaryService.eliminar(imagen.getUrl(), false);
            imagenRepository.delete(imagen);
            return ResponseEntity.ok(Map.of("mensaje", "Imagen eliminada correctamente"));
        } catch (Exception e) {
            log.error("Error al eliminar imagen {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al eliminar la imagen."));
        }
    }

    // ── PDFs DE INMUEBLES (cifrados) ──────────────────────────────────

    // Sube un PDF cifrado (certificado energético, nota simple o plano) asociado al inmueble
    // El tipo determina qué campo de la entidad Inmueble se actualiza con la URL
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
            log.error("Error al subir documento del inmueble {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al subir el documento."));
        }
    }

    // ── PDFs DE CONTRATOS (cifrados) ──────────────────────────────────

    // Sube el PDF del contrato cifrado a Cloudinary y guarda la URL en la BD
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
            log.error("Error al subir documento del contrato {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al subir el contrato."));
        }
    }

    // Elimina el PDF del contrato de Cloudinary y pone la URL a null en la BD
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
            log.error("Error al eliminar documento del contrato {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al eliminar el documento."));
        }
    }

    // ── DESCARGA Y DESCIFRADO DE PDFs ─────────────────────────────────

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
            log.error("Error al descargar/descifrar documento", e);
            return ResponseEntity.status(500).build();
        }
    }

    // ── FOTO DE PERFIL ────────────────────────────────────────────────

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
            log.error("Error al subir foto de perfil del usuario {}", id, e);
            return ResponseEntity.status(500).body(Map.of("error", "Error al subir la foto de perfil."));
        }
    }
}
