package com.jerezsur.inmobiliaria.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración del cliente Cloudinary para el almacenamiento de imágenes y documentos.
 *
 * Cloudinary es el servicio externo que usamos para guardar las fotos de los inmuebles
 * y los PDFs (nota simple, plano, certificado energético). Las credenciales vienen de
 * application.properties para no hardcodearlas en el código (que acabaría en el repositorio).
 *
 * Con "secure: true" forzamos que todas las URLs de los recursos usen HTTPS,
 * lo cual es necesario para que el navegador las cargue sin mixed-content warnings.
 */
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.upload-preset}")
    private String uploadPreset;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * Registra el cliente Cloudinary como bean de Spring para poder inyectarlo
     * en los servicios de subida de archivos con @Autowired o constructor injection.
     */
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "uploadPreset", uploadPreset,
            "api_key",    apiKey,
            "api_secret", apiSecret,
            "secure",     true
        ));
    }
}