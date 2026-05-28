import { useState } from 'react';
import type { NuevaOperacion } from '../../../types/operacion';
import '../../../styles/App.scss';

interface Props {
  onCrear: (operacion: NuevaOperacion) => Promise<void>;
  onCancelar: () => void;
}

export const FormOperacionModal = ({ onCrear, onCancelar }: Props) => {
  const [form, setForm] = useState<NuevaOperacion>({
    categoria_operacion: 'VENTA',
    precioAcordado: 0,
    tipo: 'VENTA',
    inmuebleId: 0,
    vendedorId: 0,
    interesadoId: 0,
    depositoArras: 0,
    fechaLimiteEscritura: '',
    incluyeMobiliario: false,
    fianza: 0,
    duracionMeses: 12,
    admiteMascotas: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.precioAcordado <= 0 || !form.inmuebleId || !form.vendedorId || !form.interesadoId) {
      return alert('Debe rellenar todos los campos e ID de clientes.');
    }

    if (form.categoria_operacion === 'VENTA' && (!form.depositoArras || !form.fechaLimiteEscritura)) {
      return alert('Para operaciones de venta, añade un depósito de arras y fecha límite de escritura.');
    }

    if (form.categoria_operacion === 'ALQUILER' && !form.fianza) {
      return alert('Para operaciones de alquiler, indica una fianza válida.');
    }

    await onCrear(form);
    onCancelar();
  };

  return (
    <div className="form-modal">
      <div className="form-modal__backdrop" onClick={onCancelar} />
      <form onSubmit={handleSubmit} className="form-modal__content" onClick={(e) => e.stopPropagation()}>
        <h3>Apertura de Expediente de Contrato</h3>

        <div className="form-group">
          <label>Categoría Legal (Discriminador Backend):</label>
          <select 
            value={form.categoria_operacion} 
            onChange={e => setForm({...form, categoria_operacion: e.target.value as any, tipo: e.target.value as any})}
          >
            <option value="VENTA">COMPRAVENTA</option>
            <option value="ALQUILER">ARRENDAMIENTO (ALQUILER)</option>
          </select>

          <input 
            type="number" 
            placeholder="Precio Acordado (€) *" 
            required 
            value={form.precioAcordado || ''} 
            onChange={e => setForm({...form, precioAcordado: Number(e.target.value)})} 
          />
          
          <input 
            type="number" 
            placeholder="ID del Inmueble *" 
            required 
            value={form.inmuebleId || ''} 
            onChange={e => setForm({...form, inmuebleId: Number(e.target.value)})} 
          />

          <input 
            type="number" 
            placeholder="ID Propietario (Vendedor) *" 
            required 
            value={form.vendedorId || ''} 
            onChange={e => setForm({...form, vendedorId: Number(e.target.value)})} 
          />

          <input 
            type="number" 
            placeholder="ID Cliente (Interesado) *" 
            required 
            value={form.interesadoId || ''} 
            onChange={e => setForm({...form, interesadoId: Number(e.target.value)})} 
          />

          {form.categoria_operacion === 'VENTA' ? (
            <>
              <input
                type="number"
                placeholder="Depósito de Arras (€) *"
                required
                value={form.depositoArras || ''}
                onChange={e => setForm({ ...form, depositoArras: Number(e.target.value) })}
              />
              <label>Fecha límite de escritura *</label>
              <input
                type="date"
                value={form.fechaLimiteEscritura}
                onChange={e => setForm({ ...form, fechaLimiteEscritura: e.target.value })}
              />
              <label>
                <input
                  type="checkbox"
                  checked={form.incluyeMobiliario}
                  onChange={e => setForm({ ...form, incluyeMobiliario: e.target.checked })}
                /> Incluye mobiliario
              </label>
            </>
          ) : (
            <>
              <input
                type="number"
                placeholder="Fianza (€) *"
                required
                value={form.fianza || ''}
                onChange={e => setForm({ ...form, fianza: Number(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Duración en meses"
                value={form.duracionMeses || ''}
                onChange={e => setForm({ ...form, duracionMeses: Number(e.target.value) })}
              />
              <label>
                <input
                  type="checkbox"
                  checked={form.admiteMascotas}
                  onChange={e => setForm({ ...form, admiteMascotas: e.target.checked })}
                /> Admite mascotas
              </label>
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancelar} className="btn btn-ghost">Cancelar</button>
          <button type="submit" className="btn btn-primary">Generar Expediente</button>
        </div>
      </form>
    </div>
  );
};