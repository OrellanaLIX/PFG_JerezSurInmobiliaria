package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.dto.VendedorListadoDTO;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.repositories.VendedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Servicio de gestión de vendedores (propietarios): CRUD y búsquedas para el equipo comercial.
// Un vendedor es el propietario que cede su inmueble a la inmobiliaria para su venta.
@Service
public class VendedorService {

    @Autowired
    private VendedorRepository vendedorRepository;

    // ------------------------------------------------------------------
    // CRUD BÁSICO
    // ------------------------------------------------------------------

    // LISTAR TODOS (con filtro opcional de nombre)
    @Transactional(readOnly = true)
    public Page<VendedorListadoDTO> listarTodos(String tit, int page, int size, String sortBy, String sortDir) {

        Sort.Direction direction = Sort.Direction.fromString(sortDir);
        Sort sort = "usuario.nombre".equals(sortBy)
                ? Sort.by(direction, "usuario.nombre")
                : Sort.by(direction, "id");

        PageRequest pageable = PageRequest.of(page, size, sort);

        if (tit != null && !tit.isBlank()) {
            return vendedorRepository.buscarPorNombre(tit, pageable).map(this::mapearDTO);
        }
        return vendedorRepository.findAll(pageable).map(this::mapearDTO);
    }

    private VendedorListadoDTO mapearDTO(Vendedor v) {
        VendedorListadoDTO.UsuarioBasicoDTO usuarioDTO = null;
        if (v.getUsuario() != null) {
            usuarioDTO = VendedorListadoDTO.UsuarioBasicoDTO.builder()
                    .id(v.getUsuario().getId())
                    .nombre(v.getUsuario().getNombre())
                    .apellidos(v.getUsuario().getApellidos())
                    .email(v.getUsuario().getEmail())
                    .telefono(v.getUsuario().getTelefono())
                    .activo(v.getUsuario().getCuentaActivada())
                    .build();
        }
        return VendedorListadoDTO.builder()
                .id(v.getId())
                .observaciones(v.getObservaciones())
                .fechaRegistro(v.getFechaRegistro())
                .usuario(usuarioDTO)
                .build();
    }

    @Transactional(readOnly = true)
    public Vendedor buscarPorId(Long id) {
        return vendedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El vendedor con ID " + id + " no existe."));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!vendedorRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El vendedor con ID " + id + " no existe.");
        }
        vendedorRepository.deleteById(id);
    }
}