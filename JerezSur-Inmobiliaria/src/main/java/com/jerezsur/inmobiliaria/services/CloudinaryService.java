package com.jerezsur.inmobiliaria.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    // ── SUBIR IMAGEN ──────────────────────────────────────────────────

    /**
     * Sube una imagen de inmueble.
     * Devuelve la URL pública segura.
     * carpeta: "jerezsur/inmuebles/{referencia}"
     */
    public String subirImagenInmueble(MultipartFile archivo, String referencia) throws IOException {
        validarImagen(archivo);

        Map<?, ?> resultado = cloudinary.uploader().upload(
            archivo.getBytes(),
            ObjectUtils.asMap(
                "folder",          "jerezsur/inmuebles/" + referencia,
                "use_filename",    true,
                "unique_filename", true,
                "overwrite",       false,
                // Transformación automática: máx 1920px, calidad auto
                "transformation",  "w_1920,h_1080,c_limit,q_auto,f_auto",
                // 🌟 SOLUCIÓN AL ERROR: Forzamos el uso de la firma del Backend saltándonos los presets vacíos
                "unsigned",        false 
            )
        );

        return (String) resultado.get("secure_url");
    }

    /**
     * Sube una imagen de perfil de usuario.
     * Aplica recorte centrado 400x400.
     */
    public String subirFotoPerfil(MultipartFile archivo, Long usuarioId) throws IOException {
        validarImagen(archivo);

        Map<?, ?> resultado = cloudinary.uploader().upload(
            archivo.getBytes(),
            ObjectUtils.asMap(
                "folder",          "jerezsur/perfiles",
                "public_id",       "usuario_" + usuarioId,
                "overwrite",       true,   // Reemplaza la foto anterior
                "transformation",  "w_400,h_400,c_fill,g_face,q_auto,f_auto",
                // 🌟 SOLUCIÓN AL ERROR: Forzamos subida autenticada
                "unsigned",        false 
            )
        );

        return (String) resultado.get("secure_url");
    }

    // ── SUBIR PDF ─────────────────────────────────────────────────────

    /**
     * Sube un PDF de documentación de inmueble.
     * tipo: "certificado_energetico" | "nota_simple" | "plano"
     */
    public String subirDocumentoPdf(MultipartFile archivo, String referencia, String tipo) throws IOException {
        validarPdf(archivo);

        Map<?, ?> resultado = cloudinary.uploader().upload(
            archivo.getBytes(),
            ObjectUtils.asMap(
                "folder",          "jerezsur/documentos/" + referencia,
                "public_id",       tipo + "_" + referencia,
                "resource_type",   "raw",   // Obligatorio para PDFs
                "overwrite",       true,
                "use_filename",    true,
                // 🌟 SOLUCIÓN AL ERROR: Forzamos subida autenticada
                "unsigned",        false 
            )
        );

        return (String) resultado.get("secure_url");
    }

    // ── ELIMINAR ARCHIVO ──────────────────────────────────────────────

    /**
     * Elimina un archivo de Cloudinary por su URL pública.
     * Funciona tanto para imágenes como para PDFs.
     */
    public void eliminar(String urlPublica, boolean esPdf) throws IOException {
        if (urlPublica == null || urlPublica.isBlank()) return;

        String publicId = extraerPublicId(urlPublica);

        cloudinary.uploader().destroy(
            publicId,
            ObjectUtils.asMap(
                "resource_type", esPdf ? "raw" : "image"
            )
        );
        System.out.println("🗑 Cloudinary: eliminado " + publicId);
    }

    // ── VALIDACIONES ──────────────────────────────────────────────────

    private void validarImagen(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty())
            throw new IllegalArgumentException("El archivo está vacío");

        String contentType = archivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
            throw new IllegalArgumentException("El archivo debe ser una imagen (JPG, PNG, WEBP)");

        // Máx 10MB
        if (archivo.getSize() > 10 * 1024 * 1024)
            throw new IllegalArgumentException("La imagen no puede superar 10MB");
    }

    private void validarPdf(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty())
            throw new IllegalArgumentException("El archivo está vacío");

        String contentType = archivo.getContentType();
        if (!"application/pdf".equals(contentType))
            throw new IllegalArgumentException("El archivo debe ser un PDF");

        // Máx 20MB
        if (archivo.getSize() > 20 * 1024 * 1024)
            throw new IllegalArgumentException("El PDF no puede superar 20MB");
    }

    /**
     * Extrae el public_id de una URL de Cloudinary.
     * Ej: https://res.cloudinary.com/demo/image/upload/v123/jerezsur/inmuebles/PI-001/foto.jpg
     * →  jerezsur/inmuebles/PI-001/foto
     */
    private String extraerPublicId(String url) {
        // Buscamos el segmento tras /upload/vXXXX/
        String[] partes = url.split("/upload/");
        if (partes.length < 2) return url;

        String conVersion = partes[1];
        // Quitamos el prefijo de versión (v1234567890/)
        String sinVersion = conVersion.replaceFirst("v\\d+/", "");
        // Quitamos la extensión
        int punto = sinVersion.lastIndexOf('.');
        return punto > 0 ? sinVersion.substring(0, punto) : sinVersion;
    }
}