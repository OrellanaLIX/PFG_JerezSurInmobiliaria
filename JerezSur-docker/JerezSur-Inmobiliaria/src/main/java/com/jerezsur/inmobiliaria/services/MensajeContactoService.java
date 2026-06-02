package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.MensajeContacto;
import com.jerezsur.inmobiliaria.models.Tarea;
import com.jerezsur.inmobiliaria.repositories.MensajeContactoRepository;
import com.jerezsur.inmobiliaria.repositories.TareaRepository;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Servicio de mensajes de contacto: gestiona los formularios que los visitantes envían
// desde la web pública. Guarda el mensaje en BD y crea una tarea para el equipo.
@Service
public class MensajeContactoService {

    @Autowired
    private MensajeContactoRepository mensajeRepository;

    @Autowired
    private TareaRepository tareaRepository;

    @Autowired
    private WhatsappService whatsappService;

    // ENVIAR MENSAJE (Público)
    @Transactional
    public MensajeContacto enviarMensaje(MensajeContacto mensaje) {
        // Guardar primero para obtener el ID generado por la BD
        MensajeContacto guardado = mensajeRepository.save(mensaje);

        // Construimos el texto del WhatsApp con los datos del remitente y el mensaje
        StringBuilder msgWhatsApp = new StringBuilder();
        msgWhatsApp.append("📩 *Nuevo mensaje de contacto*\n\n");
        msgWhatsApp.append("👤 *Nombre:* ").append(guardado.getNombre()).append("\n");

        if (guardado.getTelefono() != null && !guardado.getTelefono().isBlank()) {
            msgWhatsApp.append("📞 *Teléfono:* ").append(guardado.getTelefono()).append("\n");
        }
        if (guardado.getEmail() != null && !guardado.getEmail().isBlank()) {
            msgWhatsApp.append("✉️ *Email:* ").append(guardado.getEmail()).append("\n");
        }
        if (guardado.getMensaje() != null && !guardado.getMensaje().isBlank()) {
            // Limitamos el mensaje a 300 caracteres para que no sea demasiado largo
            String textoMensaje = guardado.getMensaje().length() > 300
                    ? guardado.getMensaje().substring(0, 300) + "…"
                    : guardado.getMensaje();
            msgWhatsApp.append("\n💬 *Mensaje:*\n").append(textoMensaje);
        }

        // Enviamos el WhatsApp al número del admin (configurado en application.properties)
        whatsappService.enviarAlAdmin(msgWhatsApp.toString());

        // Creamos también una tarea en el dashboard para no perder el rastro
        String titulo = "📩 Mensaje de " + guardado.getNombre();

        StringBuilder descripcionTarea = new StringBuilder();
        if (guardado.getTelefono() != null) {
            descripcionTarea.append("Teléfono: ").append(guardado.getTelefono()).append("\n");
        }
        if (guardado.getEmail() != null) {
            descripcionTarea.append("Email: ").append(guardado.getEmail()).append("\n");
        }
        if (guardado.getMensaje() != null && !guardado.getMensaje().isBlank()) {
            descripcionTarea.append("Mensaje: ").append(guardado.getMensaje());
        }

        Tarea tarea = Tarea.builder()
                .titulo(titulo)
                .descripcion(descripcionTarea.toString())
                .fecha(LocalDate.now().plusDays(2))
                .prioridad("MEDIA")
                .enlace("/contactos")
                .etiquetaEnlace("Ver mensajes")
                .fechaCreacion(LocalDate.now())
                .build();

        tareaRepository.save(tarea);

        return guardado;
    }

    // LISTAR TODOS PARA LOS TRABAJADORES
    @Transactional(readOnly = true)
    public Page<MensajeContacto> listarMensajes(int page, int size, String sortBy, String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        return mensajeRepository.findAll(pageable);
    }

    // LISTAR NUEVOS PARA LOS TRABAJADORES
    @Transactional(readOnly = true)
    public Page<MensajeContacto> listarMensajesNuevos(int page, int size, String sortBy, String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageable = PageRequest.of(page, size, sort);

        return mensajeRepository.findByLeidoFalseOrderByFechaEnvioDesc(pageable);
    }

    // MARCAR O DESMARCAR COMO LEÍDO
    @Transactional
    public void alternarEstado(Long id) {
        MensajeContacto mensaje = mensajeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado"));

        mensaje.setLeido(mensaje.isLeido() ? false : true);
        mensajeRepository.save(mensaje);
    }

    @Transactional(readOnly = true)
    public MensajeContacto obtenerPorId(Long id) {
        return mensajeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado"));
    }

    @Transactional
    public MensajeContacto actualizarMensaje(Long id, MensajeContacto mensajeActualizado) {
        MensajeContacto mensajeExistente = mensajeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado"));

        // Actualización parcial: solo sobreescribimos campos que vienen rellenos
        if (mensajeActualizado.getNombre() != null && !mensajeActualizado.getNombre().isBlank()) {
            mensajeExistente.setNombre(mensajeActualizado.getNombre());
        }
        if (mensajeActualizado.getEmail() != null && !mensajeActualizado.getEmail().isBlank()) {
            mensajeExistente.setEmail(mensajeActualizado.getEmail());
        }
        if (mensajeActualizado.getTelefono() != null && !mensajeActualizado.getTelefono().isBlank()) {
            mensajeExistente.setTelefono(mensajeActualizado.getTelefono());
        }
        if (mensajeActualizado.getMensaje() != null && !mensajeActualizado.getMensaje().isBlank()) {
            mensajeExistente.setMensaje(mensajeActualizado.getMensaje());
        }
        // leido siempre se actualiza (es el campo principal de este PUT)
        mensajeExistente.setLeido(mensajeActualizado.isLeido());

        return mensajeRepository.save(mensajeExistente);
    }

    // ELIMINAR MENSAJE
    @Transactional
    public void eliminarMensaje(Long id) {
        if (!mensajeRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar un mensaje inexistente.");
        }
        mensajeRepository.deleteById(id);
    }
}