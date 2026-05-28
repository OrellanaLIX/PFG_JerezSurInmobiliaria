import { useState } from 'react';
import type { NuevoInmueble, TipoInmueble } from '../../../types/inmueble';
import '../../../styles/App.scss';

interface Props {
  onCrear: (inmueble: NuevoInmueble) => Promise<void>;
  onCancelar: () => void;
  error?: string | null;
}

export const FormInmuebleModal = ({ onCrear, onCancelar, error: externalError }: Props) => {
  const [form, setForm] = useState<NuevoInmueble>({
    referencia: '',
    titulo: '',
    precio: 0,
    operacion: 'VENTA',
    estado: 'DISPONIBLE',
    tipo: 'PISO',
    superficieUtil: 0,
    mConstruidos: 0,
    habitaciones: 1,
    banos: 1,
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    descripcion: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validarFormulario = (): string | null => {
    if (!form.referencia?.trim()) return 'La referencia es obligatoria';
    if (!form.titulo?.trim()) return 'El título es obligatorio';
    if (form.precio <= 0) return 'El precio debe ser mayor a 0';
    if (!form.direccion?.trim()) return 'La dirección es obligatoria';
    if (!form.codigoPostal?.trim()) return 'El código postal es obligatorio';
    if (!form.ciudad?.trim()) return 'La ciudad es obligatoria';
    if (!form.habitaciones || form.habitaciones < 1) return 'Las habitaciones deben ser al menos 1';
    if (!form.banos || form.banos < 1) return 'Los baños deben ser al menos 1';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validar
    const validationError = validarFormulario();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setGuardando(true);
    try {
      await onCrear(form);
      onCancelar(); // Cerrar después de éxito
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setLocalError(message);
    } finally {
      setGuardando(false);
    }
  };

  const displayError = localError || externalError;

  return (
    <div className="form-modal show">
      <form onSubmit={handleSubmit} className="form-modal__content">
        
        <div className="form-modal__header">
          <h2>Alta de Inmueble</h2>
          <button type="button" onClick={onCancelar} className="btn">✕</button>
        </div>

        {displayError && (
          <div style={{
            margin: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            fontSize: '0.9rem'
          }}>
            {displayError}
          </div>
        )}

        <div className="form-modal__body">
          <p className="section-title">Datos Comerciales</p>
          
          <div className="form-row">
            <Field label="Título Comercial *">
              <input 
                type="text" 
                placeholder="ej: Piso luminoso en el centro" 
                required 
                value={form.titulo} 
                onChange={e => setForm({...form, titulo: e.target.value})} 
              />
            </Field>
          </div>

          <div className="form-row">
            <Field label="Precio (€) *">
              <input 
                type="number" 
                placeholder="0" 
                required 
                value={form.precio || ''} 
                onChange={e => setForm({...form, precio: Number(e.target.value)})} 
              />
            </Field>
            <Field label="Estado">
              <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value as any})}>
                <option value="DISPONIBLE">DISPONIBLE</option>
                <option value="VENDIDO">VENDIDO</option>
                <option value="RESERVADO">RESERVADO</option>
              </select>
            </Field>
            <Field label="Operación">
              <select value={form.operacion} onChange={e => setForm({...form, operacion: e.target.value as any})}>
                <option value="VENTA">VENTA</option>
                <option value="ALQUILER">ALQUILER</option>
                <option value="CUALQUIERA">CUALQUIERA (Venta o Alquiler)</option>
              </select>
            </Field>
            <Field label="Tipo de Inmueble">
              <select value={form.tipo || 'PISO'} onChange={e => setForm({...form, tipo: e.target.value as TipoInmueble})}>
                <option value="PISO">Piso</option>
                <option value="CASA">Casa</option>
                <option value="CHALET">Chalet</option>
                <option value="ADOSADO">Adosado</option>
                <option value="APARTAMENTO">Apartamento</option>
                <option value="ESTUDIO">Estudio</option>
                <option value="DUPLEX">Dúplex</option>
                <option value="ATICO">Ático</option>
                <option value="LOCAL_COMERCIAL">Local Comercial</option>
                <option value="OFICINA">Oficina</option>
                <option value="GARAJE">Garaje</option>
                <option value="TRASTERO">Trastero</option>
                <option value="TERRENO">Terreno</option>
                <option value="NAVE_INDUSTRIAL">Nave Industrial</option>
                <option value="FINCA">Finca</option>
              </select>
            </Field>
          </div>

          <p className="section-title">Características del Inmueble</p>
          
          <div className="form-row">
            <Field label="M² Útiles">
              <input 
                type="number" 
                placeholder="0" 
                value={form.superficieUtil || ''} 
                onChange={e => setForm({...form, superficieUtil: Number(e.target.value)})} 
              />
            </Field>
            <Field label="M² Const.">
              <input 
                type="number" 
                placeholder="0" 
                value={form.mConstruidos || ''} 
                onChange={e => setForm({...form, mConstruidos: Number(e.target.value)})} 
              />
            </Field>
            <Field label="Habitaciones">
              <input 
                type="number" 
                min={1} 
                value={form.habitaciones} 
                onChange={e => setForm({...form, habitaciones: Number(e.target.value)})} 
              />
            </Field>
            <Field label="Baños">
              <input 
                type="number" 
                min={1} 
                value={form.banos} 
                onChange={e => setForm({...form, banos: Number(e.target.value)})} 
              />
            </Field>
          </div>

          <p className="section-title">Ubicación</p>
          
          <Field label="Dirección *">
            <input 
              type="text" 
              placeholder="Calle, Número, Planta..." 
              required 
              value={form.direccion} 
              onChange={e => setForm({...form, direccion: e.target.value})} 
            />
          </Field>

          <div className="form-row">
            <Field label="Código Postal *">
              <input 
                type="text" 
                placeholder="11405" 
                required 
                value={form.codigoPostal} 
                onChange={e => setForm({...form, codigoPostal: e.target.value})} 
              />
            </Field>
            <Field label="Ciudad *">
              <input 
                type="text" 
                placeholder="Jerez de la Frontera" 
                required 
                value={form.ciudad} 
                onChange={e => setForm({...form, ciudad: e.target.value})}
              />
            </Field>
          </div>

          <p className="section-title">Información Adicional</p>
          <Field label="Descripción de la propiedad">
            <textarea 
              placeholder="Detalles sobre calidades, orientación, extras..." 
              value={form.descripcion} 
              onChange={e => setForm({...form, descripcion: e.target.value})} 
              className="textarea-large"
              rows={4}
            />
          </Field>
        </div>

        <div className="form-modal__footer">
          <button type="button" onClick={onCancelar} className="btn" disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary">
            {guardando ? '⏳ Guardando...' : '+ Dar de Alta'}
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