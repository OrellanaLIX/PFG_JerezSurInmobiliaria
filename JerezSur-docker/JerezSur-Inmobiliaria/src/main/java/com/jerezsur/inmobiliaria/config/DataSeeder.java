// Inicializador de datos de prueba: crea inmuebles, usuarios y citas de ejemplo al arrancar la app.
// Solo se ejecuta si la BD está vacía (en modo de desarrollo o primera puesta en marcha).
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

        // 1. TRABAJADORES
        Usuario uCarlos = crearUsuario("carlos.garcia@jerezsur.com", "Carlos", "Garcia Lopez",
                "34600111222", "12345678B", "Admin123!", Role.ROLE_TRABAJADOR);
        Trabajador tCarlos = Trabajador.builder().dni("12345678B").cargo("Agente Comercial")
                .fechaInicioContrato(LocalDate.of(2022, 3, 1)).activo(true).usuario(uCarlos).build();
        trabajadorRepo.save(tCarlos);

        Usuario uLaura = crearUsuario("laura.martinez@jerezsur.com", "Laura", "Martinez Ruiz",
                "34600333444", "23456789C", "Admin123!", Role.ROLE_TRABAJADOR);
        Trabajador tLaura = Trabajador.builder().dni("23456789C").cargo("Administrativa")
                .fechaInicioContrato(LocalDate.of(2021, 9, 15)).activo(true).usuario(uLaura).build();
        trabajadorRepo.save(tLaura);

        // 2. CLIENTES INTERESADOS
        Usuario uJuan = crearUsuario("juan.perez@example.com", "Juan", "Perez Dominguez",
                "34611100200", "34567890D", "Client123!", Role.ROLE_INTERESADO);
        interesadoRepo.save(Interesado.builder().usuario(uJuan)
                .presupuestoMaximo(new BigDecimal("220000")).zonaInteres("Chapin")
                .habitacionesMinimas(3).banosMinimos(1).tipoBusqueda(TipoOperacion.VENTA)
                .observaciones("Busca piso amplio con garaje, preferiblemente reformado.").build());

        Usuario uMaria = crearUsuario("maria.lopez@example.com", "Maria", "Lopez Sanchez",
                "34622200300", "45678901E", "Client123!", Role.ROLE_INTERESADO);
        interesadoRepo.save(Interesado.builder().usuario(uMaria)
                .presupuestoMaximo(new BigDecimal("950")).zonaInteres("Centro")
                .habitacionesMinimas(2).banosMinimos(1).tipoBusqueda(TipoOperacion.ALQUILER)
                .observaciones("Alquiler con opcion a compra. No tiene mascotas.").build());

        // 3. VENDEDOR
        Usuario uAntonio = crearUsuario("antonio.fdez@example.com", "Antonio", "Fernandez Vera",
                "34633300400", "56789012F", "Client123!", Role.ROLE_VENDEDOR);
        Vendedor vAntonio = vendedorRepo.save(Vendedor.builder().usuario(uAntonio)
                .observaciones("Propietario de varios inmuebles en Jerez.").build());

        // 4. INMUEBLES
        Inmueble p1 = inmuebleRepo.save(Inmueble.builder().referencia("JS-001")
                .titulo("Piso luminoso de 3 habitaciones en Chapin")
                .descripcion("Precioso piso en segunda planta con ascensor, completamente reformado en 2021. "
                        + "Cocina americana integrada, suelos de marmol y ventanas de doble acristalamiento.")
                .precio(new BigDecimal("168000")).operacion(TipoOperacion.VENTA)
                .estado(EstadoInmueble.DISPONIBLE).tipo(TipoInmueble.PISO)
                .habitaciones(3).banos(1).superficieUtil(88.0).mConstruidos(102.0)
                .direccion("C/ Poeta Munoz Seca, 14").zona("Chapin")
                .codigoPostal("11407").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("65")).ibi(new BigDecimal("420")).tieneDerrama(false).destacado(true)
                .caracteristicasExtra(Map.of("Ascensor", "Si", "Garaje", "Opcional", "Piscina", "Si"))
                .propietariosPorcentaje(Map.of(vAntonio, 100.0)).build());

        Inmueble p2 = inmuebleRepo.save(Inmueble.builder().referencia("JS-002")
                .titulo("Atico con terraza privada y vistas al centro historico")
                .descripcion("Espectacular atico en la ultima planta de edificio senorial. Terraza de 40 m2 "
                        + "con vistas panoramicas a la Catedral de Jerez.")
                .precio(new BigDecimal("245000")).operacion(TipoOperacion.VENTA)
                .estado(EstadoInmueble.DISPONIBLE).tipo(TipoInmueble.ATICO)
                .habitaciones(2).banos(2).superficieUtil(75.0).mConstruidos(115.0)
                .direccion("C/ Larga, 28").zona("Centro").codigoPostal("11402").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("95")).ibi(new BigDecimal("580")).tieneDerrama(false).destacado(true)
                .caracteristicasExtra(Map.of("Terraza", "40 m2", "Ascensor", "Si", "Vistas", "Catedral"))
                .propietariosPorcentaje(Map.of(vAntonio, 100.0)).build());

        Inmueble p3 = inmuebleRepo.save(Inmueble.builder().referencia("JS-003")
                .titulo("Casa adosada con jardin en El MOPU")
                .descripcion("Adosado en esquina con jardin privado de 60 m2, garaje incorporado y trastero.")
                .precio(new BigDecimal("215000")).operacion(TipoOperacion.VENTA)
                .estado(EstadoInmueble.DISPONIBLE).tipo(TipoInmueble.ADOSADO)
                .habitaciones(3).banos(2).superficieUtil(120.0).mConstruidos(140.0)
                .direccion("Avda. de Carteya, 52").zona("MOPU").codigoPostal("11405").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("55")).ibi(new BigDecimal("490")).tieneDerrama(false).destacado(true)
                .caracteristicasExtra(Map.of("Jardin", "60 m2", "Garaje", "Incluido", "Piscina", "Si")).build());

        Inmueble p4 = inmuebleRepo.save(Inmueble.builder().referencia("JS-004")
                .titulo("Piso de 2 habitaciones ideal para alquilar en Ronda")
                .descripcion("Piso en buen estado listo para entrar a vivir. Salon amplio, cocina equipada.")
                .precio(new BigDecimal("750")).operacion(TipoOperacion.ALQUILER)
                .estado(EstadoInmueble.DISPONIBLE).tipo(TipoInmueble.PISO)
                .habitaciones(2).banos(1).superficieUtil(68.0).mConstruidos(78.0)
                .direccion("C/ Taxdirt, 8").zona("Ronda").codigoPostal("11403").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("45")).ibi(new BigDecimal("310")).tieneDerrama(false).destacado(false)
                .caracteristicasExtra(Map.of("Portero", "Si", "Armarios empotrados", "Si")).build());

        Inmueble p5 = inmuebleRepo.save(Inmueble.builder().referencia("JS-005")
                .titulo("Estudio amueblado en pleno centro de Jerez")
                .descripcion("Estudio de diseno totalmente amueblado y equipado. Ideal para estudiantes.")
                .precio(new BigDecimal("480")).operacion(TipoOperacion.ALQUILER)
                .estado(EstadoInmueble.DISPONIBLE).tipo(TipoInmueble.ESTUDIO)
                .habitaciones(1).banos(1).superficieUtil(32.0).mConstruidos(35.0)
                .direccion("Pl. del Arenal, 3").zona("Centro").codigoPostal("11401").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("30")).tieneDerrama(false).destacado(false)
                .caracteristicasExtra(Map.of("Amueblado", "Si", "Disponibilidad", "Inmediata")).build());

        Inmueble p6 = inmuebleRepo.save(Inmueble.builder().referencia("JS-006")
                .titulo("Chalet independiente con piscina privada en La Cartuja")
                .descripcion("Magnifico chalet con piscina privada de 40 m2, jardin de 500 m2 y garaje para 2 coches.")
                .precio(new BigDecimal("485000")).operacion(TipoOperacion.VENTA)
                .estado(EstadoInmueble.DISPONIBLE).tipo(TipoInmueble.CHALET)
                .habitaciones(4).banos(3).superficieUtil(280.0).mConstruidos(320.0)
                .direccion("C/ Pintor Sorolla, 7").zona("La Cartuja").codigoPostal("11408").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("120")).ibi(new BigDecimal("1100")).tieneDerrama(false).destacado(true)
                .caracteristicasExtra(Map.of("Piscina privada", "Si", "Jardin", "500 m2", "Garaje", "2 plazas")).build());

        Inmueble p7 = inmuebleRepo.save(Inmueble.builder().referencia("JS-007")
                .titulo("Piso de 4 habitaciones con parking en La Granja")
                .descripcion("Amplio piso familiar con 4 habitaciones, 2 banos y parking comunitario.")
                .precio(new BigDecimal("185000")).operacion(TipoOperacion.VENTA)
                .estado(EstadoInmueble.RESERVADO).tipo(TipoInmueble.PISO)
                .habitaciones(4).banos(2).superficieUtil(115.0).mConstruidos(130.0)
                .direccion("C/ Columela, 19").zona("La Granja").codigoPostal("11406").ciudad("Jerez de la Frontera")
                .comunidad(new BigDecimal("80")).ibi(new BigDecimal("510")).tieneDerrama(true)
                .valorDerrama(new BigDecimal("2400")).destacado(false)
                .caracteristicasExtra(Map.of("Parking", "Incluido", "Trastero", "Si")).build());

        Inmueble p8 = inmuebleRepo.save(Inmueble.builder().referencia("JS-008")
                .titulo("Local comercial en zona de alto trafico peatonal")
                .descripcion("Local diafano con escaparate de 6 metros. Ideal para hosteleria o comercio.")
                .precio(new BigDecimal("1400")).operacion(TipoOperacion.ALQUILER)
                .estado(EstadoInmueble.DISPONIBLE).tipo(TipoInmueble.LOCAL_COMERCIAL)
                .habitaciones(null).banos(1).superficieUtil(95.0).mConstruidos(100.0)
                .direccion("C/ Consistorio, 5").zona("Centro").codigoPostal("11401").ciudad("Jerez de la Frontera")
                .tieneDerrama(false).destacado(false)
                .caracteristicasExtra(Map.of("Escaparate", "6 m", "Almacen", "Si")).build());

        // 5. IMAGENES
        guardarImagenes(p1, List.of(
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=75&fm=webp",
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=75&fm=webp"));
        guardarImagenes(p2, List.of(
                "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=75&fm=webp",
                "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=75&fm=webp"));
        guardarImagenes(p3, List.of(
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=75&fm=webp",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=75&fm=webp"));
        guardarImagenes(p4, List.of(
                "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=75&fm=webp"));
        guardarImagenes(p5, List.of(
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=75&fm=webp"));
        guardarImagenes(p6, List.of(
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=75&fm=webp",
                "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=75&fm=webp",
                "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=75&fm=webp"));
        guardarImagenes(p7, List.of(
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=75&fm=webp"));
        guardarImagenes(p8, List.of(
                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=75&fm=webp"));

        // 6. CITAS
        citaRepo.save(Cita.builder()
                .fechaHora(LocalDateTime.now().plusDays(3).withHour(10).withMinute(30))
                .motivo("Quiero ver el piso de Chapin en persona.")
                .estado(EstadoCita.CONFIRMADA).usuario(uJuan).trabajador(tCarlos).inmueble(p1).build());
        citaRepo.save(Cita.builder()
                .fechaHora(LocalDateTime.now().plusDays(7).withHour(11).withMinute(0))
                .motivo("Consulta sobre opciones de alquiler en el centro.")
                .estado(EstadoCita.PENDIENTE).usuario(uMaria).trabajador(tLaura).inmueble(null).build());
        citaRepo.save(Cita.builder()
                .fechaHora(LocalDateTime.now().minusDays(5).withHour(17).withMinute(0))
                .motivo("Visita al chalet de La Cartuja.")
                .estado(EstadoCita.REALIZADA).usuario(uJuan).trabajador(tCarlos).inmueble(p6).build());
        citaRepo.save(Cita.builder()
                .fechaHora(LocalDateTime.now().plusDays(14).withHour(9).withMinute(30))
                .motivo("Solicitud de visita al estudio del Arenal.")
                .estado(EstadoCita.PENDIENTE).usuario(uMaria).trabajador(null).inmueble(p5).build());

        // 7. OPERACIONES
        OperacionVenta opVenta = new OperacionVenta();
        opVenta.setTipo(TipoOperacion.VENTA); opVenta.setEstadoActual(EstadoOperacion.EN_TRAMITE);
        opVenta.setPrecioAcordado(new BigDecimal("162000")); opVenta.setInmueble(p1);
        opVenta.setDepositoArras(new BigDecimal("8000"));
        opVenta.setFechaLimiteEscritura(LocalDate.now().plusMonths(3)); opVenta.setIncluyeMobiliario(false);
        OperacionVenta opVentaGuardada = (OperacionVenta) operacionRepo.save(opVenta);

        OperacionAlquiler opAlquiler = new OperacionAlquiler();
        opAlquiler.setTipo(TipoOperacion.ALQUILER); opAlquiler.setEstadoActual(EstadoOperacion.CERRADA);
        opAlquiler.setPrecioAcordado(new BigDecimal("720")); opAlquiler.setInmueble(p4);
        opAlquiler.setFianza(new BigDecimal("1440")); opAlquiler.setDuracionMeses(12); opAlquiler.setAdmiteMascotas(false);
        OperacionAlquiler opAlquilerGuardada = (OperacionAlquiler) operacionRepo.save(opAlquiler);

        // 8. CONTRATOS
        contratoRepo.save(Contrato.builder().fechaFirma(LocalDate.now().plusDays(10))
                .estado(EstadoContrato.PENDIENTE_FIRMA).modelo(ModeloContrato.ARRAS)
                .clausulasEspeciales("Arras penitenciales segun art. 1454 CC.")
                .operacion(opVentaGuardada).trabajador(tCarlos).build());
        contratoRepo.save(Contrato.builder().fechaFirma(LocalDate.now().minusMonths(6))
                .estado(EstadoContrato.FIRMADO).modelo(ModeloContrato.ALQUILER_VIVIENDA)
                .clausulasEspeciales("No se permiten mascotas. Actualizacion anual segun IPC.")
                .operacion(opAlquilerGuardada).trabajador(tLaura).build());

        // 9. MENSAJES DE CONTACTO
        mensajeRepo.save(MensajeContacto.builder().nombre("Pedro Ruiz")
                .email("pedro.ruiz@gmail.com").telefono("634500100")
                .mensaje("Buenos dias, me interesa el piso JS-001 de Chapin. Podria concertar una visita?")
                .inmueble(p1).leido(false).build());
        mensajeRepo.save(MensajeContacto.builder().nombre("Sofia Castro")
                .email("sofia.c@hotmail.com").telefono("611200300")
                .mensaje("Hola, quisiera informacion sobre tasaciones gratuitas para vender mi piso.")
                .inmueble(null).leido(true).build());
        mensajeRepo.save(MensajeContacto.builder().nombre("Ramon Vega")
                .email("rvega@empresa.es").telefono("956300200")
                .mensaje("Informacion sobre el local JS-008. Queremos abrir un restaurante.")
                .inmueble(p8).leido(false).build());

        // 10. TAREAS
        tareaRepo.save(Tarea.builder().titulo("Preparar documentacion arras JS-001")
                .descripcion("Preparar contrato de arras para Juan Perez. Confirmar datos bancarios y DNI.")
                .fecha(LocalDate.now().plusDays(5)).prioridad("ALTA")
                .enlace("/citas").etiquetaEnlace("Ver citas").build());
        tareaRepo.save(Tarea.builder().titulo("Publicar JS-006 en Idealista y Fotocasa")
                .descripcion("El chalet de La Cartuja ya tiene fotos definitivas. Subir anuncio a portales.")
                .fecha(LocalDate.now().plusDays(2)).prioridad("MEDIA").build());
        tareaRepo.save(Tarea.builder().titulo("Llamar a Antonio Fernandez sobre tasacion")
                .descripcion("Propietario esperando confirmacion del precio de tasacion de su piso en La Granja.")
                .fecha(LocalDate.now().plusDays(1)).prioridad("ALTA").build());
        tareaRepo.save(Tarea.builder().titulo("Renovar contrato de alquiler JS-004")
                .descripcion("El contrato actual vence el mes que viene. Contactar al inquilino.")
                .fecha(LocalDate.now().plusDays(21)).prioridad("MEDIA").build());
        tareaRepo.save(Tarea.builder().titulo("Actualizar fotos del atico JS-002")
                .descripcion("El propietario ha reformado la terraza. Programar sesion fotografica.")
                .fecha(LocalDate.now().plusDays(8)).prioridad("BAJA").build());

        log.info("DataSeeder: datos de ejemplo insertados correctamente.");
    }

    private Usuario crearUsuario(String email, String nombre, String apellidos,
                                  String telefono, String dni, String password, Role role) {
        return usuarioRepo.findByEmail(email).orElseGet(() -> usuarioRepo.save(
                Usuario.builder().email(email).nombre(nombre).apellidos(apellidos)
                        .telefono(telefono).dni(dni).password(passwordEncoder.encode(password))
                        .role(role).cambiarPasswd(false).cuentaActivada(true).verified(true)
                        .provider(AuthProvider.LOCAL).origen(OrigenUsuario.CRM_TRABAJADOR).build()
        ));
    }

    private void guardarImagenes(Inmueble inmueble, List<String> urls) {
        for (int i = 0; i < urls.size(); i++) {
            imagenRepo.save(Imagen.builder().url(urls.get(i)).esPortada(i == 0).inmueble(inmueble).build());
        }
    }
}
