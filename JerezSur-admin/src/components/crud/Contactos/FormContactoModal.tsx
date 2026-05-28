import { useState } from 'react';
import type { NuevoMensajeContacto } from '../../../types/contacto';
import '../../../styles/App.scss';

interface Props {
  onCrear: (contacto: NuevoMensajeContacto) => Promise<void>;
  onCancelar: () => void;
}

export const FormContactoModal = ({ onCrear, onCancelar }: Props) => {
  const [form, setForm] = useState<NuevoMensajeContacto>({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
    inmuebleId: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.mensaje) return alert('Por favor, rellene los campos obligatorios.');
    await onCrear(form);
    onCancelar();
  };

  return (
    <div className="form-modal">
      <div className="form-modal__backdrop" onClick={onCancelar} />
      <form onSubmit={handleSubmit} className="form-modal__content" onClick={(e) => e.stopPropagation()}>
        <h3>Registrar Entrada Manual (Lead de llamada/oficina)</h3>

        <div className="form-group">
          <input type="text" placeholder="Nombre completo del cliente *" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
          <input type="email" placeholder="Email de contacto *" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input type="tel" placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />

          <input 
            type="number" 
            placeholder="ID Inmueble de interés (Opcional)" 
            value={form.inmuebleId || ''} 
            onChange={e => setForm({...form, inmuebleId: e.target.value ? Number(e.target.value) : undefined})} 
          />

          <textarea 
            placeholder="Escribe las notas o dudas planteadas por el cliente... *" 
            required 
            value={form.mensaje} 
            onChange={e => setForm({...form, mensaje: e.target.value})}
            className="textarea-large"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
          <button type="submit" className="btn btn-primary">Guardar Mensaje</button>
        </div>
      </form>
    </div>
  );
};