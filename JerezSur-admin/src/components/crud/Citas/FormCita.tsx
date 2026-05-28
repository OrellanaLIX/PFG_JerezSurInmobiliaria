import { useState } from 'react';
import type { NuevaCita } from '../../../types/cita';

interface FormCitaProps {
  fechaInicial?: Date;
  onCrear: (cita: NuevaCita) => Promise<void>;
  onCancelar: () => void;
}
import '../../../styles/App.scss';

export const FormCita = ({ fechaInicial, onCrear, onCancelar }: FormCitaProps) => {
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
      onCancelar(); // cerrar el form al éxito
    } catch (err) {
      setErrorMsg('Error al crear la cita');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Nueva cita</h3>

      <label>
        Nombre del cliente *
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </label>

      <label>
        Teléfono *
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="666123456"
          required
        />
      </label>

      <label>
        Email (opcional)
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label>
        Fecha *
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </label>

      <label>
        Hora *
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
        />
      </label>

      <label>
        Inmueble (ID, opcional)
        <input
          type="number"
          value={inmuebleId}
          onChange={(e) => setInmuebleId(e.target.value)}
          placeholder="Dejar vacío si es en oficinas"
        />
      </label>

      <label>
        Motivo / Notas
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={3}
        />
      </label>

      {errorMsg && <p role="alert">{errorMsg}</p>}

      <div>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando...' : 'Crear cita'}
        </button>
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
};