// Página "Mis Citas" del frontend público
// Permite al usuario ver sus citas y pedir una nueva cita en la oficina.
// Si el usuario no ha iniciado sesión muestra un aviso para que lo haga.
import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/MisCitas.scss';

// --- TIPOS ---

// Estructura que devuelve el backend en /api/citas/usuario/{id}
type CitaDTO = {
  id: number;
  fechaHora: string;
  motivo?: string;
  estado: string;           // "PENDIENTE" | "CONFIRMADA" | "REALIZADA" | "CANCELADA"
  nombreTrabajador?: string; // null si aún no hay agente asignado
  direccionInmueble?: string;
  inmuebleId?: number;
  inmuebleTitulo?: string;
};

// Estado del formulario de nueva cita en oficina
type NuevaCitaForm = {
  fechaDate: string; // "2026-06-15"
  fechaTime: string; // "10:30"
  motivo: string;
};

const API_BASE = '/api';

// --- HELPER: URL de Google Calendar ---
// Construye la URL de Google Calendar para añadir la cita al calendario del usuario.
// Los parámetros action=TEMPLATE hacen que se abra un formulario pre-relleno.
const buildGoogleCalendarUrl = (fechaHoraISO: string, titulo: string, lugar: string): string => {
  // Formato que espera Google: YYYYMMDDTHHmmssZ (sin guiones ni dos puntos)
  const start = fechaHoraISO.replace(/[-:]/g, '').slice(0, 15) + '00Z';
  const end = new Date(new Date(fechaHoraISO).getTime() + 60 * 60 * 1000)
    .toISOString().replace(/[-:]/g, '').slice(0, 15) + '00Z';
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     titulo,
    details:  'Cita con JerezSur Inmobiliaria',
    location: lugar,
    dates:    `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const INITIAL_FORM: NuevaCitaForm = { fechaDate: '', fechaTime: '', motivo: '' };

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
};

// --- HELPERS ---

const formatFecha = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getMinDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// --- COMPONENTE ---

const MisCitas: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [citas, setCitas] = useState<CitaDTO[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [errorCitas, setErrorCitas] = useState('');

  const [form, setForm] = useState<NuevaCitaForm>(INITIAL_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formExito, setFormExito] = useState(false);

  // Carga de citas del usuario
  useEffect(() => {
    if (!user) return;

    setLoadingCitas(true);
    setErrorCitas('');

    // getToken() soporta tanto 'token' como 'accessToken' — ambas claves usan los distintos flujos de login
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
    fetch(`${API_BASE}/citas/usuario/${user.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((data: CitaDTO[]) => setCitas(Array.isArray(data) ? data : []))
      .catch((e) => setErrorCitas(e.message))
      .finally(() => setLoadingCitas(false));
  }, [user, formExito]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.fechaDate || !form.fechaTime) {
      setFormError('La fecha y la hora son obligatorias.');
      return;
    }

    const fechaHora = `${form.fechaDate}T${form.fechaTime}:00`;
    if (new Date(fechaHora) <= new Date()) {
      setFormError('La fecha y hora deben ser futuras.');
      return;
    }

    setFormLoading(true);
    setFormError('');

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
          inmuebleId: null,
          fechaHora,
          motivo: form.motivo.trim() || null,
        }),
      });

      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const msg = ct.includes('json')
          ? (await res.json())?.message || 'Error al solicitar la cita.'
          : await res.text();
        setFormError(msg);
        return;
      }

      setFormExito(true);
      setForm(INITIAL_FORM);
      setTimeout(() => setFormExito(false), 5000);
    } catch {
      setFormError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setFormLoading(false);
    }
  };

  // --- RENDER: no autenticado ---

  if (!isAuthenticated) {
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h1>Mis citas</h1>
        <p>Debes iniciar sesión para ver tus citas.</p>
        <Link to="/acceder" className="btn btn--primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Iniciar sesión
        </Link>
      </main>
    );
  }

  return (
    <main className="mis-citas">
      {/* HERO */}
      <section className="miscitas-hero">
        <div className="miscitas-hero__content">
          <h1 className="miscitas-hero__titulo">Mis citas</h1>
          <p className="miscitas-hero__sub">Gestiona tus visitas a propiedades en Jerez</p>
        </div>
      </section>

      <div className="mis-citas__container">

        {/* LISTA DE CITAS */}
        <section className="mis-citas__lista">
          {loadingCitas && <p>Cargando citas...</p>}
          {errorCitas && <p style={{ color: 'red' }}>Error al cargar citas: {errorCitas}</p>}

          {!loadingCitas && !errorCitas && citas.length === 0 && (
            <p>No tienes ninguna cita registrada.</p>
          )}

          {citas.map((cita) => (
            <article key={cita.id} className="mis-citas__cita">
              <div className="mis-citas__cita-header">
                <span className={`mis-citas__estado mis-citas__estado--${cita.estado.toLowerCase()}`}>
                  {ESTADO_LABEL[cita.estado] || cita.estado}
                </span>
                <time>{formatFecha(cita.fechaHora)}</time>
              </div>

              {cita.inmuebleTitulo ? (
                <p>
                  <strong>Inmueble:</strong>{' '}
                  {cita.inmuebleId ? (
                    <Link to={`/inmuebles/${cita.inmuebleId}`}>{cita.inmuebleTitulo}</Link>
                  ) : (
                    cita.inmuebleTitulo
                  )}
                </p>
              ) : (
                <p><strong>Tipo:</strong> Cita en oficina</p>
              )}

              {cita.motivo && <p><strong>Mensaje:</strong> {cita.motivo}</p>}
              {cita.nombreTrabajador && <p><strong>Agente asignado:</strong> {cita.nombreTrabajador}</p>}
              {(cita.estado === 'CONFIRMADA' || cita.estado === 'PENDIENTE') && (
                <a
                  href={buildGoogleCalendarUrl(
                    cita.fechaHora,
                    cita.inmuebleTitulo ? `Visita: ${cita.inmuebleTitulo}` : 'Cita en JerezSur Inmobiliaria',
                    'JerezSur Inmobiliaria, Jerez de la Frontera'
                  )}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.82rem', color: '#1a73e8', display: 'inline-block', marginTop: '0.4rem' }}
                >
                  📅 Añadir a Google Calendar
                </a>
              )}
            </article>
          ))}
        </section>

        {/* FORMULARIO NUEVA CITA EN OFICINA */}
        <section className="mis-citas__nueva">
          <h2>Pedir cita en oficina</h2>

          {formExito ? (
            <div>
              <p style={{ color: '#2e9b4d', marginBottom: '0.75rem' }}>
                ✅ Cita solicitada correctamente. Nos pondremos en contacto contigo.
              </p>
              {form.fechaDate && form.fechaTime && (
                <a
                  href={buildGoogleCalendarUrl(
                    `${form.fechaDate}T${form.fechaTime}:00`,
                    'Cita en JerezSur Inmobiliaria',
                    'JerezSur Inmobiliaria, Jerez de la Frontera'
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--outline"
                  style={{ display: 'inline-flex', fontSize: '0.9rem' }}
                >
                  📅 Añadir a Google Calendar
                </a>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="fechaDate">Fecha *</label>
                <input
                  id="fechaDate"
                  type="date"
                  name="fechaDate"
                  required
                  min={getMinDate()}
                  value={form.fechaDate}
                  onChange={handleChange}
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
                  value={form.fechaTime}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="motivo">Motivo (opcional)</label>
                <textarea
                  id="motivo"
                  name="motivo"
                  rows={3}
                  value={form.motivo}
                  onChange={handleChange}
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              {formError && <p style={{ color: 'red', marginBottom: '0.5rem' }}>{formError}</p>}
              <button type="submit" className="btn btn--primary btn--full" disabled={formLoading}>
                {formLoading ? 'Enviando...' : 'Solicitar cita'}
              </button>
            </form>
          )}
        </section>

      </div>
    </main>
  );
};

export default MisCitas;
