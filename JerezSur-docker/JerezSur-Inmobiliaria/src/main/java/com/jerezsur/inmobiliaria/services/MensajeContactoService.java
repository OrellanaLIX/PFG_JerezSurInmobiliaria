package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.MensajeContacto;
import com.jerezsur.inmobiliaria.models.Tarea;
import com.jerezsur.inmobiliaria.repositories.MensajeContactoRepository;
import com.jerezsur.inmobiliaria.repositories.TareaRepository;

import java.time.LocalDate;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Servicio de mensajes de contacto: gestiona los formularios que los visitantes envian
// desde la web publica. Guarda el mensaje en BD y crea una tarea para el equipo.
@Slf4j
@Service
public class MensajeContactoService {

    @Autowired private MensajeContactoRepository mensajeRepository;
    @Autowired private TareaRepository tareaRepository;
    @Autowired private WhatsappService whatsappService;

    // ENVIAR MENSAJE (Publico)
    // El mensaje se guarda siempre; las notificaciones (WhatsApp, tarea) son secundarias.
    // Si cualquier notificacion falla, se loguea pero NO se revierte el guardado del mensaje.
    @Transactional
    public MensajeContacto enviarMensaje(MensajeContacto mensaje) {

        // 1. Guardar el mensaje — esto es lo critico, siempre debe completarse
        MensajeContacto guardado = mensajeRepository.save(mensaje);

        // 2. WhatsApp al admin — si falla no afecta al usuario
        try {
            String nl = "\n";
            StringBuilder msgWA = new StringBuilder();
            msgWA.append("Nuevo mensaje de contacto").append(nl).append(nl);
            msgWA.append("Nombre: ").append(guardado.getNombre()).append(nl);
            if (guardado.getTelefono() != null && !guardado.getTelefono().isBlank()) {
                msgWA.append("Telefono: ").append(guardado.getTelefono()).append(nl);
            }
            if (guardado.getEmail() != null && !guardado.getEmail().isBlank()) {
                msgWA.append("Email: ").append(guardado.getEmail()).append(nl);
            }
            if (guardado.getMensaje() != null && !guardado.getMensaje().isBlank()) {
                String texto = guardado.getMensaje().length() > 300
                        ? guardado.getMensaje().substring(0, 300) + "..."
                        : guardado.getMensaje();
                msgWA.append(nl).append("Mensaje:").append(nl).append(texto);
            }
            whatsappService.enviarAlAdmin(msgWA.toString());
        } catch (Exception e) {
            log.warn("Notificacion WhatsApp no enviada para contacto #{}: {}", guardado.getId(), e.getMessage());
        }

        // 3. Crear tarea en el dashboard — igual, si falla no afecta al usuario
        try {
            String nl = "\n";
            StringBuilder desc = new StringBuilder();
            if (guardado.getTelefono() != null) {
                desc.append("Telefono: ").append(guardado.getTelefono()).append(nl);
            }
            if (guardado.getEmail() != null) {
                desc.append("Email: ").append(guardado.getEmail()).append(nl);
            }
            if (guardado.getMensaje() != null && !guardado.getMensaje().isBlank()) {
                desc.append("Mensaje: ").append(guardado.getMensaje());
            }

            Tarea tarea = Tarea.builder()
                    .titulo("Mensaje de " + guardado.getNombre())
                    .descripcion(desc.toString())
                    .fecha(LocalDate.now().plusDays(2))
                    .prioridad("MEDIA")
                    .enlace("/contactos")
                    .etiquetaEnlace("Ver mensajes")
                    .fechaCreacion(LocalDate.now())
                    .build();
            tareaRepository.save(tarea);
        } catch (Exception e) {
            log.warn("Tarea no creada para contacto #{}: {}", guardado.getId(), e.getMessage());
        }

        return guardado;
    }

    // LISTAR TODOS PARA LOS TRABAJADORES
    @Transactional(readOnly = true)
    public Page<MensajeContacto> listarMensajes(int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        return mensajeRepository.findAll(PageRequest.of(page, size, sort));
    }

    // LISTAR MENSAJES NO LEIDOS
    @Transactional(readOnly = true)
    public Page<MensajeContacto> listarMensajesNuevos(int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        return mensajeRepository.findByLeidoFalseOrderByFechaEnvioDesc(PageRequest.of(page, size, sort));
    }

    // MARCAR O DESMARCAR COMO LEIDO
    @Transactional
    public void alternarEstado(Long id) {
        MensajeContacto msg = mensajeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado"));
        msg.setLeido(!msg.isLeido());
        mensajeRepository.save(msg);
    }

    @Transactional(readOnly = true)
    public MensajeContacto obtenerPorId(Long id) {
        return mensajeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado"));
    }

    // ACTUALIZAR campo leido rapidamente por ID (lo usa el controller del admin)
    @Transactional
    public void marcarLeido(Long id, boolean leido) {
        mensajeRepository.findById(id).ifPresent(msg -> {
            msg.setLeido(leido);
            mensajeRepository.save(msg);
        });
    }

    // ACTUALIZAR (principalmente para marcar como leido o anadir nota)
    @Transactional
    public MensajeContacto actualizarMensaje(Long id, MensajeContacto actualizado) {
        MensajeContacto existente = mensajeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado"));

        if (actualizado.getNombre() != null && !actualizado.getNombre().isBlank()) {
            existente.setNombre(actualizado.getNombre());
        }
        if (actualizado.getEmail() != null && !actualizado.getEmail().isBlank()) {
            existente.setEmail(actualizado.getEmail());
        }
        if (actualizado.getTelefono() != null && !actualizado.getTelefono().isBlank()) {
            existente.setTelefono(actualizado.getTelefono());
        }
        if (actualizado.getMensaje() != null && !actualizado.getMensaje().isBlank()) {
            existente.setMensaje(actualizado.getMensaje());
        }
        // leido siempre se actualiza — es el campo principal del PUT
        existente.setLeido(actualizado.isLeido());

        return mensajeRepository.save(existente);
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
