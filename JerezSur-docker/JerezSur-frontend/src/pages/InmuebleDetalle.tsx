import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/InmuebleDetalle.scss';

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
};

// --- CONSTANTES ---

const API_BASE = '/api';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';

const INITIAL_CITA_FORM: CitaForm = { fechaDate: '', fechaTime: '', motivo: '' };

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

  const [citaForm, setCitaForm] = useState<CitaForm>(INITIAL_CITA_FORM);
  const [citaLoading, setCitaLoading] = useState(false);
  const [citaError, setCitaError] = useState('');
  const [citaExito, setCitaExito] = useState(false);

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

  const handleCitaChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCitaForm((prev) => ({ ...prev, [name]: value }));
    if (citaError) setCitaError('');
  };

  const handleCitaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!citaForm.fechaDate || !citaForm.fechaTime) {
      setCitaError('La fecha y la hora son obligatorias.');
      return;
    }

    const fechaHora = `${citaForm.fechaDate}T${citaForm.fechaTime}:00`;
    if (new Date(fechaHora) <= new Date()) {
      setCitaError('La fecha y hora deben ser futuras.');
      return;
    }

    setCitaLoading(true);
    setCitaError('');

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_BASE}/citas/usuario/solicitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuarioId: user.id,
          inmuebleId: inmueble?.id,
          fechaHora,
          motivo: citaForm.motivo.trim() || null,
        }),
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
      <section className="inmueble-detalle__galeria">
        <div className="inmueble-detalle__imagen-principal">
          <img src={imagenUrl} alt={inmueble.titulo} />
        </div>
        {imagenes.length > 1 && (
          <div className="inmueble-detalle__miniaturas">
            {imagenes.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setImagenActiva(idx)}
                className={`inmueble-detalle__miniatura${idx === imagenActiva ? ' inmueble-detalle__miniatura--activa' : ''}`}
              >
                <img src={img.url} alt={`Imagen ${idx + 1}`} />
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

          {/* Certificado energético */}
          {inmueble.urlCertificadoEnergetico && (
            <div style={{ marginTop: '1rem' }}>
              <a href={inmueble.urlCertificadoEnergetico} target="_blank" rel="noreferrer" className="btn btn--outline">
                Ver certificado energético
              </a>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: FORMULARIO CITA */}
        <aside className="inmueble-detalle__cita">
          <h2>Solicitar visita</h2>

          {!isAuthenticated ? (
            <div>
              <p>Para solicitar una visita debes iniciar sesión.</p>
              <Link to="/acceder" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Iniciar sesión
              </Link>
            </div>
          ) : citaExito ? (
            <div>
              <p>Cita solicitada correctamente. Nos pondremos en contacto contigo para confirmarla.</p>
              <button className="btn btn--outline" onClick={() => setCitaExito(false)} style={{ marginTop: '1rem' }}>
                Solicitar otra cita
              </button>
            </div>
          ) : (
            <form onSubmit={handleCitaSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="fechaDate">Fecha *</label>
                <input
                  id="fechaDate"
                  type="date"
                  name="fechaDate"
                  required
                  min={getMinDate()}
                  value={citaForm.fechaDate}
                  onChange={handleCitaChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="fechaTime">Hora *</label>
                <input
                  id="fechaTime"
                  type="time"
                  name="fechaTime"
                  required
                  min="09:00"
                  max="20:00"
                  value={citaForm.fechaTime}
                  onChange={handleCitaChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="motivo">Mensaje (opcional)</label>
                <textarea
                  id="motivo"
                  name="motivo"
                  rows={3}
                  value={citaForm.motivo}
                  onChange={handleCitaChange}
                  placeholder="¿Algo que quieras comentarnos?"
                />
              </div>
              {citaError && <p style={{ color: 'red', marginBottom: '0.5rem' }}>{citaError}</p>}
              <button type="submit" className="btn btn--primary btn--full" disabled={citaLoading}>
                {citaLoading ? 'Enviando...' : 'Solicitar visita'}
              </button>
            </form>
          )}
        </aside>
      </section>
    </main>
  );
};

export default InmuebleDetalle;
