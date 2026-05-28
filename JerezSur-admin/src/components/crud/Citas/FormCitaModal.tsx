import { useState } from 'react';
import type { NuevaCita } from '../../../types/cita';
import '../../../styles/App.scss';

interface FormCitaModalProps {
  fechaInicial?: Date;
  onCrear: (cita: NuevaCita) => Promise<void>;
  onCancelar: () => void;
}

export const FormCitaModal = ({ fechaInicial, onCrear, onCancelar }: FormCitaModalProps) => {
  const [telefono, setTelefono] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [fecha, setFecha] = useState(
    (fechaInicial ?? new Date()).toISOString().split('T')[0]
  );
  const [hora, setHora] = useState('10:00');
  const [motivo, setMotivo] = useState('');
  const [inmuebleId, setInmuebleId] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!telefono.trim() || !nombre.trim()) {
      setErrorMsg('Nombre y teléfono son obligatorios');
      return;
    }

    setEnviando(true);
    setErrorMsg(null);

    try {
      const fechaHoraISO = `${fecha}T${hora}:00`;
      const nueva: NuevaCita = {
        telefono: telefono.trim(),
        nombre: nombre.trim(),
        email: email.trim() || undefined,
        fechaHora: fechaHoraISO,
        motivo: motivo.trim() || undefined,
        inmuebleId: inmuebleId ? Number(inmuebleId) : undefined,
      };

      await onCrear(nueva);
      onCancelar(); 
    } catch (err) {
      setErrorMsg('Error al crear la cita');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="form-modal show">
      <form onSubmit={handleSubmit} className="form-modal__content">
        
        <div className="form-modal__header">
          <h2>Nueva cita</h2>
          <button type="button" onClick={onCancelar} className="btn">✕</button>
        </div>

        <div className="form-modal__body">
          <p className="section-title">Datos del Cliente</p>
          <div className="form-row">
            <Field label="Nombre del cliente *">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
              />
            </Field>
            <Field label="Teléfono *">
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="666123456"
                required
              />
            </Field>
          </div>

          <div className="form-row">
            <Field label="Email (opcional)">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
              />
            </Field>
            <Field label="Inmueble ID (opcional)">
              <input
                type="number"
                value={inmuebleId}
                onChange={(e) => setInmuebleId(e.target.value)}
                placeholder="Vacío si es en oficinas"
              />
            </Field>
          </div>

          <p className="section-title">Fecha y Horario</p>
          <div className="form-row">
            <Field label="Fecha *">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </Field>
            <Field label="Hora *">
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </Field>
          </div>

          <p className="section-title">Detalles adicionales</p>
          <Field label="Motivo / Notas">
            <textarea
              className="textarea-large"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Escribe aquí los detalles o peticiones de la cita..."
              rows={3}
            />
          </Field>

          {errorMsg && <p className="error-text" role="alert" style={{ marginTop: '1rem' }}>{errorMsg}</p>}
        </div>

        <div className="form-modal__footer">
          <button type="button" onClick={onCancelar} className="btn">
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="btn btn-primary">
            {enviando ? 'Creando...' : 'Crear cita'}
          </button>
        </div>

      </form>
    </div>
  );
};

// --- Helper de UI Reutilizable ---
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="form-group">
    <label>{label}</label>
    {children}
  </div>
);