import { useState } from 'react';
import type { NuevoMensajeContacto } from '../../../types/contacto';

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
    <div className="modal-backdrop" style={{ background: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '400px' }}>
        <h3>Registrar Entrada Manual (Lead de llamada/oficina)</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '15px 0' }}>
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
            style={{ height: '100px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button type="button" onClick={onCancelar}>Cancelar</button>
          <button type="submit" style={{ background: '#007bff', color: '#fff' }}>Guardar Mensaje</button>
        </div>
      </form>
    </div>
  );
};