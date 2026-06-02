package com.jerezsur.inmobiliaria.helper;

import com.jerezsur.inmobiliaria.models.Tarea;
import com.jerezsur.inmobiliaria.repositories.TareaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

// Componente auxiliar para crear tareas automáticas en la BD.
// Lo usan los services para notificar al equipo cuando ocurre algo importante (nueva cita, mensaje, etc.).
@Component
@RequiredArgsConstructor
public class TareaHelper {

    private final TareaRepository tareaRepository;

    /**
     * Crea una tarea simple sin enlace.
     */
    public Tarea crear(String titulo, String descripcion, LocalDate fecha, String prioridad) {
        return crear(titulo, descripcion, fecha, prioridad, null, null);
    }

    /**
     * Crea una tarea con enlace de acción.
     */
    public Tarea crear(String titulo, String descripcion, LocalDate fecha,
                       String prioridad, String enlace, String etiquetaEnlace) {
        Tarea tarea = Tarea.builder()
                .titulo(titulo)
                .descripcion(descripcion)
                .fecha(fecha)
                .prioridad(prioridad)
                .enlace(enlace)
                .etiquetaEnlace(etiquetaEnlace)
                .fechaCreacion(LocalDate.now())
                .build();

        return tareaRepository.save(tarea);
    }

    // ============================================================
    // HELPERS ESPECÍFICOS DEL NEGOCIO
    // ============================================================

    /**
     * Tarea para gestionar una nueva cita solicitada por un cliente.
     */
    public Tarea crearTareaNuevaCita(Long citaId, String nombreCliente, String telefono) {
        String mensaje = "Hola " + nombreCliente +
                ", soy de JerezSur Inmobiliaria. Le contacto sobre su solicitud de cita.";
        String urlWhatsapp = "https://wa.me/" + limpiarTelefono(telefono) +
                "?text=" + java.net.URLEncoder.encode(mensaje, java.nio.charset.StandardCharsets.UTF_8);

        return crear(
                "Nueva cita solicitada por " + nombreCliente,
                "El cliente ha solicitado una cita. Contáctale para confirmar.",
                LocalDate.now(),
                "ALTA",
                urlWhatsapp,
                "Enviar WhatsApp"
        );
    }

    /**
     * Tarea para revisar un nuevo inmueble registrado por un vendedor.
     */
    public Tarea crearTareaNuevoInmueble(Long inmuebleId, String direccion) {
        return crear(
                "Revisar nuevo inmueble: " + direccion,
                "Un vendedor ha registrado un inmueble. Verifica datos y publícalo.",
                LocalDate.now(),
                "MEDIA",
                "/dashboard/inmuebles/" + inmuebleId,
                "Ver inmueble"
        );
    }

    /**
     * Tarea para firmar un contrato.
     */
    public Tarea crearTareaContratoPendiente(Long contratoId, String nombreCliente) {
        return crear(
                "Contrato pendiente de firma: " + nombreCliente,
                "El contrato está listo. Coordina la firma con el cliente.",
                LocalDate.now().plusDays(2),
                "ALTA",
                "/dashboard/contratos/" + contratoId,
                "Ver contrato"
        );
    }

    private String limpiarTelefono(String telefono) {
        if (telefono == null) return "";
        return telefono.replaceAll("[^0-9]", "");
    }
}