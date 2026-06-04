package com.jerezsur.inmobiliaria.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jerezsur.inmobiliaria.dto.MensajeContactoDTO;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.MensajeContacto;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.services.MensajeContactoService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.web.bind.annotation.RequestParam;

import java.util.LinkedHashMap;
import java.util.Map;

// Controlador de mensajes de contacto: gestiona los formularios que los visitantes
// envian desde la pagina de contacto de la web publica
@RestController
@RequestMapping("/api/contactos")
public class MensajeContactoController {

    @Autowired
    private MensajeContactoService mensajeService;

    @Autowired
    private InmuebleRepository inmuebleRepository;

    // Lista todos los mensajes de contacto con paginacion para el panel admin
    @GetMapping
    public ResponseEntity<Page<MensajeContacto>> listarTodos(
            @RequestParam(required = false, defaultValue = "0") @Min(0) int page,
            @RequestParam(required = false, defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {

        return ResponseEntity.ok(mensajeService.listarMensajes(page, size, sortBy, sortDir));
    }

    // Recibe el mensaje del formulario publico.
    // Usamos MensajeContactoDTO (no la entidad) para evitar que las anotaciones @NotNull
    // de la entidad bloqueen el guardado cuando el telefono no es obligatorio en el formulario.
    @PostMapping("/enviar")
    public ResponseEntity<Void> recibirMensaje(@RequestBody MensajeContactoDTO dto) {
        MensajeContacto mensaje = new MensajeContacto();
        // Siempre strings no-nulos para compatibilidad con columnas NOT NULL existentes en BD
        mensaje.setNombre(dto.getNombre() != null && !dto.getNombre().isBlank()
                ? dto.getNombre().trim() : "Anónimo");
        mensaje.setEmail(dto.getEmail() != null && !dto.getEmail().isBlank()
                ? dto.getEmail().trim() : null);  // email SÍ puede ser null
        mensaje.setTelefono(dto.getTelefono() != null && !dto.getTelefono().isBlank()
                ? dto.getTelefono().trim() : "");  // cadena vacía en lugar de null
        mensaje.setMensaje(dto.getMensaje() != null ? dto.getMensaje() : "");

        // Vincular inmueble si viene el id (para consultas específicas desde la ficha)
        if (dto.getInmuebleId() != null) {
            inmuebleRepository.findById(dto.getInmuebleId())
                    .ifPresent(mensaje::setInmueble);
        }

        mensajeService.enviarMensaje(mensaje);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // Obtiene un mensaje por ID para la vista de detalle en el admin.
    // IMPORTANTE: construimos el response como Map para evitar LazyInitializationException
    // al serializar el Inmueble (que tiene colecciones lazy). Con @Transactional aqui
    // garantizamos que el contexto de persistencia esta abierto mientras construimos la respuesta.
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> obtenerMensaje(@PathVariable Long id) {
        MensajeContacto msg = mensajeService.obtenerPorId(id);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", msg.getId());
        response.put("nombre", msg.getNombre());
        response.put("email", msg.getEmail());
        response.put("telefono", msg.getTelefono());
        response.put("mensaje", msg.getMensaje());
        response.put("leido", msg.isLeido());
        response.put("fechaEnvio", msg.getFechaEnvio());

        // Solo incluimos los campos simples del inmueble para no arrastrar relaciones lazy
        if (msg.getInmueble() != null) {
            Inmueble inm = msg.getInmueble();
            Map<String, Object> inmuebleMap = new LinkedHashMap<>();
            inmuebleMap.put("id", inm.getId());
            inmuebleMap.put("referencia", inm.getReferencia());
            inmuebleMap.put("titulo", inm.getTitulo());
            inmuebleMap.put("precio", inm.getPrecio());
            response.put("inmueble", inmuebleMap);
        } else {
            response.put("inmueble", null);
        }

        return ResponseEntity.ok(response);
    }

    // Actualiza el mensaje — principalmente para marcar como leido/no leido.
    // Acepta un Map genérico para evitar deserializar la entidad completa con sus relaciones.
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarMensaje(@PathVariable Long id,
                                                                  @RequestBody Map<String, Object> cambios) {
        if (cambios.containsKey("leido")) {
            mensajeService.marcarLeido(id, Boolean.TRUE.equals(cambios.get("leido")));
        }
        // Devolvemos confirmación mínima sin serializar la entidad completa
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id",    id);
        resp.put("leido", cambios.getOrDefault("leido", false));
        resp.put("ok",    true);
        return ResponseEntity.ok(resp);
    }

    // Elimina el mensaje de la BD
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMensaje(@PathVariable Long id) {
        mensajeService.eliminarMensaje(id);
        return ResponseEntity.noContent().build();
    }
}
