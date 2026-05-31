import { useState } from 'react';
import type { NuevaOperacion } from '../../../types/operacion';
import '../../../styles/App.scss';

interface Props {
  onCrear: (operacion: NuevaOperacion) => Promise<void>;
  onCancelar: () => void;
}

type Tab = 'datos' | 'inmueble' | 'interesado';

export const FormOperacionModal = ({ onCrear, onCancelar }: Props) => {
  const [tab, setTab] = useState<Tab>('datos');
  const [form, setForm] = useState<NuevaOperacion>({
    categoria_operacion: 'VENTA',
    precioAcordado: 0,
    tipo: 'VENTA',
    inmuebleId: 0,
    interesadoId: 0,
    depositoArras: 0,
    fechaLimiteEscritura: '',
    incluyeMobiliario: false,
    fianza: 0,
    duracionMeses: 12,
    admiteMascotas: false
  });
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.precioAcordado <= 0) {
      setTab('datos');
      return alert('Debe indicar un precio acordado válido.');
    }
    if (!form.inmuebleId) {
      setTab('inmueble');
      return alert('Debes indicar el ID del inmueble.');
    }
    if (!form.interesadoId) {
      setTab('interesado');
      return alert('Debes indicar el ID del interesado.');
    }

    if (form.categoria_operacion === 'VENTA' && (!form.depositoArras || !form.fechaLimiteEscritura)) {
      setTab('datos');
      return alert('Para ventas, añade depósito de arras y fecha límite de escritura.');
    }

    if (form.categoria_operacion === 'ALQUILER' && !form.fianza) {
      setTab('datos');
      return alert('Para alquileres, indica una fianza válida.');
    }

    setGuardando(true);
    try {
      await onCrear(form);
      onCancelar();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="form-modal show">
      <form onSubmit={handleSubmit} className="form-modal__content">
        
        <div className="form-modal__header">
          <h2>Apertura de Expediente</h2>
          <button type="button" onClick={onCancelar} className="btn">✕</button>
        </div>

        <div className="form-modal__body">
          <div className="tabs" role="tablist">
            <button type="button" onClick={() => setTab('datos')} className={`tab ${tab === 'datos' ? 'active' : ''}`}>
              🔎 Datos de Operación
            </button>
            <button type="button" onClick={() => setTab('inmueble')} className={`tab ${tab === 'inmueble' ? 'active' : ''}`}>
              🏠 Inmueble
            </button>
            <button type="button" onClick={() => setTab('interesado')} className={`tab ${tab === 'interesado' ? 'active' : ''}`}>
              💼 Interesado
            </button>
          </div>

          {tab === 'datos' && (
            <>
              <p className="section-title">Clasificación y Precio</p>
              <div className="form-row">
                <Field label="Categoría Legal">
                  <select 
                    value={form.categoria_operacion} 
                    onChange={e => setForm({...form, categoria_operacion: e.target.value as any, tipo: e.target.value as any})}
                  >
                    <option value="VENTA">COMPRAVENTA</option>
                    <option value="ALQUILER">ARRENDAMIENTO (ALQUILER)</option>
                  </select>
                </Field>
                <Field label="Precio Acordado (€) *">
                  <input 
                    type="number" 
                    placeholder="0" 
                    required 
                    value={form.precioAcordado || ''} 
                    onChange={e => setForm({...form, precioAcordado: Number(e.target.value)})} 
                  />
                </Field>
              </div>

              <p className="section-title">Condiciones de {form.categoria_operacion === 'VENTA' ? 'Compraventa' : 'Arrendamiento'}</p>
              {form.categoria_operacion === 'VENTA' ? (
                <>
                  <div className="form-row">
                    <Field label="Depósito de Arras (€) *">
                      <input
                        type="number"
                        placeholder="0"
                        required
                        value={form.depositoArras || ''}
                        onChange={e => setForm({ ...form, depositoArras: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Fecha límite de escritura *">
                      <input
                        type="date"
                        required
                        value={form.fechaLimiteEscritura}
                        onChange={e => setForm({ ...form, fechaLimiteEscritura: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="form-row" style={{ marginTop: '0.5rem' }}>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.incluyeMobiliario}
                        onChange={e => setForm({ ...form, incluyeMobiliario: e.target.checked })}
                      />
                      <span>La operación incluye el mobiliario existente</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <Field label="Fianza (€) *">
                      <input
                        type="number"
                        placeholder="0"
                        required
                        value={form.fianza || ''}
                        onChange={e => setForm({ ...form, fianza: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Duración del contrato (meses)">
                      <input
                        type="number"
                        placeholder="12"
                        value={form.duracionMeses || ''}
                        onChange={e => setForm({ ...form, duracionMeses: Number(e.target.value) })}
                      />
                    </Field>
                  </div>
                  <div className="form-row" style={{ marginTop: '0.5rem' }}>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.admiteMascotas}
                        onChange={e => setForm({ ...form, admiteMascotas: e.target.checked })}
                      />
                      <span>El propietario admite mascotas en la vivienda</span>
                    </label>
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'inmueble' && (
            <>
              <p className="section-title">Datos del Inmueble</p>
              <div className="form-row">
                <Field label="ID del Inmueble *">
                  <input 
                    type="number" 
                    placeholder="Ej: 42" 
                    required 
                    value={form.inmuebleId || ''} 
                    onChange={e => setForm({...form, inmuebleId: Number(e.target.value)})} 
                  />
                </Field>
              </div>
              <p className="text-soft">Introduce el ID del inmueble que se va a vincular al expediente.</p>
            </>
          )}

          {tab === 'interesado' && (
            <>
              <p className="section-title">Datos del Interesado</p>
              <div className="form-row">
                <Field label="ID Cliente (Interesado) *">
                  <input 
                    type="number" 
                    placeholder="Ej: 251" 
                    required 
                    value={form.interesadoId || ''} 
                    onChange={e => setForm({...form, interesadoId: Number(e.target.value)})} 
                  />
                </Field>
              </div>
              <p className="text-soft">Introduce el ID del cliente que quiere adquirir o alquilar el inmueble.</p>
            </>
          )}
        </div>

        <div className="form-modal__footer">
          <button type="button" onClick={onCancelar} className="btn">
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? 'Generando...' : 'Generar Expediente'}
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