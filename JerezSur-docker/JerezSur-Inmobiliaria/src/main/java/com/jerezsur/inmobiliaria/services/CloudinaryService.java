package com.jerezsur.inmobiliaria.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Map;

/**
 * Servicio que gestiona la subida y descarga de archivos a Cloudinary.
 *
 * Cloudinary es un servicio en la nube para almacenar imágenes y archivos.
 * En vez de guardar los archivos en el servidor (que en Docker se perderían
 * al reiniciar), los subimos a Cloudinary y guardamos solo la URL en la BD.
 *
 * Para las imágenes las subimos normal (acceso público).
 * Para los PDFs los ciframos con AES-256 antes de subirlos, así aunque alguien
 * consiga la URL de Cloudinary, solo verá datos ilegibles sin nuestra clave.
 */
@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    // La clave de cifrado viene de application.properties (o variable de entorno en Docker)
    // Tiene que tener al menos 32 caracteres para AES-256
    @Value("${app.pdf.encryption-key}")
    private String encryptionKeyRaw;

    // AES/CBC/PKCS5Padding: el algoritmo de cifrado simétrico que usamos
    // CBC necesita un IV (vector de inicialización) diferente cada vez para mayor seguridad
    private static final String AES_ALGO = "AES/CBC/PKCS5Padding";
    private static final String KEY_ALGO = "AES";
    private static final int    IV_BYTES = 16; // AES siempre usa bloques de 128 bits = 16 bytes


    // =========================================================================
    // IMÁGENES — subida normal, URL pública
    // =========================================================================

    /**
     * Sube una imagen de inmueble a Cloudinary.
     * Las imágenes son públicas porque tienen que verse en la web sin login.
     * Aplicamos una transformación automática para limitar el tamaño máximo (1920x1080)
     * y optimizar la calidad, así cargará más rápido en el frontend.
     */
    public String subirImagenInmueble(MultipartFile archivo, String referencia) throws IOException {
        validarImagen(archivo);

        Map<?, ?> result = cloudinary.uploader().upload(
            archivo.getBytes(),
            ObjectUtils.asMap(
                "folder",          "jerezsur/inmuebles/" + referencia,
                "use_filename",    true,
                "unique_filename", true,
                "overwrite",       false,
                // Cloudinary hace la transformación automáticamente al subir
                "transformation",  "w_1920,h_1080,c_limit,q_auto,f_auto"
            )
        );

        // secure_url devuelve siempre HTTPS, que es lo que queremos
        return (String) result.get("secure_url");
    }

    /**
     * Sube la foto de perfil de un usuario.
     * Se recorta en cuadrado de 400x400 centrando la cara si la detecta.
     * Usamos overwrite:true para que siempre reemplace la foto anterior del mismo usuario.
     */
    public String subirFotoPerfil(MultipartFile archivo, Long usuarioId) throws IOException {
        validarImagen(archivo);

        Map<?, ?> result = cloudinary.uploader().upload(
            archivo.getBytes(),
            ObjectUtils.asMap(
                "folder",         "jerezsur/perfiles",
                "public_id",      "usuario_" + usuarioId,
                "overwrite",      true,
                "transformation", "w_400,h_400,c_fill,g_face,q_auto,f_auto"
            )
        );
        return (String) result.get("secure_url");
    }


    // =========================================================================
    // PDFs — cifrado AES-256 antes de subir (privados)
    // =========================================================================

    /**
     * Cifra el contenido del PDF con AES-256 y lo sube a Cloudinary como blob binario.
     *
     * El flujo es:
     *   1. Cogemos los bytes del PDF
     *   2. Los ciframos con AES-256-CBC (con un IV aleatorio cada vez)
     *   3. Subimos el resultado cifrado a Cloudinary
     *   4. Guardamos la URL en la base de datos
     *
     * Así aunque alguien consiga la URL, solo puede descargar datos cifrados ilegibles.
     * Para ver el PDF real hay que pasar por nuestro endpoint /api/media/documento/descargar
     * que requiere un JWT válido y descifra el contenido antes de devolverlo.
     */
    public String subirDocumentoPdfCifrado(MultipartFile archivo, String referencia, String tipo)
            throws Exception {
        validarPdf(archivo);

        byte[] pdfBytes      = archivo.getBytes();
        byte[] bytesCifrados = cifrar(pdfBytes);

        Map<?, ?> result = cloudinary.uploader().upload(
            bytesCifrados,
            ObjectUtils.asMap(
                "folder",        "jerezsur/documentos_privados/" + referencia,
                "public_id",     tipo + "_" + referencia + "_enc",
                "resource_type", "raw",  // "raw" para subir cualquier tipo de archivo binario
                "overwrite",     true
            )
        );
        return (String) result.get("secure_url");
    }

    /**
     * Descarga los bytes cifrados de Cloudinary y los descifra.
     * Solo se llama desde el endpoint GET /api/media/documento/descargar (protegido con JWT).
     *
     * Usamos RestTemplate para hacer la petición HTTP GET a la URL de Cloudinary.
     * El resultado es el array de bytes cifrados que luego desciframos.
     */
    public byte[] descargarYDescifrarPdf(String cloudinaryUrl) throws Exception {
        RestTemplate rest    = new RestTemplate();
        byte[] bytesCifrados = rest.getForObject(cloudinaryUrl, byte[].class);

        if (bytesCifrados == null || bytesCifrados.length == 0) {
            throw new RuntimeException("No se pudo obtener el documento desde el almacén");
        }

        return descifrar(bytesCifrados);
    }


    // =========================================================================
    // ELIMINAR ARCHIVOS
    // =========================================================================

    /**
     * Elimina un archivo de Cloudinary usando su URL.
     * Primero extraemos el public_id de la URL y luego llamamos al API de Cloudinary.
     * El parámetro esRaw diferencia entre imágenes (resource_type=image) y PDFs (resource_type=raw).
     */
    public void eliminar(String urlPublica, boolean esRaw) throws IOException {
        if (urlPublica == null || urlPublica.isBlank()) return;

        String publicId = extraerPublicId(urlPublica);
        cloudinary.uploader().destroy(
            publicId,
            ObjectUtils.asMap("resource_type", esRaw ? "raw" : "image")
        );
    }


    // =========================================================================
    // CIFRADO AES-256-CBC (métodos privados)
    // =========================================================================

    /**
     * Derivamos la clave AES de la clave textual de configuración.
     * Aplicamos SHA-256 para que siempre tenga exactamente 32 bytes,
     * que es lo que necesita AES-256 independientemente de la longitud del texto.
     */
    private SecretKeySpec derivarClave() throws Exception {
        byte[] hash = MessageDigest.getInstance("SHA-256")
                .digest(encryptionKeyRaw.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(hash, KEY_ALGO);
    }

    /**
     * Cifra un array de bytes con AES-256-CBC.
     *
     * El IV (vector de inicialización) es aleatorio cada vez. Esto es importante
     * porque si cifráramos siempre con el mismo IV, dos PDFs iguales darían
     * el mismo resultado cifrado y eso daría pistas al atacante.
     *
     * El IV se guarda al principio del resultado: [IV (16 bytes)] + [datos cifrados]
     * Así al descifrar sabemos qué IV usar.
     */
    private byte[] cifrar(byte[] datos) throws Exception {
        Cipher cipher = Cipher.getInstance(AES_ALGO);

        // Generamos un IV aleatorio de 16 bytes para esta operación concreta
        byte[] iv = new byte[IV_BYTES];
        new SecureRandom().nextBytes(iv);

        cipher.init(Cipher.ENCRYPT_MODE, derivarClave(), new IvParameterSpec(iv));
        byte[] cifrado = cipher.doFinal(datos);

        // Concatenamos IV + datos cifrados en un solo array para poder recuperar el IV al descifrar
        byte[] resultado = new byte[IV_BYTES + cifrado.length];
        System.arraycopy(iv,      0, resultado, 0,        IV_BYTES);
        System.arraycopy(cifrado, 0, resultado, IV_BYTES, cifrado.length);
        return resultado;
    }

    /**
     * Descifra datos que fueron cifrados por el método cifrar().
     * Extraemos el IV de los primeros 16 bytes y el resto son los datos cifrados.
     */
    private byte[] descifrar(byte[] datos) throws Exception {
        if (datos.length <= IV_BYTES) {
            throw new IllegalArgumentException("Los datos son demasiado cortos, no parece un archivo cifrado válido");
        }

        byte[] iv      = Arrays.copyOfRange(datos, 0,        IV_BYTES);
        byte[] cifrado = Arrays.copyOfRange(datos, IV_BYTES, datos.length);

        Cipher cipher = Cipher.getInstance(AES_ALGO);
        cipher.init(Cipher.DECRYPT_MODE, derivarClave(), new IvParameterSpec(iv));
        return cipher.doFinal(cifrado);
    }


    // =========================================================================
    // VALIDACIONES
    // =========================================================================

    // Comprueba que el archivo sea una imagen y no supere el límite de tamaño
    private void validarImagen(MultipartFile f) {
        if (f == null || f.isEmpty())
            throw new IllegalArgumentException("El archivo está vacío");

        String ct = f.getContentType();
        if (ct == null || !ct.startsWith("image/"))
            throw new IllegalArgumentException("El archivo debe ser una imagen (JPG, PNG, WEBP…)");

        if (f.getSize() > 10L * 1024 * 1024)
            throw new IllegalArgumentException("La imagen no puede superar 10 MB");
    }

    // Comprueba que el archivo sea un PDF válido y no supere 20MB
    private void validarPdf(MultipartFile f) {
        if (f == null || f.isEmpty())
            throw new IllegalArgumentException("El archivo está vacío");

        if (!"application/pdf".equals(f.getContentType()))
            throw new IllegalArgumentException("El archivo debe ser un PDF");

        // Los contratos y documentos legales pueden ser grandes, por eso el límite es 20MB
        if (f.getSize() > 20L * 1024 * 1024)
            throw new IllegalArgumentException("El PDF no puede superar 20 MB");
    }

    /**
     * Extrae el public_id de una URL de Cloudinary.
     * Necesito esto para poder eliminar archivos por su URL.
     *
     * Ejemplo de URL: https://res.cloudinary.com/demo/image/upload/v123/jerezsur/foto.jpg
     * El public_id sería: jerezsur/foto
     */
    private String extraerPublicId(String url) {
        String[] partes = url.split("/upload/");
        if (partes.length < 2) return url;

        String sinVersion = partes[1].replaceFirst("v\\d+/", "");
        int punto = sinVersion.lastIndexOf('.');
        return punto > 0 ? sinVersion.substring(0, punto) : sinVersion;
    }
}
