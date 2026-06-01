package com.jerezsur.inmobiliaria.config;

import com.jerezsur.inmobiliaria.models.*;
import com.jerezsur.inmobiliaria.models.enums.*;
import com.jerezsur.inmobiliaria.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepo;
    private final TrabajadorRepository trabajadorRepo;
    private final VendedorRepository vendedorRepo;
    private final InteresadoRepository interesadoRepo;
    private final InmuebleRepository inmuebleRepo;
    private final ImagenRepository imagenRepo;
    private final CitaRepository citaRepo;
    private final OperacionRepository operacionRepo;
    private final ContratoRepository contratoRepo;
    private final MensajeContactoRepository mensajeRepo;
    private final TareaRepository tareaRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (inmuebleRepo.count() > 0) {
            log.info("DataSeeder: datos de ejemplo ya existen, omitiendo.");
            return;
        }

        log.info("DataSeeder: insertando datos de ejemplo...");

        // ── 1. TRABAJADORES ──────────────────────────────────────────────
        Usuario uCarlos = crearUsuario("carlos.garcia@jerezsur.com", "Carlos", "García López",
                "34600111222", "12345678B", "Admin123!", Role.ROLE_TRABAJADOR);
        Trabajador tCarlos = Trabajador.builder()
                .dni("12345678B").cargo("Agente Comercial")
                .fechaInicioContrato(LocalDate.of(2022, 3, 1))
                .activo(true).usuario(uCarlos).build();
        trabajadorRepo.save(tCarlos);

        Usuario uLaura = crearUsuario("laura.martinez@jerezsur.com", "Laura", "Martínez Ruiz",
                "34600333444", "23456789C", "Admin123!", Role.ROLE_TRABAJADOR);
        Trabajador tLaura = Trabajador.builder()
                .dni("23456789C").cargo("Administrativa")
                .fechaInicioContrato(LocalDate.of(2021, 9, 15))
                .activo(true).usuario(uLaura).build();
        trabajadorRepo.save(tLaura);

        // ── 2. CLIENTES INTERESADOS ──────────────────────────────────────
        Usuario uJuan = crearUsuario("juan.perez@example.com", "Juan", "Pérez Domínguez",
                "34611100200", "34567890D", "Client123!", Role.ROLE_INTERESADO);
        Interesado iJuan = Interesado.builder()
                .usuario(uJuan)
                .presupuestoMaximo(new BigDecimal("220000"))
                .zonaInteres("Chapín")
                .habitacionesMinimas(3)
                .banosMinimos(1)
                .tipoBusqueda(TipoOperacion.VENTA)
                .observaciones("Busca piso amplio con garaje, preferiblemente reformado.")
                .build();
        interesadoRepo.save(iJuan);

        Usuario uMaria = crearUsuario("maria.lopez@example.com", "María", "López Sánchez",
                "34622200300", "45678901E", "Client123!", Role.ROLE_INTERESADO);
        Interesado iMaria = Interesado.builder()
                .usuario(uMaria)
                .presupuestoMaximo(new BigDecimal("950"))
                .zonaInteres("Centro")
                .habitacionesMinimas(2)
                .banosMinimos(1)
                .tipoBusqueda(TipoOperacion.ALQUILER)
                .observaciones("Alquiler con opción a compra. No tiene mascotas.")
                .build();
        interesadoRepo.save(iMaria);

        // ── 3. VENDEDOR ──────────────────────────────────────────────────
        Usuario uAntonio = crearUsuario("antonio.fdez@example.com", "Antonio", "Fernández Vera",
                "34633300400", "56789012F", "Client123!", Role.ROLE_VENDEDOR);
        Vendedor vAntonio = Vendedor.builder()
                .usuario(uAntonio)
                .observaciones("Propietario de varios inmuebles en Jerez. Quiere vender en los próximos 6 meses.")
                .build();
        vendedorRepo.save(vAntonio);

        // ── 4. INMUEBLES ─────────────────────────────────────────────────
        Inmueble p1 = inmuebleRepo.save(Inmueble.builder()
                .referencia("JS-001")
                .titulo("Piso luminoso de 3 habitaciones en Chapín")
                .descripcion("Precioso piso en segunda planta con ascensor, completamente reformado en 2021. "
                        + "Cocina americana integrada, suelos de mármol y ventanas de doble acristalamiento. "
                        + "Comunidad con piscina y garaje opcional.")
                .precio(new BigDecimal("168000"))
                .operacion(TipoOperacion.VENTA)
                .estado(EstadoInmueble.DISPONIBLE)
                .tipo(TipoInmueble.PISO)
                .habitaciones(3).banos(1)
                .superficieUtil(88.0).mConstruidos(102.0)
                .direccion("C/ Poeta Muñoz Seca, 14").zona("Chapín")
                .codigoPostal("11407").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("65")).ibi(new BigDecimal("420"))
                .tieneDerrama(false)
                .destacado(true)
                .caracteristicasExtra(Map.of(
                        "Ascensor", "Sí",
                        "Garaje", "Opcional (+12.000 €)",
                        "Piscina comunitaria", "Sí",
                        "Orientación", "Sur"))
                .propietariosPorcentaje(Map.of(vAntonio, 100.0))
                .build());

        Inmueble p2 = inmuebleRepo.save(Inmueble.builder()
                .referencia("JS-002")
                .titulo("Ático con terraza privada y vistas al centro histórico")
                .descripcion("Espectacular ático en la última planta de edificio señorial. Terraza de 40 m² "
                        + "con vistas panorámicas a la Catedral de Jerez. Completamente exterior y con mucha luz natural. "
                        + "Cocina totalmente equipada y baño con bañera.")
                .precio(new BigDecimal("245000"))
                .operacion(TipoOperacion.VENTA)
                .estado(EstadoInmueble.DISPONIBLE)
                .tipo(TipoInmueble.ATICO)
                .habitaciones(2).banos(2)
                .superficieUtil(75.0).mConstruidos(115.0)
                .direccion("C/ Larga, 28").zona("Centro")
                .codigoPostal("11402").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("95")).ibi(new BigDecimal("580"))
                .tieneDerrama(false)
                .destacado(true)
                .caracteristicasExtra(Map.of(
                        "Terraza", "40 m²",
                        "Ascensor", "Sí",
                        "Aire acondicionado", "Sí",
                        "Vistas", "Catedral"))
                .propietariosPorcentaje(Map.of(vAntonio, 100.0))
                .build());

        Inmueble p3 = inmuebleRepo.save(Inmueble.builder()
                .referencia("JS-003")
                .titulo("Casa adosada con jardín en El MOPU")
                .descripcion("Adosado en esquina con jardín privado de 60 m², garaje incorporado y trastero. "
                        + "Planta baja: salón-comedor, cocina y aseo. Primera planta: 3 dormitorios y baño completo. "
                        + "Comunidad tranquila con piscina.")
                .precio(new BigDecimal("215000"))
                .operacion(TipoOperacion.VENTA)
                .estado(EstadoInmueble.DISPONIBLE)
                .tipo(TipoInmueble.ADOSADO)
                .habitaciones(3).banos(2)
                .superficieUtil(120.0).mConstruidos(140.0)
                .direccion("Avda. de Carteya, 52").zona("MOPU")
                .codigoPostal("11405").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("55")).ibi(new BigDecimal("490"))
                .tieneDerrama(false)
                .destacado(true)
                .caracteristicasExtra(Map.of(
                        "Jardín privado", "60 m²",
                        "Garaje", "Incluido",
                        "Trastero", "Sí",
                        "Piscina comunitaria", "Sí"))
                .build());

        Inmueble p4 = inmuebleRepo.save(Inmueble.builder()
                .referencia("JS-004")
                .titulo("Piso de 2 habitaciones ideal para alquilar en Ronda")
                .descripcion("Piso en buen estado listo para entrar a vivir. Salón amplio, cocina independiente equipada "
                        + "y dormitorios con armarios empotrados. Edificio con portero físico.")
                .precio(new BigDecimal("750"))
                .operacion(TipoOperacion.ALQUILER)
                .estado(EstadoInmueble.DISPONIBLE)
                .tipo(TipoInmueble.PISO)
                .habitaciones(2).banos(1)
                .superficieUtil(68.0).mConstruidos(78.0)
                .direccion("C/ Taxdirt, 8").zona("Ronda")
                .codigoPostal("11403").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("45")).ibi(new BigDecimal("310"))
                .tieneDerrama(false)
                .destacado(false)
                .caracteristicasExtra(Map.of(
                        "Portero físico", "Sí",
                        "Armarios empotrados", "Sí"))
                .build());

        Inmueble p5 = inmuebleRepo.save(Inmueble.builder()
                .referencia("JS-005")
                .titulo("Estudio amueblado en pleno centro de Jerez")
                .descripcion("Estudio de diseño totalmente amueblado y equipado en el corazón de Jerez. "
                        + "Ideal para estudiantes o profesionales. Disponible inmediatamente.")
                .precio(new BigDecimal("480"))
                .operacion(TipoOperacion.ALQUILER)
                .estado(EstadoInmueble.DISPONIBLE)
                .tipo(TipoInmueble.ESTUDIO)
                .habitaciones(1).banos(1)
                .superficieUtil(32.0).mConstruidos(35.0)
                .direccion("Pl. del Arenal, 3").zona("Centro")
                .codigoPostal("11401").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("30"))
                .tieneDerrama(false)
                .destacado(false)
                .caracteristicasExtra(Map.of("Amueblado", "Sí", "Disponibilidad", "Inmediata"))
                .build());

        Inmueble p6 = inmuebleRepo.save(Inmueble.builder()
                .referencia("JS-006")
                .titulo("Chalet independiente con piscina privada en La Cartuja")
                .descripcion("Magnífico chalet independiente en urbanización La Cartuja con piscina privada de 40 m², "
                        + "jardín de 500 m² y garaje para 2 coches. 4 dormitorios con vestidor, 3 baños completos. "
                        + "Barbacoa, pergola y zona de juegos. Totalmente reformado en 2023.")
                .precio(new BigDecimal("485000"))
                .operacion(TipoOperacion.VENTA)
                .estado(EstadoInmueble.DISPONIBLE)
                .tipo(TipoInmueble.CHALET)
                .habitaciones(4).banos(3)
                .superficieUtil(280.0).mConstruidos(320.0)
                .direccion("C/ Pintor Sorolla, 7").zona("La Cartuja")
                .codigoPostal("11408").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("120")).ibi(new BigDecimal("1100"))
                .tieneDerrama(false)
                .destacado(true)
                .caracteristicasExtra(Map.of(
                        "Piscina privada", "40 m²",
                        "Jardín", "500 m²",
                        "Garaje", "2 plazas",
                        "Barbacoa", "Sí",
                        "Domótica", "Sí"))
                .build());

        Inmueble p7 = inmuebleRepo.save(Inmueble.builder()
                .referencia("JS-007")
                .titulo("Piso de 4 habitaciones con parking en La Granja")
                .descripcion("Amplio piso familiar en primera planta con acceso directo al parking comunitario. "
                        + "4 habitaciones grandes, 2 baños, cocina separada y tendedero propio. "
                        + "Comunidad con portero automático y zonas ajardinadas.")
                .precio(new BigDecimal("185000"))
                .operacion(TipoOperacion.VENTA)
                .estado(EstadoInmueble.RESERVADO)
                .tipo(TipoInmueble.PISO)
                .habitaciones(4).banos(2)
                .superficieUtil(115.0).mConstruidos(130.0)
                .direccion("C/ Columela, 19").zona("La Granja")
                .codigoPostal("11406").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("80")).ibi(new BigDecimal("510"))
                .tieneDerrama(true).valorDerrama(new BigDecimal("2400"))
                .destacado(false)
                .caracteristicasExtra(Map.of(
                        "Parking", "Incluido",
                        "Trastero", "Sí",
                        "Zona ajardinada", "Sí"))
                .build());

        Inmueble p8 = inmuebleRepo.save(Inmueble.builder()
                .referencia("JS-008")
                .titulo("Local comercial en zona de alto tráfico peatonal")
                .descripcion("Local en planta baja en una de las calles con mayor afluencia de Jerez. "
                        + "Diáfano, con escaparate de 6 metros, aseo y almacén. Ideal para hostelería o comercio.")
                .precio(new BigDecimal("1400"))
                .operacion(TipoOperacion.ALQUILER)
                .estado(EstadoInmueble.DISPONIBLE)
                .tipo(TipoInmueble.LOCAL_COMERCIAL)
                .habitaciones(null).banos(1)
                .superficieUtil(95.0).mConstruidos(100.0)
                .direccion("C/ Consistorio, 5").zona("Centro")
                .codigoPostal("11401").ciudad("Jerez de la Frontera")
                .tieneDerrama(false)
                .destacado(false)
                .caracteristicasExtra(Map.of(
                        "Escaparate", "6 m",
                        "Almacén", "Sí",
                        "Altura libre", "3,8 m"))
                .build());

        // ── 5. IMÁGENES ──────────────────────────────────────────────────
        guardarImagenes(p1, List.of(
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200"));

        guardarImagenes(p2, List.of(
                "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200"));

        guardarImagenes(p3, List.of(
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200",
                "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200"));

        guardarImagenes(p4, List.of(
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200",
                "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200"));

        guardarImagenes(p5, List.of(
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"));

        guardarImagenes(p6, List.of(
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
                "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200",
                "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200",
                "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1200"));

        guardarImagenes(p7, List.of(
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
                "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200"));

        guardarImagenes(p8, List.of(
                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"));

        // ── 6. CITAS ─────────────────────────────────────────────────────
        Cita c1 = citaRepo.save(Cita.builder()
                .fechaHora(LocalDateTime.now().plusDays(3).withHour(10).withMinute(30))
                .motivo("Quiero ver el piso de Chapín en persona. Estoy muy interesado.")
                .estado(EstadoCita.CONFIRMADA)
                .usuario(uJuan)
                .trabajador(tCarlos)
                .inmueble(p1)
                .notas("Cliente muy serio, ya ha visto fotos. Llevar llaves del garaje también.")
                .build());

        citaRepo.save(Cita.builder()
                .fechaHora(LocalDateTime.now().plusDays(7).withHour(11).withMinute(0))
                .motivo("Consulta sobre opciones de alquiler disponibles en el centro.")
                .estado(EstadoCita.PENDIENTE)
                .usuario(uMaria)
                .trabajador(tLaura)
                .inmueble(null)
                .notas("Cliente viene con su pareja. Llamar el día anterior para confirmar.")
                .build());

        citaRepo.save(Cita.builder()
                .fechaHora(LocalDateTime.now().minusDays(5).withHour(17).withMinute(0))
                .motivo("Visita al chalet de La Cartuja.")
                .estado(EstadoCita.REALIZADA)
                .usuario(uJuan)
                .trabajador(tCarlos)
                .inmueble(p6)
                .notas("El cliente mostró interés pero considera el precio elevado. Posible negociación.")
                .build());

        citaRepo.save(Cita.builder()
                .fechaHora(LocalDateTime.now().plusDays(14).withHour(9).withMinute(30))
                .motivo("Solicitud de visita al estudio del Arenal.")
                .estado(EstadoCita.PENDIENTE)
                .usuario(uMaria)
                .trabajador(null)
                .inmueble(p5)
                .build());

        // ── 7. OPERACIONES ────────────────────────────────────────────────
        OperacionVenta opVenta = new OperacionVenta();
        opVenta.setTipo(TipoOperacion.VENTA);
        opVenta.setEstadoActual(EstadoOperacion.EN_TRAMITE);
        opVenta.setPrecioAcordado(new BigDecimal("162000"));
        opVenta.setInmueble(p1);
        opVenta.setDepositoArras(new BigDecimal("8000"));
        opVenta.setFechaLimiteEscritura(LocalDate.now().plusMonths(3));
        opVenta.setIncluyeMobiliario(false);
        OperacionVenta opVentaGuardada = (OperacionVenta) operacionRepo.save(opVenta);

        OperacionAlquiler opAlquiler = new OperacionAlquiler();
        opAlquiler.setTipo(TipoOperacion.ALQUILER);
        opAlquiler.setEstadoActual(EstadoOperacion.CERRADA);
        opAlquiler.setPrecioAcordado(new BigDecimal("720"));
        opAlquiler.setInmueble(p4);
        opAlquiler.setFianza(new BigDecimal("1440"));
        opAlquiler.setDuracionMeses(12);
        opAlquiler.setAdmiteMascotas(false);
        OperacionAlquiler opAlquilerGuardada = (OperacionAlquiler) operacionRepo.save(opAlquiler);

        // ── 8. CONTRATOS ─────────────────────────────────────────────────
        contratoRepo.save(Contrato.builder()
                .fechaFirma(LocalDate.now().plusDays(10))
                .estado(EstadoContrato.PENDIENTE_FIRMA)
                .modelo(ModeloContrato.ARRAS)
                .clausulasEspeciales("Arras penitenciales según art. 1454 CC. "
                        + "Plazo escritura pública máximo 90 días desde la firma.")
                .operacion(opVentaGuardada)
                .trabajador(tCarlos)
                .build());

        contratoRepo.save(Contrato.builder()
                .fechaFirma(LocalDate.now().minusMonths(6))
                .estado(EstadoContrato.FIRMADO)
                .modelo(ModeloContrato.ALQUILER_VIVIENDA)
                .clausulasEspeciales("No se permiten mascotas. Actualización anual según IPC.")
                .operacion(opAlquilerGuardada)
                .trabajador(tLaura)
                .build());

        // ── 9. MENSAJES DE CONTACTO ───────────────────────────────────────
        mensajeRepo.save(MensajeContacto.builder()
                .nombre("Pedro Ruiz").email("pedro.ruiz@gmail.com").telefono("634500100")
                .mensaje("Buenos días, me interesa el piso JS-001 de Chapín. "
                        + "¿Podría concertar una visita para el próximo sábado por la mañana? Muchas gracias.")
                .inmueble(p1).leido(false).build());

        mensajeRepo.save(MensajeContacto.builder()
                .nombre("Sofía Castro").email("sofia.c@hotmail.com").telefono("611200300")
                .mensaje("Hola, quisiera información sobre tasaciones gratuitas. "
                        + "Tengo un piso en el centro de Jerez que quiero poner en venta. "
                        + "¿Qué documentación necesito? Gracias.")
                .inmueble(null).leido(true).build());

        mensajeRepo.save(MensajeContacto.builder()
                .nombre("Ramón Vega").email("rvega@empresa.es").telefono("956300200")
                .mensaje("Necesito información sobre el local del centro (JS-008). "
                        + "Queremos abrir un restaurante. ¿Admite obras de adaptación?")
                .inmueble(p8).leido(false).build());

        // ── 10. TAREAS ────────────────────────────────────────────────────
        tareaRepo.save(Tarea.builder()
                .titulo("Preparar documentación arras JS-001")
                .descripcion("Preparar contrato de arras para Juan Pérez. Confirmar datos bancarios y DNI.")
                .fecha(LocalDate.now().plusDays(5))
                .prioridad("ALTA")
                .enlace(null).etiquetaEnlace(null)
                .build());

        tareaRepo.save(Tarea.builder()
                .titulo("Publicar JS-006 en Idealista y Fotocasa")
                .descripcion("El chalet de La Cartuja ya tiene fotos definitivas. Subir anuncio a portales y revisar descripción.")
                .fecha(LocalDate.now().plusDays(2))
                .prioridad("MEDIA")
                .build());

        tareaRepo.save(Tarea.builder()
                .titulo("Llamar a Antonio Fernández sobre tasación")
                .descripcion("Propietario esperando confirmación del precio de tasación de su piso en La Granja. "
                        + "Enviar informe de valoración.")
                .fecha(LocalDate.now().plusDays(1))
                .prioridad("ALTA")
                .build());

        tareaRepo.save(Tarea.builder()
                .titulo("Renovar contrato de alquiler JS-004")
                .descripcion("El contrato actual vence el mes que viene. Contactar al inquilino para renovación.")
                .fecha(LocalDate.now().plusDays(21))
                .prioridad("MEDIA")
                .build());

        tareaRepo.save(Tarea.builder()
                .titulo("Actualizar fotos del ático JS-002")
                .descripcion("El propietario ha reformado la terraza. Programar sesión fotográfica para actualizar el anuncio.")
                .fecha(LocalDate.now().plusDays(8))
                .prioridad("BAJA")
                .build());

        log.info("DataSeeder: datos de ejemplo insertados correctamente.");
    }

    private Usuario crearUsuario(String email, String nombre, String apellidos,
                                  String telefono, String dni, String password, Role role) {
        return usuarioRepo.findByEmail(email).orElseGet(() -> usuarioRepo.save(
                Usuario.builder()
                        .email(email)
                        .nombre(nombre)
                        .apellidos(apellidos)
                        .telefono(telefono)
                        .dni(dni)
                        .password(passwordEncoder.encode(password))
                        .role(role)
                        .cambiarPasswd(false)
                        .cuentaActivada(true)
                        .verified(true)
                        .provider(AuthProvider.LOCAL)
                        .origen(OrigenUsuario.CRM_TRABAJADOR)
                        .build()
        ));
    }

    private void guardarImagenes(Inmueble inmueble, List<String> urls) {
        for (int i = 0; i < urls.size(); i++) {
            imagenRepo.save(Imagen.builder()
                    .url(urls.get(i))
                    .esPortada(i == 0)
                    .inmueble(inmueble)
                    .build());
        }
    }
}
