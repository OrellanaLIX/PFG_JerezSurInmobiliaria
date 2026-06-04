// Página de detalle de un inmueble: muestra toda la información del inmueble (fotos,
// características, ubicación) y el formulario para solicitar una visita (logueado o anónimo).
import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/InmuebleDetalle.scss';
import { useSEO } from '../hooks/useSEO';

// --- TIPOS ---

type ImagenDTO = {
  id: number;
  url: string;
  esPortada: boolean;
};

type InmuebleDetalleDTO = {
  id: number;
  referencia: string;
  titulo: string;
  descripcion?: string;
  precio: number;
  operacion?: string;
  estado?: string;
  tipo?: string;
  superficieUtil?: number;
  mConstruidos?: number;
  habitaciones?: number;
  banos?: number;
  direccion: string;
  zona?: string;
  codigoPostal?: string;
  ciudad: string;
  comunidad?: number;
  tieneDerrama?: boolean;
  valorDerrama?: number;
  ibi?: number;
  urlCertificadoEnergetico?: string;
  caracteristicasExtra?: Record<string, string>;
  imagenes?: ImagenDTO[];
};

type CitaForm = {
  fechaDate: string;
  fechaTime: string;
  motivo: string;
  // campos para usuarios no logueados
  nombre: string;
  telefono: string;
  email: string;
  aceptaPrivacidad: boolean;
};

// --- CONSTANTES ---

const API_BASE = '/api';

// WebP reduce el tamaño ~50% vs JPEG. w=1200 es suficiente para la galería.
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=75&fm=webp';

const INITIAL_CITA_FORM: CitaForm = {
  fechaDate: '', fechaTime: '', motivo: '',
  nombre: '', telefono: '', email: '', aceptaPrivacidad: false,
};

// --- HELPERS ---

const formatPrecio = (precio: number, operacion?: string): string => {
  const f = new Intl.NumberFormat('es-ES').format(precio);
  return operacion === 'ALQUILER' ? `${f} €/mes` : `${f} €`;
};

const getMinDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const buildGoogleCalendarUrl = (
  titulo: string,
  descripcion: string,
  lugar: string,
  fechaHoraISO: string
): string => {
  const start = fechaHoraISO.replace(/[-:]/g, '').replace('.', '').slice(0, 15) + '00Z';
  // Evento de 1 hora
  const end = new Date(new Date(fechaHoraISO).getTime() + 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:]/g, '')
    .slice(0, 15) + '00Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    details: descripcion,
    location: lugar,
    dates: `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const OPERACION_LABEL: Record<string, string> = {
  VENTA: 'Venta',
  ALQUILER: 'Alquiler',
  AMBOS: 'Venta / Alquiler',
};

const ESTADO_LABEL: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  VENDIDO: 'Vendido',
  RESERVADO: 'Reservado',
  RETIRADO: 'Retirado',
};

// --- COMPONENTE ---

const InmuebleDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [inmueble, setInmueble] = useState<InmuebleDetalleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagenActiva, setImagenActiva] = useState(0);

  const portadaUrl = inmueble?.imagenes?.find(img => img.esPortada)?.url
                  ?? inmueble?.imagenes?.[0]?.url;

  useSEO({
    title:       inmueble ? `${inmueble.titulo} — ${inmueble.ciudad}` : 'Detalle de inmueble',
    description: inmueble?.descripcion
      ? inmueble.descripcion.slice(0, 155)
      : 'Ficha detallada con galería de imágenes, características, precio y formulario de visita.',
    canonical: `${window.location.origin}/inmuebles/${id}`,
    image:    portadaUrl,
    type:     'article',
  });

  // Inyectar JSON-LD Schema.org del inmueble para mejorar el SEO
  // Google puede mostrar datos enriquecidos (precio, habitaciones…) en los resultados
  useEffect(() => {
    if (!inmueble) return;
    const scriptId = 'jsonld-inmueble';
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.id = scriptId;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type':    inmueble.tipo === 'LOCAL_COMERCIAL' ? 'Accommodation' : 'Residence',
      name:        inmueble.titulo,
      description: inmueble.descripcion,
      url:         `${window.location.origin}/inmuebles/${id}`,
      address: {
        '@type':          'PostalAddress',
        streetAddress:    inmueble.direccion,
        addressLocality:  inmueble.ciudad,
        postalCode:       inmueble.codigoPostal,
        addressCountry:   'ES',
      },
      offers: {
        '@type':         'Offer',
        price:           inmueble.precio,
        priceCurrency:   'EUR',
        availability:    inmueble.estado === 'DISPONIBLE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
        priceSpecification: {
          '@type':         'UnitPriceSpecification',
          price:           inmueble.precio,
          priceCurrency:   'EUR',
          ...(inmueble.operacion === 'ALQUILER' && { referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } }),
        },
      },
    };
    if (inmueble.habitaciones) schema.numberOfRooms = inmueble.habitaciones;
    if (inmueble.superficieUtil) schema.floorSize = { '@type': 'QuantitativeValue', value: inmueble.superficieUtil, unitCode: 'MTK' };
    if (portadaUrl) schema.image = portadaUrl;
    el.textContent = JSON.stringify(schema);
    return () => { el?.remove(); };
  }, [inmueble, id, portadaUrl]);

  const [citaForm, setCitaForm] = useState<CitaForm>(INITIAL_CITA_FORM);
  const [citaLoading, setCitaLoading] = useState(false);
  const [citaError, setCitaError] = useState('');
  const [citaExito, setCitaExito] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Carga del inmueble
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/inmuebles/${id}/detalle`)
      .then((r) => {
        if (r.status === 404) throw new Error('Inmueble no encontrado');
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((data: InmuebleDetalleDTO) => setInmueble(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCompartir = async () => {
    const url = window.location.href;
    const titulo = inmueble?.titulo || 'Inmueble en JerezSur';
    const texto = `${titulo} — JerezSur Inmobiliaria`;

    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url });
      } catch {
        // El usuario canceló el diálogo — no hacer nada
      }
    } else {
      // Fallback: copiar URL al portapapeles
      try {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      } catch {
        // Fallback manual si clipboard API no disponible
        prompt('Copia este enlace:', url);
      }
    }
  };

  const handleCitaChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setCitaForm((prev) => ({ ...prev, [target.name]: value }));
    if (citaError) setCitaError('');
  };

  const handleCitaSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!citaForm.fechaDate || !citaForm.fechaTime) {
      setCitaError('La fecha y la hora son obligatorias.');
      return;
    }

    const fechaHora = `${citaForm.fechaDate}T${citaForm.fechaTime}:00`;
    if (new Date(fechaHora) <= new Date()) {
      setCitaError('La fecha y hora deben ser futuras.');
      return;
    }

    // Para usuario anónimo validar nombre y teléfono
    if (!isAuthenticated) {
      if (!citaForm.nombre.trim()) { setCitaError('El nombre es obligatorio.'); return; }
      if (!citaForm.telefono.trim()) { setCitaError('El teléfono es obligatorio.'); return; }
      if (!citaForm.aceptaPrivacidad) { setCitaError('Debes aceptar la política de privacidad.'); return; }
    }

    setCitaLoading(true);
    setCitaError('');

    try {
      let endpoint: string;
      let body: Record<string, unknown>;
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';

      if (isAuthenticated && user) {
        // Usuario logueado → endpoint de usuario registrado (no necesita teléfono)
        // /api/citas/usuario/solicitar usa SolicitudCitaUsuarioDTO (solo usuarioId + fechaHora)
        endpoint = `${API_BASE}/citas/usuario/solicitar`;
        body = {
          usuarioId: user.id,
          fechaHora,
          motivo: citaForm.motivo.trim() || null,
          inmuebleId: inmueble?.id ?? null,
        };
      } else {
        // Anónimo → endpoint público (necesita nombre, teléfono y privacidad)
        endpoint = `${API_BASE}/citas/solicitar`;
        body = {
          nombre: citaForm.nombre.trim(),
          telefono: citaForm.telefono.trim(),
          email: citaForm.email.trim() || null,
          fechaHora,
          motivo: citaForm.motivo.trim() || null,
          inmuebleId: inmueble?.id ?? null,
          aceptaPrivacidad: true,
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const msg = ct.includes('json')
          ? (await res.json())?.message || 'Error al solicitar la cita.'
          : await res.text();
        setCitaError(msg);
        return;
      }

      setCitaExito(true);
      setCitaForm(INITIAL_CITA_FORM);
    } catch {
      setCitaError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setCitaLoading(false);
    }
  };

  // --- RENDER: estados ---

  if (loading) {
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p>Cargando inmueble...</p>
      </main>
    );
  }

  if (error || !inmueble) {
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Inmueble no encontrado</h2>
        <p>{error || 'No se encontró el inmueble solicitado.'}</p>
        <Link to="/inmuebles" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Volver al listado
        </Link>
      </main>
    );
  }

  const imagenes = inmueble.imagenes || [];
  const imagenUrl = imagenes.length > 0 ? imagenes[imagenActiva].url : DEFAULT_IMAGE;
  const extras = inmueble.caracteristicasExtra || {};

  return (
    <main className="inmueble-detalle">

      {/* NAVEGACIÓN */}
      <div className="inmueble-detalle__back">
        <Link to="/inmuebles" className="btn btn--ghost btn--ghost--dark">
          <i className="fas fa-arrow-left"></i> Volver al listado
        </Link>
      </div>

      {/* GALERÍA */}
      <section className="inmueble-detalle__galeria" aria-label="Galería de imágenes del inmueble">
        <div className="inmueble-detalle__imagen-principal">
          {/* fetchpriority="high" porque es el LCP de la página de detalle */}
          <img
            src={imagenUrl}
            alt={inmueble.titulo}
            fetchPriority="high"
            decoding="async"
          />
        </div>
        {imagenes.length > 1 && (
          <div className="inmueble-detalle__miniaturas">
            {imagenes.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setImagenActiva(idx)}
                className={`inmueble-detalle__miniatura${idx === imagenActiva ? ' inmueble-detalle__miniatura--activa' : ''}`}
                aria-label={`Ver imagen ${idx + 1}`}
              >
                {/* Las miniaturas no son LCP, las cargamos con lazy */}
                <img src={img.url} alt={`Vista ${idx + 1} de ${inmueble.titulo}`} loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="inmueble-detalle__contenido">

        {/* COLUMNA IZQUIERDA: INFO */}
        <div className="inmueble-detalle__info">

          {/* Cabecera */}
          <div className="inmueble-detalle__cabecera">
            <div className="inmueble-detalle__cabecera-top">
              <div>
                <span className="inmueble-detalle__ref">{inmueble.referencia}</span>
                {inmueble.operacion && (
                  <span className="inmueble-detalle__badge">
                    {OPERACION_LABEL[inmueble.operacion] || inmueble.operacion}
                  </span>
                )}
                {inmueble.estado && (
                  <span className="inmueble-detalle__badge inmueble-detalle__badge--estado">
                    {ESTADO_LABEL[inmueble.estado] || inmueble.estado}
                  </span>
                )}
              </div>
              <button
                onClick={handleCompartir}
                className="inmueble-detalle__share-btn"
                title="Compartir este inmueble"
              >
                {copiado ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Enlace copiado
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Compartir
                  </>
                )}
              </button>
            </div>
            <h1>{inmueble.titulo}</h1>
            <p className="inmueble-detalle__ubicacion">
              {[inmueble.direccion, inmueble.zona, inmueble.ciudad].filter(Boolean).join(', ')}
              {inmueble.codigoPostal && ` (${inmueble.codigoPostal})`}
            </p>
            <p className="inmueble-detalle__precio">{formatPrecio(inmueble.precio, inmueble.operacion)}</p>
          </div>

          {/* Características principales */}
          <div className="inmueble-detalle__caracteristicas">
            {inmueble.habitaciones != null && (
              <div className="inmueble-detalle__caract-item">
                <strong>{inmueble.habitaciones}</strong>
                <span>Habitaciones</span>
              </div>
            )}
            {inmueble.banos != null && (
              <div className="inmueble-detalle__caract-item">
                <strong>{inmueble.banos}</strong>
                <span>Baños</span>
              </div>
            )}
            {inmueble.superficieUtil != null && (
              <div className="inmueble-detalle__caract-item">
                <strong>{inmueble.superficieUtil} m²</strong>
                <span>Superficie útil</span>
              </div>
            )}
            {inmueble.mConstruidos != null && (
              <div className="inmueble-detalle__caract-item">
                <strong>{inmueble.mConstruidos} m²</strong>
                <span>Construidos</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          {inmueble.descripcion && (
            <div className="inmueble-detalle__descripcion">
              <h2>Descripción</h2>
              <p>{inmueble.descripcion}</p>
            </div>
          )}

          {/* Gastos */}
          {(inmueble.comunidad != null || inmueble.ibi != null || inmueble.tieneDerrama) && (
            <div className="inmueble-detalle__gastos">
              <h2>Gastos</h2>
              {inmueble.comunidad != null && (
                <p>Comunidad: <strong>{inmueble.comunidad} €/mes</strong></p>
              )}
              {inmueble.ibi != null && (
                <p>IBI: <strong>{inmueble.ibi} €/año</strong></p>
              )}
              {inmueble.tieneDerrama && inmueble.valorDerrama != null && (
                <p>Derrama: <strong>{inmueble.valorDerrama} €</strong></p>
              )}
            </div>
          )}

          {/* Extras */}
          {Object.keys(extras).length > 0 && (
            <div className="inmueble-detalle__extras">
              <h2>Características adicionales</h2>
              <ul>
                {Object.entries(extras).map(([k, v]) => (
                  <li key={k}><strong>{k}:</strong> {v}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Certificado energético — disponible bajo solicitud */}
          {inmueble.urlCertificadoEnergetico && (
            <div style={{ marginTop: '1rem' }}>
              <span
                className="btn btn--outline"
                style={{ cursor: 'default', opacity: 0.8 }}
                title="El certificado energético está disponible. Solicítalo a través de nuestro formulario de contacto."
              >
                🔒 Certificado energético disponible
              </span>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.4rem' }}>
                Solicítalo en nuestra <a href="/contacto" style={{ color: '#00439c' }}>página de contacto</a>.
              </p>
            </div>
          )}

          {/* MAPA INTERACTIVO */}
          <div className="inmueble-detalle__mapa">
            <h2>Ubicación</h2>
            <div className="inmueble-detalle__mapa-wrapper">
              <iframe
                title={`Mapa de ${inmueble.titulo}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  [inmueble.direccion, inmueble.zona, inmueble.ciudad, inmueble.codigoPostal]
                    .filter(Boolean)
                    .join(', ')
                )}&output=embed`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO CITA */}
        <aside className="inmueble-detalle__cita">
          <h2>Solicitar visita</h2>

          {citaExito ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Mensaje de estado pendiente */}
              <div style={{
                background: 'rgba(46,155,77,0.08)', border: '1px solid rgba(46,155,77,0.25)',
                borderRadius: 10, padding: '1rem 1.25rem',
              }}>
                <p style={{ margin: '0 0 0.35rem', fontWeight: 700, color: '#1e7a3a', fontSize: '1rem' }}>
                  ✅ Solicitud enviada correctamente
                </p>
                <p style={{ margin: 0, color: '#374151', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Tu visita está <strong>pendiente de confirmación</strong>. Un agente de JerezSur revisará tu solicitud y te enviaremos un email cuando esté confirmada.
                </p>
              </div>
              {/* Botón Google Calendar para guardar la fecha propuesta */}
              <a
                href={buildGoogleCalendarUrl(
                  `Visita pendiente: ${inmueble.titulo}`,
                  `Solicitud de visita al inmueble ${inmueble.referencia} en JerezSur Inmobiliaria. Pendiente de confirmación.\nDirección: ${inmueble.direccion}, ${inmueble.ciudad}`,
                  inmueble.direccion + ', ' + inmueble.ciudad,
                  citaForm.fechaDate && citaForm.fechaTime
                    ? `${citaForm.fechaDate}T${citaForm.fechaTime}:00`
                    : new Date(Date.now() + 86400000).toISOString()
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn--outline"
                style={{ display: 'inline-flex', justifyContent: 'center' }}
              >
                📅 Recordatorio en Google Calendar
              </a>
              <button className="btn btn--ghost btn--ghost--dark btn--sm" onClick={() => setCitaExito(false)}>
                Solicitar otra fecha
              </button>
            </div>
          ) : (
            <form onSubmit={handleCitaSubmit} noValidate>
              {/* Campos de contacto solo para usuarios no logueados */}
              {!isAuthenticated && (
                <>
                  <div className="form-group">
                    <label htmlFor="citaNombre">Nombre *</label>
                    <input
                      id="citaNombre" type="text" name="nombre" required
                      value={citaForm.nombre} onChange={handleCitaChange}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="citaTelefono">Teléfono *</label>
                    <input
                      id="citaTelefono" type="tel" name="telefono" required
                      value={citaForm.telefono} onChange={handleCitaChange}
                      placeholder="600 000 000"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="citaEmail">Email (opcional)</label>
                    <input
                      id="citaEmail" type="email" name="email"
                      value={citaForm.email} onChange={handleCitaChange}
                      placeholder="tu@email.com"
                    />
                  </div>
                </>
              )}
              {isAuthenticated && user && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 0.5rem' }}>
                    Solicitando como <strong>{user.nombre}</strong>
                    {user.telefono ? ` · ${user.telefono}` : ''}
                  </p>
                  {/* Si el usuario logueado no tiene teléfono en su perfil, pedirlo aquí */}
                  {!user.telefono && (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="citaTelefono">Teléfono de contacto *</label>
                      <input
                        id="citaTelefono" type="tel" name="telefono" required
                        value={citaForm.telefono} onChange={handleCitaChange}
                        placeholder="600 000 000"
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="fechaDate">Fecha *</label>
                <input
                  id="fechaDate" type="date" name="fechaDate" required
                  min={getMinDate()} value={citaForm.fechaDate} onChange={handleCitaChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="fechaTime">Hora *</label>
                <input
                  id="fechaTime" type="time" name="fechaTime" required
                  min="09:00" max="20:00" value={citaForm.fechaTime} onChange={handleCitaChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="motivo">Mensaje (opcional)</label>
                <textarea
                  id="motivo" name="motivo" rows={3}
                  value={citaForm.motivo} onChange={handleCitaChange}
                  placeholder="¿Algo que quieras comentarnos?"
                />
              </div>
              {!isAuthenticated && (
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    id="privacidad" type="checkbox" name="aceptaPrivacidad"
                    checked={citaForm.aceptaPrivacidad}
                    onChange={e => setCitaForm(prev => ({ ...prev, aceptaPrivacidad: e.target.checked }))}
                  />
                  <label htmlFor="privacidad" style={{ fontWeight: 'normal', fontSize: '0.82rem', cursor: 'pointer' }}>
                    Acepto la <Link to="/privacidad" style={{ color: '#00439c' }}>política de privacidad</Link>
                  </label>
                </div>
              )}
              {citaError && <p style={{ color: 'red', marginBottom: '0.5rem', fontSize: '0.88rem' }}>{citaError}</p>}
              <button type="submit" className="btn btn--primary btn--full" disabled={citaLoading}>
                {citaLoading ? 'Enviando...' : 'Solicitar visita'}
              </button>
              {!isAuthenticated && (
                <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: '#6b7280' }}>
                  ¿Tienes cuenta? <Link to="/acceder" style={{ color: '#00439c' }}>Inicia sesión</Link> para agilizar el proceso
                </p>
              )}
            </form>
          )}
        </aside>
      </section>
    </main>
  );
};

export default InmuebleDetalle;
