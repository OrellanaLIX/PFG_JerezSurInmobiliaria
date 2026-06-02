package com.jerezsur.inmobiliaria.controllers;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jerezsur.inmobiliaria.models.enums.EstadoContrato;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.Role;
import com.jerezsur.inmobiliaria.repositories.CitaRepository;
import com.jerezsur.inmobiliaria.repositories.ContratoRepository;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.InteresadoRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import com.jerezsur.inmobiliaria.repositories.VendedorRepository;
import com.jerezsur.inmobiliaria.services.EstadisticasService;

// Controlador de estadísticas: recoge datos de varios repositorios y los envía
// al microservicio Python para que genere los gráficos del panel de administración
@RestController
@RequestMapping("/api/estadisticas")
public class EstadisticasController {

    // Inyectamos el servicio que llama al microservicio Python de generación de gráficos
    @Autowired private EstadisticasService estadisticasService;
    // Repositorios para obtener los datos crudos de cada entidad
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private InmuebleRepository inmuebleRepository;
    @Autowired private CitaRepository citaRepository;
    @Autowired private ContratoRepository contratoRepository;
    @Autowired private InteresadoRepository interesadoRepository;
    @Autowired private VendedorRepository vendedorRepository;

    // ── Endpoint legado ──────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> datos = buildDatos();
        String img = estadisticasService.generarGrafico("/grafico/kpis", datos);
        return ResponseEntity.ok(Map.of(
            "datos",  datos,
            "imagen", img != null ? img : ""
        ));
    }

    // ── Panel completo (4 gráficos) ──────────────────────────────────
    @SuppressWarnings("unchecked")
    @GetMapping("/panel")
    public ResponseEntity<?> getPanel() {
        Map<String, Object> datos = buildDatos();

        // Llamada única a Python que devuelve los 4 gráficos
        Map<String, Object> graficos = (Map<String, Object>)
                estadisticasService.generarGraficoPanel("/grafico/panel", datos);

        return ResponseEntity.ok(Map.of(
            "kpis",     datos,
            "graficos", graficos != null ? graficos : Map.of()
        ));
    }

    // ── Datos comunes ────────────────────────────────────────────────
    private Map<String, Object> buildDatos() {
        long inmuebles = inmuebleRepository.countByEstado(EstadoInmueble.DISPONIBLE);
        long clientes  = usuarioRepository.countClientesNuevosDesde(
                            LocalDateTime.now().minusDays(30));
        long visitas   = citaRepository.countProximas();
        long contratos = contratoRepository.countByEstado(EstadoContrato.PENDIENTE_FIRMA)
                       + contratoRepository.countByEstado(EstadoContrato.BORRADOR);

        // Distribución de clientes por rol
        long interesados = interesadoRepository.count();
        long vendedores  = vendedorRepository.count();
        long ambos       = usuarioRepository.findByFechaEliminacionIsNull().stream()
                .filter(u -> u.getRole() == Role.ROLE_AMBOS).count();
        long sinRol      = usuarioRepository.findByFechaEliminacionIsNull().stream()
                .filter(u -> u.getRole() == Role.ROLE_NOROL).count();

        // Últimos 6 meses para la evolución
        List<String> meses = new ArrayList<>();
        List<Long> registros = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime desde = LocalDateTime.now().minusMonths(i).withDayOfMonth(1).withHour(0);
            LocalDateTime hasta = desde.plusMonths(1);
            String mes = desde.getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("es"));
            meses.add(mes);
            registros.add(usuarioRepository.countClientesNuevosDesde(desde));
        }

        // Tendencia de inmuebles (simplificada)
        List<Long> tendInm = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            tendInm.add(Math.max(0, inmuebles - i));
        }

        Map<String, Object> datos = new HashMap<>();
        datos.put("inmuebles", inmuebles);
        datos.put("clientes",  clientes);
        datos.put("visitas",   visitas);
        datos.put("contratos", contratos);
        datos.put("interesados", interesados);
        datos.put("vendedores",  vendedores);
        datos.put("ambos",       ambos);
        datos.put("sin_rol",     sinRol);
        datos.put("meses",       meses);
        datos.put("registros",   registros);
        datos.put("tendencia_inmuebles", tendInm);
        datos.put("tendencia_clientes",  registros);
        return datos;
    }
}