import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/MisCitas.scss';

// --- TIPOS ---

type CitaDTO = {
  id: number;
  fechaHora: string;
  motivo?: string;
  estado: string;
  nombreTrabajador?: string;
  direccionInmueble?: string;
  inmuebleId?: number;
  inmuebleTitulo?: string;
};

type NuevaCitaForm = {
  fechaDate: string;
  fechaTime: string;
  motivo: string;
};

// --- CONSTANTES ---

const API_BASE = '/api';

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

    const token = localStorage.getItem('token') || '';
    fetch(`${API_BASE}/citas/usuario/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
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
      <div className="mis-citas__container">

        {/* LISTA DE CITAS */}
        <section className="mis-citas__lista">
          <h1>Mis citas</h1>

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
            </article>
          ))}
        </section>

        {/* FORMULARIO NUEVA CITA EN OFICINA */}
        <section className="mis-citas__nueva">
          <h2>Pedir cita en oficina</h2>

          {formExito ? (
            <p>Cita solicitada correctamente. Nos pondremos en contacto contigo.</p>
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
