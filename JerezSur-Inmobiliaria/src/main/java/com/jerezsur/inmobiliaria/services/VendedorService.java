package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.exceptions.BusinessValidationException;
import com.jerezsur.inmobiliaria.exceptions.ResourceNotFoundException;
import com.jerezsur.inmobiliaria.models.Vendedor;
import com.jerezsur.inmobiliaria.models.Usuario;
import com.jerezsur.inmobiliaria.repositories.VendedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VendedorService {

    // INYECCION DE DEPENDENCIAS
    @Autowired
    private VendedorRepository vendedorRepository;

    // ------------------------------------------------------------------
    // CRUD BASICO
    // ------------------------------------------------------------------

    // LISTAR TODOS
    @Transactional(readOnly = true)
    public List<Vendedor> listarTodos() {
        return vendedorRepository.findAll();
    }

    // BUSCAR INDIVIDUAL
    @Transactional(readOnly = true)
    public Vendedor buscarPorId(Long id) {
        return vendedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El vendedor con ID " + id + " no existe."));
    }

    // GUARDAR
    @Transactional
    public Vendedor guardar(Vendedor vendedor) {
        validarVendedor(vendedor);
        sincronizarDatosContacto(vendedor);
        return vendedorRepository.save(vendedor);
    }

    // ELIMINAR
    @Transactional
    public void eliminar(Long id) {
        if (!vendedorRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: El vendedor con ID " + id + " no existe.");
        }
        vendedorRepository.deleteById(id);
    }

    // ------------------------------------------------------------------
    // LÓGICA DE SINCRONIZACIÓN AUTOMÁTICA
    // ------------------------------------------------------------------

    private void sincronizarDatosContacto(Vendedor vendedor) {
        Usuario usuario = vendedor.getUsuario();

        // Si no hay usuario vinculado, no hay nada que sincronizar
        if (usuario == null) return;

        // REGLA: Si el vendedor está vacío pero el usuario tiene el dato, se copia al vendedor
        if (isEmpty(vendedor.getEmail()) && !isEmpty(usuario.getEmail())) {
            vendedor.setEmail(usuario.getEmail());
        }
        if (isEmpty(vendedor.getTelefono()) && !isEmpty(usuario.getTelefono())) {
            vendedor.setTelefono(usuario.getTelefono());
        }

        // REGLA INVERSA: Actualizamos la cuenta de usuario con los datos del vendedor
        if (!isEmpty(vendedor.getEmail())) {
            usuario.setEmail(vendedor.getEmail());
        }
        if (!isEmpty(vendedor.getTelefono())) {
            usuario.setTelefono(vendedor.getTelefono());
        }
    }

    // ------------------------------------------------------------------
    // METODOS DE APOYO PARA VALIDACIONES DE NEGOCIO
    // ------------------------------------------------------------------

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private void validarVendedor(Vendedor vendedor) {
        // Validación: Nombre obligatorio
        if (vendedor.getNombre() == null || vendedor.getNombre().trim().isEmpty()) {
            throw new BusinessValidationException("El nombre del vendedor es obligatorio.");
        }

        // Validación: DNI (Esencial para la escritura de los inmuebles y contratos)
        if (vendedor.getDni() == null || vendedor.getDni().length() < 9) {
            throw new BusinessValidationException("El DNI/NIF del vendedor debe tener un formato válido.");
        }

        // Al menos uno de los dos debe existir para poder contactar al propietario
        if (isEmpty(vendedor.getEmail()) && isEmpty(vendedor.getTelefono()) && 
            (vendedor.getUsuario() == null || (isEmpty(vendedor.getUsuario().getEmail()) && isEmpty(vendedor.getUsuario().getTelefono())))) {
            throw new BusinessValidationException("El vendedor debe tener al menos un Email o un Teléfono de contacto.");
        }
    }
}