import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Onboarding.scss';

// --- TIPOS ---

type Paso = 'datos' | 'verificacion' | 'exito';

interface CitaFormData {
  nombre: string;
  telefono: string;
  email: string;
  inmuebleId: string;
  fechaDeseada: string;
  horaDeseada: string;
  mensaje: string;
}

// --- CONSTANTES ---

const API_BASE = '/api';

const INITIAL_FORM: CitaFormData = {
  nombre: '',
  telefono: '',
  email: '',
  inmuebleId: '',
  fechaDeseada: '',
  horaDeseada: '',
  mensaje: '',
};

// --- HELPERS ---

const normalizePhone = (v: string): string =>
  v.trim().replace(/[\s\-()]/g, '');

const validatePhone = (raw: string): boolean => {
  const v = normalizePhone(raw);
  return /^(\+34)?[6789]\d{8}$/.test(v);
};

const validateEmail = (v: string): boolean => {
  if (!v.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
};

const getMinDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getApiError = async (res: Response): Promise<string> => {
  const ct = res.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const d = await res.json();
      return d?.error || d?.message || 'Error desconocido.';
    }
    return (await res.text()) || 'Error desconocido.';
  } catch {
    return 'No se pudo leer la respuesta del servidor.';
  }
};

// --- COMPONENTE ---

const CitaAnonima: React.FC = () => {
  const [paso, setPaso] = useState<Paso>('datos');
  const [formData, setFormData] = useState<CitaFormData>(INITIAL_FORM);
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // --- PASO 1: Validar datos y enviar código ---

  const validateDatos = (): string | null => {
    if (!formData.nombre.trim()) return 'El nombre es obligatorio.';
    if (!normalizePhone(formData.telefono)) return 'El teléfono es obligatorio.';
    if (!validatePhone(formData.telefono)) return 'Formato de teléfono no válido.';
    if (!validateEmail(formData.email)) return 'Formato de email no válido.';
    if (!formData.fechaDeseada) return 'La fecha es obligatoria.';
    if (!formData.horaDeseada) return 'La hora es obligatoria.';

    const fechaHora = new Date(`${formData.fechaDeseada}T${formData.horaDeseada}`);
    if (fechaHora <= new Date()) return 'La fecha y hora deben ser futuras.';

    return null;
  };

  const handleEnviarCodigo = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const err = validateDatos();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/citas/verificar-telefono`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefono: normalizePhone(formData.telefono) }),
      });

      if (!res.ok) {
        const msg = await getApiError(res);
        setError(msg);
        return;
      }

      setPaso('verificacion');
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // --- PASO 2: Verificar código y crear cita ---

  const handleVerificarYCrear = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!codigoVerificacion.trim()) {
      setError('Introduce el código de verificación.');
      return;
    }

    if (codigoVerificacion.trim().length !== 6) {
      setError('El código debe tener 6 dígitos.');
      return;
    }

    setLoading(true);

    const fechaHoraISO = `${formData.fechaDeseada}T${formData.horaDeseada}:00`;

    const payload = {
      nombre: formData.nombre.trim(),
      telefono: normalizePhone(formData.telefono),
      email: formData.email.trim() ? formData.email.trim().toLowerCase() : null,
      codigoVerificacion: codigoVerificacion.trim(),
      inmuebleId: formData.inmuebleId ? Number(formData.inmuebleId) : null,
      fechaHoraDeseada: fechaHoraISO,
      mensaje: formData.mensaje.trim() || null,
    };

    try {
      const res = await fetch(`${API_BASE}/citas/anonima`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await getApiError(res);
        setError(msg);
        return;
      }

      const data = await res.json();
      setSuccessMsg(data.message || 'Cita solicitada correctamente.');
      setPaso('exito');
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  return (
    <main data-header-transparent data-footer-hidden>
      <Link to="/" className="btn--ghost">
        <i className="fas fa-arrow-left"></i> Volver
      </Link>

      <div className="onboarding-container">
        <header className="onboarding-header">
          <h2>Solicitar una cita</h2>
          <p>
            {paso === 'datos' && 'Rellena tus datos y te enviaremos un código de verificación.'}
            {paso === 'verificacion' && 'Introduce el código que hemos enviado a tu teléfono.'}
            {paso === 'exito' && '¡Todo listo!'}
          </p>
        </header>

        {/* PASO 1: DATOS */}
        {paso === 'datos' && (
          <form onSubmit={handleEnviarCodigo} className="onboarding-form" noValidate>
            <fieldset>
              <legend>Tus datos</legend>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    autoComplete="given-name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefono">Teléfono *</label>
                  <input
                    id="telefono"
                    type="tel"
                    name="telefono"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="600 000 000"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email (opcional)</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="inmuebleId">Referencia del inmueble (opcional)</label>
                  <input
                    id="inmuebleId"
                    type="text"
                    name="inmuebleId"
                    value={formData.inmuebleId}
                    onChange={handleChange}
                    placeholder="Dejar vacío para cita en oficina"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Fecha y hora deseadas</legend>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fechaDeseada">Fecha *</label>
                  <input
                    id="fechaDeseada"
                    type="date"
                    name="fechaDeseada"
                    required
                    min={getMinDate()}
                    value={formData.fechaDeseada}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="horaDeseada">Hora *</label>
                  <input
                    id="horaDeseada"
                    type="time"
                    name="horaDeseada"
                    required
                    min="09:00"
                    max="20:00"
                    value={formData.horaDeseada}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </fieldset>

            <div className="form-group">
              <label htmlFor="mensaje">Mensaje (opcional)</label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                placeholder="Cuéntanos qué necesitas..."
              />
            </div>

            {error && (
              <div className="form-group">
                <p>{error}</p>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enviando código...' : 'Verificar teléfono y continuar'}
            </button>
          </form>
        )}

        {/* PASO 2: VERIFICACIÓN */}
        {paso === 'verificacion' && (
          <form onSubmit={handleVerificarYCrear} className="onboarding-form" noValidate>
            <fieldset>
              <legend>Verificación</legend>
              <p>
                Hemos enviado un código de 6 dígitos al teléfono{' '}
                <strong>{formData.telefono}</strong>.
              </p>

              <div className="form-group">
                <label htmlFor="codigoVerificacion">Código de verificación *</label>
                <input
                  id="codigoVerificacion"
                  type="text"
                  maxLength={6}
                  value={codigoVerificacion}
                  onChange={(e) => {
                    setCodigoVerificacion(e.target.value.replace(/\D/g, ''));
                    if (error) setError('');
                  }}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>
            </fieldset>

            {error && (
              <div className="form-group">
                <p>{error}</p>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Confirmando...' : 'Confirmar cita'}
            </button>

            <button
              type="button"
              className="btn--ghost"
              onClick={() => {
                setPaso('datos');
                setCodigoVerificacion('');
                setError('');
              }}
            >
              Volver a los datos
            </button>
          </form>
        )}

        {/* PASO 3: ÉXITO */}
        {paso === 'exito' && (
          <div className="onboarding-form">
            <p>{successMsg}</p>
            <Link to="/" className="btn-submit">
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default CitaAnonima;