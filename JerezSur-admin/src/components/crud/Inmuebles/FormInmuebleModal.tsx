import { useState } from 'react';
import type { NuevoInmueble } from '../../../types/inmueble';

interface Props {
  onCrear: (inmueble: NuevoInmueble) => Promise<void>;
  onCancelar: () => void;
}

export const FormInmuebleModal = ({ onCrear, onCancelar }: Props) => {
  const [form, setForm] = useState<NuevoInmueble>({
    referencia: '',
    titulo: '',
    precio: 0,
    operacion: 'VENTA',
    estado: 'DISPONIBLE',
    superficieUtil: 0,
    mConstruidos: 0,
    habitaciones: 1,
    banos: 1,
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    descripcion: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.referencia || !form.titulo || form.precio <= 0) return alert('Por favor, rellene los campos obligatorios');
    await onCrear(form);
    onCancelar();
  };

  return (
    <div className="form-modal">
      <div className="form-modal__backdrop" onClick={onCancelar} />
      <form onSubmit={handleSubmit} className="form-modal__content" onClick={(e) => e.stopPropagation()}>
        <h3>Alta de Inmueble</h3>

        <div className="form-group">
          <input type="text" placeholder="Código Referencia (ej: P-101) *" required value={form.referencia} onChange={e => setForm({...form, referencia: e.target.value})} />
          <input type="text" placeholder="Título Comercial *" required value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
          <input type="number" placeholder="Precio (€) *" required value={form.precio || ''} onChange={e => setForm({...form, precio: Number(e.target.value)})} />

          <label>Operación:</label>
          <select value={form.operacion} onChange={e => setForm({...form, operacion: e.target.value as any})}>
            <option value="VENTA">VENTA</option>
            <option value="ALQUILER">ALQUILER</option>
            <option value="AMBOS">AMBOS (Venta o Alquiler)</option>
          </select>

          <div className="form-row">
            <input type="number" placeholder="M² Útiles" value={form.superficieUtil || ''} onChange={e => setForm({...form, superficieUtil: Number(e.target.value)})} />
            <input type="number" placeholder="M² Const." value={form.mConstruidos || ''} onChange={e => setForm({...form, mConstruidos: Number(e.target.value)})} />
          </div>

          <div className="form-row">
            <input type="number" placeholder="Habitaciones" min={1} value={form.habitaciones} onChange={e => setForm({...form, habitaciones: Number(e.target.value)})} />
            <input type="number" placeholder="Baños" min={1} value={form.banos} onChange={e => setForm({...form, banos: Number(e.target.value)})} />
          </div>

          <input type="text" placeholder="Dirección *" required value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
          <input type="text" placeholder="Código Postal *" required value={form.codigoPostal} onChange={e => setForm({...form, codigoPostal: e.target.value})} />
          <input type="text" placeholder="Ciudad *" required value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} />
          <textarea placeholder="Descripción larga de la propiedad" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancelar} className="btn btn-ghost">Cancelar</button>
          <button type="submit" className="btn btn-primary">Dar de Alta</button>
        </div>
      </form>
    </div>
  );
};