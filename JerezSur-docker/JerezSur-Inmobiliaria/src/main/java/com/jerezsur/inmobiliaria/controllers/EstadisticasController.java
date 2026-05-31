package com.jerezsur.inmobiliaria.controllers;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jerezsur.inmobiliaria.models.enums.EstadoContrato;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.repositories.CitaRepository;
import com.jerezsur.inmobiliaria.repositories.ContratoRepository;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import com.jerezsur.inmobiliaria.repositories.UsuarioRepository;
import com.jerezsur.inmobiliaria.services.EstadisticasService;

@RestController
@RequestMapping("/api/estadisticas")
public class EstadisticasController {

    @Autowired
    private EstadisticasService estadisticasService;

    @Autowired
    private UsuarioRepository usuarioRepository;

        @Autowired
    private InmuebleRepository inmuebleRepository;

        @Autowired
    private CitaRepository citaRepository;

        @Autowired
    private ContratoRepository contratoRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        // 1. Sacas los datos de tu DB
        Map<String, Object> datos = new HashMap<>();
        datos.put("inmuebles", inmuebleRepository.countByEstado(EstadoInmueble.DISPONIBLE));
        datos.put("clientes",  usuarioRepository.countClientesNuevosDesde(
                                   LocalDateTime.now().minusDays(30)));
        datos.put("visitas",   citaRepository.countProximas());
        datos.put("contratos", contratoRepository.countByEstado(EstadoContrato.BORRADOR));
        // tendencias (últimos 6 meses, puedes hacer una query)
        datos.put("tendencia_clientes", List.of(10, 12, 14, 16, 18, 20));

        // 2. Le pides el gráfico a Python
        String imgBase64 = estadisticasService.generarGrafico("/grafico/kpis", datos);

        return ResponseEntity.ok(Map.of(
            "datos",  datos,
            "imagen", imgBase64 != null ? imgBase64 : ""
        ));
    }
}