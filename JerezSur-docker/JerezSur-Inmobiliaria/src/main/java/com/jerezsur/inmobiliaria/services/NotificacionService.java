package com.jerezsur.inmobiliaria.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.jerezsur.inmobiliaria.models.Usuario;

// Servicio de notificaciones: centraliza el envío de emails y mensajes de WhatsApp.
// Usa EmailService y WhatsappService como interfaces para poder cambiar de proveedor fácilmente.
@Service
public class NotificacionService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private WhatsappService whatsappService;

    @Value("${app.base-url:http://localhost}")
    private String baseUrl;

    // ──────────────────────────────────────────
    // REGISTRO DE NUEVO USUARIO (CON VALIDACIÓN)
    // ──────────────────────────────────────────

    public void notificarNuevoUsuario(Usuario usuario, String tokenVerificacion) {
        // Solo enviamos email al usuario con el enlace de verificación
        // No molestamos al admin por WhatsApp con cada registro
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
            String urlRecuperacion = baseUrl + "/recuperar-password?token=" + tokenPassword;
            
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
        // Al usuario solo por Email (el WhatsApp se reserva para el admin)
        if (usuario.getEmail() != null) {
            // Construir enlace de Google Calendar a partir del texto de detalles
            // El texto lleva "Fecha: dd/MM/yyyy a las HH:mm\nLugar: ..."
            String calendarLink = "";
            try {
                // Intentamos parsear la fecha del texto de detalles
                String[] lineas = detallesCita.split("\n");
                for (String linea : lineas) {
                    if (linea.startsWith("Fecha:")) {
                        String fechaStr = linea.replace("Fecha:", "").trim();
                        // Formato: "dd/MM/yyyy a las HH:mm"
                        java.time.LocalDateTime dt = java.time.LocalDateTime.parse(
                            fechaStr.replace(" a las ", "T"),
                            java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy'T'HH:mm")
                        );
                        // Formato Google Calendar: YYYYMMDDTHHmmss
                        String start = dt.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss"));
                        String end   = dt.plusHours(1).format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss"));
                        calendarLink = "https://www.google.com/calendar/render?action=TEMPLATE"
                            + "&text=" + java.net.URLEncoder.encode("Cita JerezSur Inmobiliaria", java.nio.charset.StandardCharsets.UTF_8)
                            + "&dates=" + start + "/" + end
                            + "&details=" + java.net.URLEncoder.encode(detallesCita, java.nio.charset.StandardCharsets.UTF_8)
                            + "&location=" + java.net.URLEncoder.encode("Jerez de la Frontera", java.nio.charset.StandardCharsets.UTF_8);
                        break;
                    }
                }
            } catch (Exception ignored) { /* si falla, simplemente no añadimos el enlace */ }

            String botonCalendario = !calendarLink.isEmpty()
                ? "<p style='text-align:center;margin:24px 0'>"
                  + "<a href='" + calendarLink + "' target='_blank'"
                  + "   style='background:#4285F4;color:white;padding:12px 24px;text-decoration:none;"
                  + "          border-radius:6px;font-weight:bold;font-size:14px;display:inline-block'>"
                  + "  📅 Añadir a Google Calendar"
                  + "</a></p>"
                : "";

            // Convertir saltos de línea del detalle a HTML
            String detallesHtml = detallesCita.replace("\n", "<br/>");

            String cuerpoHtml = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f7f9fc;padding:0'>"
                + "<div style='background:#00439c;padding:28px 32px;border-radius:8px 8px 0 0'>"
                + "  <h1 style='color:white;margin:0;font-size:22px'>JerezSur Inmobiliaria</h1>"
                + "</div>"
                + "<div style='background:white;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb'>"
                + "  <h2 style='color:#00439c;margin-top:0'>✅ Cita Confirmada</h2>"
                + "  <p>Hola <strong>" + usuario.getNombre() + "</strong>,</p>"
                + "  <p>¡Buenas noticias! Uno de nuestros agentes ha confirmado tu cita en JerezSur Inmobiliaria.</p>"
                + "  <div style='background:#f0f7ff;padding:16px 20px;border-left:4px solid #00439c;border-radius:4px;margin:20px 0'>"
                + "    <strong>Detalles de tu cita:</strong><br/><br/>" + detallesHtml
                + "  </div>"
                + botonCalendario
                + "  <p style='color:#374151'>Si necesitas cambiar la fecha o tienes alguna pregunta, no dudes en contactarnos:</p>"
                + "  <p style='color:#374151'>📞 615 061 840 &nbsp;|&nbsp; ✉️ info@jerezsur.com</p>"
                + "  <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'/>"
                + "  <p style='color:#9ca3af;font-size:12px;margin:0'>JerezSur Inmobiliaria — Jerez de la Frontera</p>"
                + "</div>"
                + "</div>";

            emailService.enviarAlUsuario(usuario.getEmail(), "Cita confirmada — JerezSur Inmobiliaria", cuerpoHtml);
        }
    }

    // ──────────────────────────────────────────
    // NUEVA CITA ASIGNADA A UN TRABAJADOR
    // ──────────────────────────────────────────

    public void notificarCitaAsignadaATrabajador(Usuario trabajadorUsuario, String detallesCita, long citaId) {
        if (trabajadorUsuario == null || trabajadorUsuario.getEmail() == null) return;
        String detallesHtml = detallesCita.replace("\n", "<br/>");
        String urlAdmin = baseUrl + "/citas?citaId=" + citaId;
        String cuerpoHtml = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f7f9fc;padding:0'>"
            + "<div style='background:#00439c;padding:28px 32px;border-radius:8px 8px 0 0'>"
            + "  <h1 style='color:white;margin:0;font-size:22px'>JerezSur Inmobiliaria</h1>"
            + "</div>"
            + "<div style='background:white;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb'>"
            + "  <h2 style='color:#00439c;margin-top:0'>📅 Nueva cita asignada</h2>"
            + "  <p>Hola <strong>" + trabajadorUsuario.getNombre() + "</strong>,</p>"
            + "  <p>Se te ha asignado una nueva cita de visita.</p>"
            + "  <div style='background:#f0f7ff;padding:16px 20px;border-left:4px solid #00439c;border-radius:4px;margin:20px 0'>"
            + "    <strong>Detalles de la cita:</strong><br/><br/>" + detallesHtml
            + "  </div>"
            + "  <p style='text-align:center;margin:24px 0'>"
            + "    <a href='" + urlAdmin + "' style='background:#00439c;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;display:inline-block'>"
            + "      Ver en el panel"
            + "    </a>"
            + "  </p>"
            + "  <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'/>"
            + "  <p style='color:#9ca3af;font-size:12px;margin:0'>JerezSur Inmobiliaria — Jerez de la Frontera</p>"
            + "</div>"
            + "</div>";
        emailService.enviarAlUsuario(trabajadorUsuario.getEmail(), "Nueva cita asignada — JerezSur Inmobiliaria", cuerpoHtml);
    }

    // ──────────────────────────────────────────
    // CUENTA ELIMINADA
    // ──────────────────────────────────────────

    public void notificarCuentaEliminada(Usuario usuario) {
        if (usuario.getEmail() == null) return;
        String cuerpoHtml = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f7f9fc;padding:0'>"
            + "<div style='background:#00439c;padding:28px 32px;border-radius:8px 8px 0 0'>"
            + "  <h1 style='color:white;margin:0;font-size:22px'>JerezSur Inmobiliaria</h1>"
            + "</div>"
            + "<div style='background:white;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb'>"
            + "  <h2 style='color:#dc2626;margin-top:0'>Cuenta eliminada</h2>"
            + "  <p>Hola <strong>" + usuario.getNombre() + "</strong>,</p>"
            + "  <p>Te informamos de que tu cuenta en <strong>JerezSur Inmobiliaria</strong> ha sido eliminada del sistema.</p>"
            + "  <p>Si no solicitaste esta acción, por favor contacta con nosotros a la mayor brevedad:</p>"
            + "  <p>📞 615 061 840 &nbsp;|&nbsp; ✉️ info@jerezsur.com</p>"
            + "  <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'/>"
            + "  <p style='color:#9ca3af;font-size:12px;margin:0'>JerezSur Inmobiliaria — Jerez de la Frontera</p>"
            + "</div>"
            + "</div>";
        emailService.enviarAlUsuario(usuario.getEmail(), "Cuenta eliminada — JerezSur Inmobiliaria", cuerpoHtml);
    }

    // ──────────────────────────────────────────
    // INMUEBLE ELIMINADO
    // ──────────────────────────────────────────

    public void notificarInmuebleEliminado(Usuario propietario, String tituloInmueble) {
        if (propietario.getEmail() == null) return;
        String cuerpoHtml = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f7f9fc;padding:0'>"
            + "<div style='background:#00439c;padding:28px 32px;border-radius:8px 8px 0 0'>"
            + "  <h1 style='color:white;margin:0;font-size:22px'>JerezSur Inmobiliaria</h1>"
            + "</div>"
            + "<div style='background:white;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb'>"
            + "  <h2 style='color:#dc2626;margin-top:0'>Inmueble eliminado</h2>"
            + "  <p>Hola <strong>" + propietario.getNombre() + "</strong>,</p>"
            + "  <p>El inmueble <strong>&ldquo;" + tituloInmueble + "&rdquo;</strong> ha sido eliminado del sistema.</p>"
            + "  <p>Si tienes alguna duda o crees que esto ha sido un error, contacta con nosotros:</p>"
            + "  <p>📞 615 061 840 &nbsp;|&nbsp; ✉️ info@jerezsur.com</p>"
            + "  <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'/>"
            + "  <p style='color:#9ca3af;font-size:12px;margin:0'>JerezSur Inmobiliaria — Jerez de la Frontera</p>"
            + "</div>"
            + "</div>";
        emailService.enviarAlUsuario(propietario.getEmail(), "Inmueble eliminado — JerezSur Inmobiliaria", cuerpoHtml);
    }

    // ──────────────────────────────────────────
    // NUEVA OPERACIÓN SOBRE UN INMUEBLE
    // ──────────────────────────────────────────

    public void notificarNuevaOperacion(Usuario propietario, String tituloInmueble, String tipoOperacion, java.math.BigDecimal precioAcordado) {
        if (propietario.getEmail() == null) return;
        String cuerpoHtml = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f7f9fc;padding:0'>"
            + "<div style='background:#00439c;padding:28px 32px;border-radius:8px 8px 0 0'>"
            + "  <h1 style='color:white;margin:0;font-size:22px'>JerezSur Inmobiliaria</h1>"
            + "</div>"
            + "<div style='background:white;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb'>"
            + "  <h2 style='color:#00439c;margin-top:0'>Nueva operación registrada</h2>"
            + "  <p>Hola <strong>" + propietario.getNombre() + "</strong>,</p>"
            + "  <p>Se ha registrado una nueva operación para tu inmueble <strong>&ldquo;" + tituloInmueble + "&rdquo;</strong>.</p>"
            + "  <div style='background:#f0f7ff;padding:16px 20px;border-left:4px solid #00439c;border-radius:4px;margin:20px 0'>"
            + "    <strong>Tipo:</strong> " + tipoOperacion + "<br/>"
            + "    <strong>Precio acordado:</strong> " + String.format("%,.0f", precioAcordado) + " €"
            + "  </div>"
            + "  <p>Nuestro equipo te mantendrá informado del avance del proceso.</p>"
            + "  <p>📞 615 061 840 &nbsp;|&nbsp; ✉️ info@jerezsur.com</p>"
            + "  <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'/>"
            + "  <p style='color:#9ca3af;font-size:12px;margin:0'>JerezSur Inmobiliaria — Jerez de la Frontera</p>"
            + "</div>"
            + "</div>";
        emailService.enviarAlUsuario(propietario.getEmail(), "Nueva operación registrada — JerezSur Inmobiliaria", cuerpoHtml);
    }

    // ──────────────────────────────────────────
    // CUENTA CREADA POR ADMIN — OTP ACCESO INICIAL
    // ──────────────────────────────────────────

    public void notificarCuentaCreadaConOtp(Usuario usuario, String otp) {
        if (usuario.getEmail() == null) return;
        String urlLogin = baseUrl + "/login";
        String cuerpoHtml = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f7f9fc;padding:0'>"
            + "<div style='background:#00439c;padding:28px 32px;border-radius:8px 8px 0 0'>"
            + "  <h1 style='color:white;margin:0;font-size:22px'>JerezSur Inmobiliaria</h1>"
            + "</div>"
            + "<div style='background:white;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb'>"
            + "  <h2 style='color:#00439c;margin-top:0'>Tu cuenta ha sido creada</h2>"
            + "  <p>Hola <strong>" + usuario.getNombre() + "</strong>,</p>"
            + "  <p>El equipo de JerezSur Inmobiliaria ha creado una cuenta para ti. "
            + "Para acceder por primera vez, usa el siguiente código de un solo uso:</p>"
            + "  <div style='background:#f0f7ff;padding:20px;border-radius:8px;text-align:center;margin:20px 0;border:2px dashed #00439c'>"
            + "    <p style='margin:0 0 8px;font-size:13px;color:#6b7280'>CÓDIGO DE ACCESO</p>"
            + "    <p style='margin:0;font-size:36px;font-weight:800;letter-spacing:8px;color:#00439c'>" + otp + "</p>"
            + "  </div>"
            + "  <p>Accede con tu email (<strong>" + usuario.getEmail() + "</strong>) y este código como contraseña. "
            + "El sistema te pedirá que establezcas una contraseña propia en tu primer inicio de sesión.</p>"
            + "  <p style='text-align:center;margin:24px 0'>"
            + "    <a href='" + urlLogin + "' style='background:#00439c;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;display:inline-block'>Ir a mi cuenta</a>"
            + "  </p>"
            + "  <p style='color:#9ca3af;font-size:12px'>Si no esperabas este email, ignóralo o contacta con nosotros.</p>"
            + "  <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'/>"
            + "  <p style='color:#9ca3af;font-size:12px;margin:0'>JerezSur Inmobiliaria — Jerez de la Frontera</p>"
            + "</div>"
            + "</div>";
        emailService.enviarAlUsuario(usuario.getEmail(), "Bienvenido/a a JerezSur Inmobiliaria — Tu código de acceso", cuerpoHtml);
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
    // PLANTILLAS HTML DE EMAIL
    // ──────────────────────────────────────────

    private String buildEmailBienvenida(Usuario usuario, String token) {
        // Si no hay token (OAuth, admin manual) no incluir botón de verificación
        String bloqueVerificacion = "";
        if (token != null) {
            String urlVerificacion = baseUrl + "/api/auth/verificar?token=" + token;
            bloqueVerificacion = "<p>Para activar tu cuenta y acceder a todas las funciones de la plataforma, "
                    + "confirma tu dirección de correo haciendo clic aquí:</p>"
                    + "<p style='text-align:center;margin:30px 0'>"
                    + "  <a href='" + urlVerificacion + "' "
                    + "     style='background-color:#00439c;color:white;padding:14px 28px;"
                    + "            text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px'>"
                    + "    ✅ Verificar mi cuenta"
                    + "  </a>"
                    + "</p>"
                    + "<p style='color:#888;font-size:12px'>Si el botón no funciona, copia y pega esta URL en tu navegador:<br/>"
                    + "<a href='" + urlVerificacion + "'>" + urlVerificacion + "</a></p>";
        }

        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f7f9fc;padding:0'>"
                + "<div style='background:#00439c;padding:28px 32px;border-radius:8px 8px 0 0'>"
                + "  <h1 style='color:white;margin:0;font-size:22px'>JerezSur Inmobiliaria</h1>"
                + "</div>"
                + "<div style='background:white;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb'>"
                + "  <h2 style='color:#1f2937;margin-top:0'>¡Bienvenido/a, " + usuario.getNombre() + "!</h2>"
                + "  <p style='color:#374151'>Gracias por registrarte en <strong>JerezSur Inmobiliaria</strong>. "
                + "  Ya puedes empezar a buscar el inmueble que mejor se adapte a ti.</p>"
                + bloqueVerificacion
                + "  <hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'/>"
                + "  <p style='color:#9ca3af;font-size:12px;margin:0'>JerezSur Inmobiliaria — Jerez de la Frontera</p>"
                + "</div>"
                + "</div>";
    }
}