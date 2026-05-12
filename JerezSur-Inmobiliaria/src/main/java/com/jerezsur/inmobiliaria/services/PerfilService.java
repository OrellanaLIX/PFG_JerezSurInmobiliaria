package com.jerezsur.inmobiliaria.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.jerezsur.inmobiliaria.models.*;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.repositories.*;
import com.jerezsur.inmobiliaria.dto.OnboardingRequest;

@Service
public class PerfilService {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private InteresadoRepository interesadoRepository;
    @Autowired private VendedorRepository vendedorRepository;

    @Transactional
    public void completarPerfil(OnboardingRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean tieneInteresado = interesadoRepository.existsByUsuario(usuario);
        boolean tieneVendedor = vendedorRepository.existsByUsuario(usuario);

        // 1. Lógica para Interesado (usamos paréntesis para agrupar el OR)
        if ((request.getPerfil().equals("interesado") || request.getPerfil().equals("ambos")) && !tieneInteresado) {
            Interesado interesado = new Interesado();
            interesado.setUsuario(usuario);
            interesado.setNombre(request.getNombre());
            interesado.setApellidos(request.getApellidos());
            interesado.setTelefono(request.getTelefono());
            interesado.setEmail(usuario.getEmail());
            interesado.setDni(request.getDni());
            interesado.setPresupuestoMaximo(request.getPresupuestoMaximo());
            interesado.setZonaInteres(request.getZonaInteres());
            interesado.setHabitacionesMinimas(request.getHabitacionesMinimas());
            interesado.setBanosMinimos(request.getBanosMinimos());
            interesado.setObservaciones(request.getComentariosExtra());
            interesadoRepository.save(interesado);
        }

        // 2. Lógica para Vendedor
        if ((request.getPerfil().equals("propietario") || request.getPerfil().equals("ambos")) && !tieneVendedor) {
            Vendedor vendedor = new Vendedor();
            vendedor.setUsuario(usuario);
            vendedor.setNombre(request.getNombre());
            vendedor.setApellidos(request.getApellidos());
            vendedor.setTelefono(request.getTelefono());
            vendedor.setEmail(usuario.getEmail());
            vendedor.setDni(request.getDni());
            vendedor.setObservaciones("Propiedad: " + request.getDetallesPropiedad() + ". Extra: " + request.getComentariosExtra());
            vendedorRepository.save(vendedor);
        }

        // 3. Asignación final del Rol (Después de guardar los perfiles)
        // Volvemos a comprobar qué tiene ahora para asignar el rol definitivo
        boolean esInteresado = interesadoRepository.existsByUsuario(usuario);
        boolean esVendedor = vendedorRepository.existsByUsuario(usuario);

        if (esInteresado && esVendedor) {
            usuario.setRole(Role.ROLE_AMBOS);
        } else if (esInteresado) {
            usuario.setRole(Role.ROLE_INTERESADO);
        } else if (esVendedor) {
            usuario.setRole(Role.ROLE_VENDEDOR);
        }

        usuarioRepository.save(usuario);
    }
}