package com.jerezsur.inmobiliaria.services;

import com.jerezsur.inmobiliaria.models.Imagen;
import com.jerezsur.inmobiliaria.models.Inmueble;
import com.jerezsur.inmobiliaria.models.enums.EstadoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoInmueble;
import com.jerezsur.inmobiliaria.models.enums.TipoOperacion;
import com.jerezsur.inmobiliaria.repositories.InmuebleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringWriter;
import java.util.List;
import java.util.Map;

@Service
public class PortalInmobiliarioXmlService {

    @Autowired
    private InmuebleRepository inmuebleRepository;

    @Value("${app.agencia.nombre:JerezSur Inmobiliaria}")
    private String agenciaNombre;

    @Value("${app.agencia.email:info@jerezsur.com}")
    private String agenciaEmail;

    @Value("${app.agencia.telefono:956000000}")
    private String agenciaTelefono;

    @Value("${app.agencia.web:https://jerezsur.com}")
    private String agenciaWeb;

    // Mapeo de tipos al estándar de los portales
    private static final Map<TipoInmueble, String> TIPO_PORTAL = Map.ofEntries(
        Map.entry(TipoInmueble.PISO,            "Piso"),
        Map.entry(TipoInmueble.CASA,            "Casa"),
        Map.entry(TipoInmueble.CHALET,          "Chalet"),
        Map.entry(TipoInmueble.ADOSADO,         "Adosado"),
        Map.entry(TipoInmueble.APARTAMENTO,     "Apartamento"),
        Map.entry(TipoInmueble.ESTUDIO,         "Estudio"),
        Map.entry(TipoInmueble.DUPLEX,          "Duplex"),
        Map.entry(TipoInmueble.ATICO,           "Atico"),
        Map.entry(TipoInmueble.LOCAL_COMERCIAL, "Local"),
        Map.entry(TipoInmueble.OFICINA,         "Oficina"),
        Map.entry(TipoInmueble.GARAJE,          "Garaje"),
        Map.entry(TipoInmueble.TRASTERO,        "Trastero"),
        Map.entry(TipoInmueble.TERRENO,         "Terreno"),
        Map.entry(TipoInmueble.NAVE_INDUSTRIAL, "NaveIndustrial"),
        Map.entry(TipoInmueble.FINCA,           "Finca")
    );

    @Transactional(readOnly = true)
    public String generarFeedCompleto() throws Exception {
        // Solo exportamos los disponibles
        List<Inmueble> inmuebles = inmuebleRepository
                .findByEstado(EstadoInmueble.DISPONIBLE);
        return buildXml(inmuebles);
    }

    @Transactional(readOnly = true)
    public String generarFeedPorTipoOperacion(TipoOperacion operacion) throws Exception {
        List<Inmueble> inmuebles = inmuebleRepository
                .findByEstadoAndOperacion(EstadoInmueble.DISPONIBLE, operacion);
        return buildXml(inmuebles);
    }

    // ── Constructor principal del XML ─────────────────────────────────

    private String buildXml(List<Inmueble> inmuebles) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.newDocument();

        // Raíz
        Element root = doc.createElement("inmuebles");
        root.setAttribute("version", "2.0");
        root.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        doc.appendChild(root);

        // Cabecera de la agencia
        Element agencia = doc.createElement("agencia");
        agregarNodo(doc, agencia, "nombre",    agenciaNombre);
        agregarNodo(doc, agencia, "email",     agenciaEmail);
        agregarNodo(doc, agencia, "telefono",  agenciaTelefono);
        agregarNodo(doc, agencia, "web",       agenciaWeb);
        agregarNodo(doc, agencia, "totalAnuncios", String.valueOf(inmuebles.size()));
        root.appendChild(agencia);

        // Un nodo por inmueble
        for (Inmueble inmueble : inmuebles) {
            root.appendChild(buildNodoInmueble(doc, inmueble));
        }

        return docToString(doc);
    }

    private Element buildNodoInmueble(Document doc, Inmueble i) {
        Element nodo = doc.createElement("inmueble");

        // ── Identificación ────────────────────────────────────────────
        agregarNodo(doc, nodo, "referencia",       i.getReferencia());
        agregarNodo(doc, nodo, "refCatastral",     nullSafe(i.getRefCatastral()));
        agregarNodo(doc, nodo, "tipo",             tipoPortal(i.getTipo()));
        agregarNodo(doc, nodo, "operacion",        operacionPortal(i));
        agregarNodo(doc, nodo, "estado",           i.getEstado().name());

        // ── Datos comerciales ─────────────────────────────────────────
        agregarNodo(doc, nodo, "titulo",           i.getTitulo());
        agregarNodo(doc, nodo, "descripcion",      nullSafe(i.getDescripcion()));
        agregarNodo(doc, nodo, "precio",           i.getPrecio().toPlainString());
        agregarNodo(doc, nodo, "moneda",           "EUR");

        // ── Localización ──────────────────────────────────────────────
        Element ubicacion = doc.createElement("ubicacion");
        agregarNodo(doc, ubicacion, "direccion",      i.getDireccion());
        agregarNodo(doc, ubicacion, "codigoPostal",   i.getCodigoPostal());
        agregarNodo(doc, ubicacion, "ciudad",         i.getCiudad());
        agregarNodo(doc, ubicacion, "provincia",      inferirProvincia(i.getCodigoPostal()));
        agregarNodo(doc, ubicacion, "pais",           "España");
        nodo.appendChild(ubicacion);

        // ── Características técnicas ──────────────────────────────────
        Element caracteristicas = doc.createElement("caracteristicas");
        agregarNodo(doc, caracteristicas, "superficieUtil",
                i.getSuperficieUtil() != null ? String.valueOf(i.getSuperficieUtil()) : "0");
        agregarNodo(doc, caracteristicas, "metrosConstruidos",
                i.getMConstruidos() != null ? String.valueOf(i.getMConstruidos()) : "0");
        agregarNodo(doc, caracteristicas, "habitaciones",
                i.getHabitaciones() != null ? String.valueOf(i.getHabitaciones()) : "0");
        agregarNodo(doc, caracteristicas, "banos",
                i.getBanos() != null ? String.valueOf(i.getBanos()) : "0");
        nodo.appendChild(caracteristicas);

        // ── Características extra (muebles, orientación, etc.) ────────
        if (i.getCaracteristicasExtra() != null && !i.getCaracteristicasExtra().isEmpty()) {
            Element extras = doc.createElement("extras");
            for (Map.Entry<String, String> entry : i.getCaracteristicasExtra().entrySet()) {
                Element extra = doc.createElement("extra");
                extra.setAttribute("clave", entry.getKey());
                extra.setTextContent(entry.getValue());
                extras.appendChild(extra);
            }
            nodo.appendChild(extras);
        }

        // ── Gastos y cargas ───────────────────────────────────────────
        Element gastos = doc.createElement("gastos");
        agregarNodo(doc, gastos, "comunidad",
                i.getComunidad() != null ? i.getComunidad().toPlainString() : "0");
        agregarNodo(doc, gastos, "ibi",
                i.getIbi() != null ? i.getIbi().toPlainString() : "0");
        agregarNodo(doc, gastos, "tieneDerrama",
                String.valueOf(Boolean.TRUE.equals(i.getTieneDerrama())));
        if (Boolean.TRUE.equals(i.getTieneDerrama()) && i.getValorDerrama() != null) {
            agregarNodo(doc, gastos, "valorDerrama", i.getValorDerrama().toPlainString());
        }
        nodo.appendChild(gastos);

        // ── Documentación (URLs públicas) ─────────────────────────────
        Element documentacion = doc.createElement("documentacion");
        if (i.getUrlCertificadoEnergetico() != null)
            agregarNodo(doc, documentacion, "certificadoEnergetico", i.getUrlCertificadoEnergetico());
        if (i.getUrlPlanoInmueble() != null)
            agregarNodo(doc, documentacion, "plano", i.getUrlPlanoInmueble());
        nodo.appendChild(documentacion);

        // ── Imágenes ──────────────────────────────────────────────────
        if (i.getImagenes() != null && !i.getImagenes().isEmpty()) {
            Element imagenes = doc.createElement("imagenes");

            // Portada primero
            i.getImagenes().stream()
                .filter(img -> Boolean.TRUE.equals(img.getEsPortada()))
                .forEach(img -> imagenes.appendChild(buildNodoImagen(doc, img, true)));

            // Resto después
            i.getImagenes().stream()
                .filter(img -> !Boolean.TRUE.equals(img.getEsPortada()))
                .forEach(img -> imagenes.appendChild(buildNodoImagen(doc, img, false)));

            nodo.appendChild(imagenes);
        }

        // ── Auditoría ─────────────────────────────────────────────────
        agregarNodo(doc, nodo, "fechaPublicacion",
                i.getFechaRegistro() != null ? i.getFechaRegistro().toString() : "");
        agregarNodo(doc, nodo, "fechaActualizacion",
                i.getFechaUltimaActualizacion() != null
                        ? i.getFechaUltimaActualizacion().toString() : "");

        return nodo;
    }

    private Element buildNodoImagen(Document doc, Imagen img, boolean esPortada) {
        Element nodo = doc.createElement("imagen");
        nodo.setAttribute("portada", String.valueOf(esPortada));
        nodo.setAttribute("id",      String.valueOf(img.getId()));
        nodo.setTextContent(img.getUrl());
        return nodo;
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private void agregarNodo(Document doc, Element padre, String tag, String valor) {
        Element nodo = doc.createElement(tag);
        nodo.setTextContent(valor != null ? valor : "");
        padre.appendChild(nodo);
    }

    private String nullSafe(String valor) {
        return valor != null ? valor : "";
    }

    private String tipoPortal(TipoInmueble tipo) {
        if (tipo == null) return "Inmueble";
        return TIPO_PORTAL.getOrDefault(tipo, tipo.name());
    }

    private String operacionPortal(Inmueble i) {
        if (i.getOperacion() == null) return "Venta";
        return switch (i.getOperacion()) {
            case VENTA    -> "Venta";
            case ALQUILER -> "Alquiler";
            case CUALQUIERA    -> "VentaAlquiler";
        };
    }

    // Inferencia básica de provincia por código postal español
    private String inferirProvincia(String cp) {
        if (cp == null || cp.length() < 2) return "";
        return switch (cp.substring(0, 2)) {
            case "11" -> "Cádiz";
            case "14" -> "Córdoba";
            case "18" -> "Granada";
            case "21" -> "Huelva";
            case "23" -> "Jaén";
            case "29" -> "Málaga";
            case "41" -> "Sevilla";
            case "04" -> "Almería";
            case "28" -> "Madrid";
            case "08" -> "Barcelona";
            case "46" -> "Valencia";
            default   -> "";
        };
    }

    private String docToString(Document doc) throws TransformerException {
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        transformer.setOutputProperty(OutputKeys.ENCODING,  "UTF-8");
        transformer.setOutputProperty(OutputKeys.INDENT,    "yes");
        transformer.setOutputProperty(OutputKeys.VERSION,   "1.0");
        transformer.setOutputProperty(
                "{http://xml.apache.org/xslt}indent-amount", "2");

        StringWriter writer = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        return writer.toString();
    }
}
