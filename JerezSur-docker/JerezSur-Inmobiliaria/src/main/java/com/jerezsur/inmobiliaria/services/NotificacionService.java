package com.jerezsur.inmobiliaria.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jerezsur.inmobiliaria.models.Usuario;

@Service
public class NotificacionService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private WhatsappService whatsappService;

    // ──────────────────────────────────────────
    // REGISTRO DE NUEVO USUARIO (CON VALIDACIÓN)
    // ──────────────────────────────────────────

    public void notificarNuevoUsuario(Usuario usuario, String tokenVerificacion) {
        // Al admin por WhatsApp
        String msgAdmin = "🆕 Nuevo usuario registrado:\n"
                + "Nombre: " + usuario.getNombre() + " " + (usuario.getApellidos() != null ? usuario.getApellidos() : "") + "\n"
                + "Email: " + (usuario.getEmail() != null ? usuario.getEmail() : "—") + "\n"
                + "Teléfono: " + (usuario.getTelefono() != null ? usuario.getTelefono() : "—") + "\n"
                + "Origen: " + usuario.getOrigen();
        whatsappService.enviarAlAdmin(msgAdmin);

        // Al usuario por email si tiene (con enlace para validar cuenta)
        if (usuario.getEmail() != null) {
            emailService.enviarAlUsuario(
                    usuario.getEmail(),
                    "Activa tu cuenta - JerezSur Inmobiliaria",
                    buildEmailBienvenida(usuario, tokenVerificacion));
        }
    }

    // ──────────────────────────────────────────
    // RECUPERAR CONTRASEÑA
    // ──────────────────────────────────────────

    public void notificarRecuperarPassword(Usuario usuario, String tokenPassword) {
        if (usuario.getEmail() != null) {
            String urlRecuperacion = "http://localhost:8080/api/auth/reset-password?token=" + tokenPassword;
            
            String cuerpoHtml = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto'>"
                    + "<h2 style='color:#1a1a2e'>Recuperación de contraseña</h2>"
                    + "<p>Hola <strong>" + usuario.getNombre() + "</strong>,</p>"
                    + "<p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>"
                    + "<p>Para continuar, haz clic en el siguiente botón (válido por 24 horas):</p>"
                    + "<p style='text-align:center;margin:30px 0'>"
                    + "  <a href='" + urlRecuperacion + "' style='background-color:#e63946;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold'>Restablecer Contraseña</a>"
                    + "</p>"
                    + "<p style='color:#555;font-size:12px'>Si no solicitaste este cambio, puedes ignorar este correo con total seguridad.</p>"
                    + "<hr/><p style='color:#888;font-size:12px'>JerezSur Inmobiliaria</p>"
                    + "</div>";

            emailService.enviarAlUsuario(usuario.getEmail(), "Restablecer contraseña - JerezSur Inmobiliaria", cuerpoHtml);
        }
    }

    // ──────────────────────────────────────────
    // VALIDAR / CONFIRMAR CITA
    // ──────────────────────────────────────────

    public void notificarCitaConfirmada(Usuario usuario, String detallesCita) {
        // Al usuario por WhatsApp si tiene teléfono
        if (usuario.getTelefono() != null) {
            whatsappService.enviarAlUsuario(usuario.getTelefono(),
                    "📅 ¡Tu cita ha sido confirmada!\n"
                    + "Hola " + usuario.getNombre() + ", te confirmamos que tu cita ha sido validada correctamente por nuestro equipo.\n\n"
                    + "📌 **Detalles:** " + detallesCita + "\n\n"
                    + "¡Te esperamos!");
        }

        // Al usuario por Email
        if (usuario.getEmail() != null) {
            String cuerpoHtml = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto'>"
                    + "<h2 style='color:#2a9d8f'>📅 Cita Confirmada</h2>"
                    + "<p>Hola <strong>" + usuario.getNombre() + "</strong>,</p>"
                    + "<p>Te informamos de que tu solicitud de cita ha sido **validada y confirmada** por uno de nuestros agentes.</p>"
                    + "<div style='background-color:#f8f9fa;padding:15px;border-left:4px solid #2a9d8f;margin:20px 0'>"
                    + "  <strong>Detalles del encuentro:</strong><br/>" + detallesCita
                    + "</div>"
                    + "<p>Si necesitas modificar la fecha u hora, por favor ponte en contacto con nosotros.</p>"
                    + "<hr/><p style='color:#888;font-size:12px'>JerezSur Inmobiliaria</p>"
                    + "</div>";

            emailService.enviarAlUsuario(usuario.getEmail(), "Cita Confirmada - JerezSur Inmobiliaria", cuerpoHtml);
        }
    }

    // ──────────────────────────────────────────
    // INMUEBLE VALIDADO Y PUBLICADO
    // ──────────────────────────────────────────

    public void notificarInmueblePublicado(Usuario propietario, String tituloInmueble, String urlInmueble) {
        // Al propietario por WhatsApp
        if (propietario.getTelefono() != null) {
            whatsappService.enviarAlUsuario(propietario.getTelefono(),
                    "🎉 ¡Tu inmueble ya está publicado!\n"
                    + "Hola " + propietario.getNombre() + ", nuestro equipo ha validado tu propiedad: \"" + tituloInmueble + "\".\n\n"
                    + "Ya se encuentra disponible en nuestro portal web para recibir visitas e interesados.");
        }

        // Al propietario por Email
        if (propietario.getEmail() != null) {
            String cuerpoHtml = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto'>"
                    + "<h2 style='color:#1a1a2e'>🎉 ¡Inmueble Validado y Publicado!</h2>"
                    + "<p>Hola <strong>" + propietario.getNombre() + "</strong>,</p>"
                    + "<p>Nos alegra informarte de que tu inmueble <strong>" + tituloInmueble + "</strong> ha pasado la revisión de nuestros agentes con éxito.</p>"
                    + "<p>Ya se encuentra activo en nuestra web corporativa. Puedes verlo directamente haciendo clic en el siguiente enlace:</p>"
                    + "<p style='text-align:center;margin:30px 0'>"
                    + "  <a href='" + urlInmueble + "' style='background-color:#1a1a2e;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold'>Ver mi Inmueble en la Web</a>"
                    + "</p>"
                    + "<p>A partir de ahora gestionaremos las solicitudes entrantes y te mantendremos informado.</p>"
                    + "<hr/><p style='color:#888;font-size:12px'>JerezSur Inmobiliaria</p>"
                    + "</div>";

            emailService.enviarAlUsuario(propietario.getEmail(), "¡Tu propiedad ya está publicada! - JerezSur Inmobiliaria", cuerpoHtml);
        }
    }

    // ──────────────────────────────────────────
    // NUEVO INTERESADO
    // ──────────────────────────────────────────

    public void notificarNuevoInteresado(Usuario usuario) {
        String msgAdmin = "🔍 Nuevo interesado registrado:\n"
                + "Nombre: " + usuario.getNombre() + "\n"
                + "Teléfono: " + (usuario.getTelefono() != null ? usuario.getTelefono() : "—") + "\n"
                + "Email: " + (usuario.getEmail() != null ? usuario.getEmail() : "—");
        whatsappService.enviarAlAdmin(msgAdmin);

        if (usuario.getTelefono() != null) {
            whatsappService.enviarAlUsuario(usuario.getTelefono(),
                    "Hola " + usuario.getNombre() + " 👋\n"
                    + "Hemos recibido tu solicitud en JerezSur Inmobiliaria.\n"
                    + "Nos pondremos en contacto contigo pronto.");
        }
        if (usuario.getEmail() != null) {
            emailService.enviarAlUsuario(
                    usuario.getEmail(),
                    "Solicitud recibida - JerezSur Inmobiliaria",
                    buildEmailInteresado(usuario));
        }
    }

    // ──────────────────────────────────────────
    // NUEVO VENDEDOR
    // ──────────────────────────────────────────

    public void notificarNuevoVendedor(Usuario usuario) {
        String msgAdmin = "🏠 Nuevo vendedor/propietario registrado:\n"
                + "Nombre: " + usuario.getNombre() + "\n"
                + "Teléfono: " + (usuario.getTelefono() != null ? usuario.getTelefono() : "—") + "\n"
                + "Email: " + (usuario.getEmail() != null ? usuario.getEmail() : "—");
        whatsappService.enviarAlAdmin(msgAdmin);

        if (usuario.getTelefono() != null) {
            whatsappService.enviarAlUsuario(usuario.getTelefono(),
                    "Hola " + usuario.getNombre() + " 👋\n"
                    + "Hemos registrado tu propiedad en JerezSur Inmobiliaria.\n"
                    + "Un agente revisará tu información y contactará contigo pronto.");
        }
        if (usuario.getEmail() != null) {
            emailService.enviarAlUsuario(
                    usuario.getEmail(),
                    "Propiedad registrada - JerezSur Inmobiliaria",
                    buildEmailVendedor(usuario));
        }
    }

    // ──────────────────────────────────────────
    // PLANTILLAS HTML DE EMAIL
    // ──────────────────────────────────────────

    private String buildEmailBienvenida(Usuario usuario, String token) {
        String urlVerificacion = "http://localhost:8080/api/auth/verificar?token=" + token;
        
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto'>"
                + "<h2 style='color:#1a1a2e'>Bienvenido/a, " + usuario.getNombre() + "</h2>"
                + "<p>Gracias por registrarte en <strong>JerezSur Inmobiliaria</strong>.</p>"
                + "<p>Para poder activar tu cuenta y acceder a todas las funciones de la plataforma, por favor confirma tu dirección de correo haciendo clic en el siguiente enlace:</p>"
                + "<p style='text-align:center;margin:30px 0'>"
                + "  <a href='" + urlVerificacion + "' style='background-color:#4cc9f0;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold'>Verificar Cuenta</a>"
                + "</p>"
                + "<p>Si el botón no funciona, puedes copiar y pegar esta dirección en tu navegador: " + urlVerificacion + "</p>"
                + "<hr/><p style='color:#888;font-size:12px'>JerezSur Inmobiliaria</p>"
                + "</div>";
    }

    private String buildEmailInteresado(Usuario usuario) {
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto'>"
                + "<h2 style='color:#1a1a2e'>Solicitud recibida</h2>"
                + "<p>Hola <strong>" + usuario.getNombre() + "</strong>,</p>"
                + "<p>Hemos recibido tu solicitud y estamos buscando inmuebles que se adapten a tus criterios.</p>"
                + "<p>Nos pondremos en contacto contigo lo antes posible.</p>"
                + "<hr/><p style='color:#888;font-size:12px'>JerezSur Inmobiliaria</p>"
                + "</div>";
    }

    private String buildEmailVendedor(Usuario usuario) {
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto'>"
                + "<h2 style='color:#1a1a2e'>Propiedad registrada</h2>"
                + "<p>Hola <strong>" + usuario.getNombre() + "</strong>,</p>"
                + "<p>Hemos registrado la información de tu propiedad correctamente.</p>"
                + "<p>Un agente de JerezSur Inmobiliaria revisará los detalles y se pondrá en contacto contigo.</p>"
                + "<hr/><p style='color:#888;font-size:12px'>JerezSur Inmobiliaria</p>"
                + "</div>";
    }
}