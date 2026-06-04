// Formulario para crear una nueva cita desde el panel de administración.
// El trabajador introduce los datos del cliente y selecciona el inmueble de la lista.
import { type FormEvent, type ReactNode, useState } from 'react';
import type { NuevaCita } from '../../../types/cita';
import SearchableEntitySelect from '../../ui/SearchableEntitySelect';
import '../../../styles/App.scss';

interface FormCitaModalProps {
  fechaInicial?: Date;
  onCrear: (cita: NuevaCita) => Promise<void>;
  onCancelar: () => void;
}

// Convierte un inmueble del backend en la opción que muestra el SearchableEntitySelect
const mapInmueble = (item: any) => ({
  id: item.id,
  label: item.titulo || item.referencia || `Inmueble #${item.id}`,
  sublabel: [item.zona, item.ciudad].filter(Boolean).join(', ') +
            (item.precio ? ` · ${new Intl.NumberFormat('es-ES').format(item.precio)} €` : ''),
  badge: item.operacion === 'ALQUILER' ? 'Alquiler' : 'Venta',
  badgeColor: item.operacion === 'ALQUILER' ? 'green' : 'blue',
  imageUrl: item.imagenPortadaUrl ?? undefined,
});

export const FormCitaModal = ({ fechaInicial, onCrear, onCancelar }: FormCitaModalProps) => {
  const [telefono, setTelefono]     = useState('');
  const [nombre, setNombre]         = useState('');
  const [email, setEmail]           = useState('');
  const [fecha, setFecha]           = useState(
    (fechaInicial ?? new Date()).toISOString().split('T')[0]
  );
  const [hora, setHora]             = useState('10:00');
  const [motivo, setMotivo]         = useState('');
  const [inmuebleId, setInmuebleId] = useState<number | null>(null);
  const [enviando, setEnviando]     = useState(false);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!telefono.trim() || !nombre.trim()) {
      setErrorMsg('Nombre y teléfono son obligatorios');
      return;
    }

    setEnviando(true);
    setErrorMsg(null);

    try {
      const nueva: NuevaCita = {
        telefono:   telefono.trim(),
        nombre:     nombre.trim(),
        email:      email.trim() || undefined,
        fechaHora:  `${fecha}T${hora}:00`,
        motivo:     motivo.trim() || undefined,
        inmuebleId: inmuebleId ?? undefined,
      };

      await onCrear(nueva);
      onCancelar();
    } catch {
      setErrorMsg('Error al crear la cita');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="form-modal show">
      <form onSubmit={handleSubmit} className="form-modal__content">

        <div className="form-modal__header">
          <div>
            <h2>Nueva cita</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
              Rellena los datos del cliente y la fecha de la visita
            </p>
          </div>
          <button type="button" onClick={onCancelar} className="btn" aria-label="Cerrar modal">✕</button>
        </div>

        <div className="form-modal__body">

          {/* ── DATOS DEL CLIENTE ── */}
          <p className="section-title">Datos del cliente</p>
          <div className="form-row">
            <Field label="Nombre *">
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                required
              />
            </Field>
            <Field label="Teléfono *">
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="666 123 456"
                required
              />
            </Field>
          </div>
          <Field label="Email (opcional)">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="juan@ejemplo.com"
            />
          </Field>

          {/* ── INMUEBLE A VISITAR ── */}
          <p className="section-title" style={{ marginTop: '1rem' }}>Inmueble a visitar</p>
          <SearchableEntitySelect
            label="Inmueble"
            placeholder="Buscar inmueble por título o referencia..."
            endpoint="/inmuebles"
            mapOption={mapInmueble}
            value={inmuebleId}
            onChange={id => setInmuebleId(id)}
            queryParams={{ estado: 'DISPONIBLE', size: '10' }}
            helpText="Deja vacío si la cita es en la oficina sin inmueble específico"
          />

          {/* ── FECHA Y HORA ── */}
          <p className="section-title" style={{ marginTop: '1rem' }}>Fecha y hora</p>
          <div className="form-row">
            <Field label="Fecha *">
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                required
              />
            </Field>
            <Field label="Hora *">
              <input
                type="time"
                value={hora}
                min="08:00"
                max="21:00"
                onChange={e => setHora(e.target.value)}
                required
              />
            </Field>
          </div>

          {/* ── NOTAS ── */}
          <p className="section-title" style={{ marginTop: '1rem' }}>Notas adicionales</p>
          <Field label="Motivo / Observaciones">
            <textarea
              className="textarea-large"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Peticiones especiales, preferencias del cliente..."
              rows={3}
            />
          </Field>

          {errorMsg && (
            <p className="error-text" role="alert" style={{ marginTop: '0.75rem' }}>
              ⚠ {errorMsg}
            </p>
          )}
        </div>

        <div className="form-modal__footer">
          <button type="button" onClick={onCancelar} className="btn">Cancelar</button>
          <button type="submit" disabled={enviando} className="btn btn-primary">
            {enviando ? 'Creando cita...' : 'Crear cita'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="form-group">
    <label>{label}</label>
    {children}
  </div>
);
