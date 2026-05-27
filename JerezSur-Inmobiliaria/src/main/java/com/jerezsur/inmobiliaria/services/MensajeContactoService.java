package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.MensajeContacto;
import com.jerezsur.inmobiliaria.repositories.MensajeContactoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MensajeContactoService {

    @Autowired
    private MensajeContactoRepository mensajeRepository;

    // ENVIAR MENSAJE (Público)
    @Transactional
    public MensajeContacto enviarMensaje(MensajeContacto mensaje) {
        return mensajeRepository.save(mensaje);
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

        mensajeExistente.setNombre(mensajeActualizado.getNombre());
        mensajeExistente.setEmail(mensajeActualizado.getEmail());
        mensajeExistente.setTelefono(mensajeActualizado.getTelefono());
        mensajeExistente.setMensaje(mensajeActualizado.getMensaje());
        mensajeExistente.setInmueble(mensajeActualizado.getInmueble());
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