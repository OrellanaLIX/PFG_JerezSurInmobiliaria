import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import type { NuevoInmueble, TipoInmueble } from '../../../types/inmueble';
import api from '../../../services/api';
import { useBodyScroll } from '../../../hooks/useBodyScroll';
import '../../../styles/App.scss';
import { Field, ArchivoUploader } from './_shared';
import PropietariosEditor from '../../ui/PropietariosEditor';

type Tab = 'datos' | 'propietarios' | 'archivos';

interface ArchivosPendientes {
  notaSimple?: File;
  certificadoEnergetico?: File;
  plano?: File;
  imagenes: File[];
}

interface Props {
  onCrear: (inmueble: NuevoInmueble) => Promise<any>;
  onCancelar: () => void;
  error?: string | null;
}

export const FormInmuebleModal = ({ onCrear, onCancelar, error: externalError }: Props) => {
  const [tab, setTab] = useState<Tab>('datos');

  useBodyScroll(true);

  const [form, setForm] = useState<NuevoInmueble>({
    titulo: '', precio: 0, operacion: 'VENTA', estado: 'DISPONIBLE',
    tipo: 'PISO', superficieUtil: 0, mConstruidos: 0, habitaciones: 1,
    banos: 1, direccion: '', zona: '', codigoPostal: '', ciudad: '',
    destacado: false, descripcion: '', comunidad: 0, ibi: 0,
    notasPrivadas: '', propietariosPorcentaje: {},
  });

  const [extrasEntries, setExtrasEntries] = useState<[string, string][]>([]);
  const addExtra = () => setExtrasEntries(prev => [...prev, ['', '']]);
  const removeExtra = (i: number) => setExtrasEntries(prev => prev.filter((_, idx) => idx !== i));
  const updateExtra = (i: number, field: 0 | 1, value: string) =>
    setExtrasEntries(prev => prev.map((e, idx) => idx === i ? (field === 0 ? [value, e[1]] : [e[0], value]) : e));

  const [propietariosPorcentaje, setPropietariosPorcentaje] = useState<Record<string, number>>({});
  const [archivos, setArchivos] = useState<ArchivosPendientes>({ imagenes: [] });
  const [previews, setPreviews] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refNotaSimple  = useRef<HTMLInputElement>(null);
  const refCertificado = useRef<HTMLInputElement>(null);
  const refPlano       = useRef<HTMLInputElement>(null);
  const refImagenes    = useRef<HTMLInputElement>(null);

  const handleImagenesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setArchivos(a => ({ ...a, imagenes: [...a.imagenes, ...files] }));
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
  };

  const quitarImagen = (idx: number) => {
    setArchivos(a => ({ ...a, imagenes: a.imagenes.filter((_, i) => i !== idx) }));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const validar = (): string | null => {
    if (!form.titulo?.trim()) return 'El título es obligatorio';
    if (form.titulo.trim().length < 10) return 'El título debe tener al menos 10 caracteres';
    if (form.precio <= 0) return 'El precio debe ser mayor a 0';
    if (!form.direccion?.trim()) return 'La dirección es obligatoria';
    if (!form.codigoPostal?.trim()) return 'El código postal es obligatorio';
    if (!form.ciudad?.trim()) return 'La ciudad es obligatoria';
    if (Object.keys(propietariosPorcentaje).length === 0)
      return 'Asigna al menos un propietario en la pestaña Propietarios';
    const suma = Object.values(propietariosPorcentaje).reduce((a, b) => a + b, 0);
    if (suma !== 100) return `Los porcentajes deben sumar 100%. Ahora suman ${suma}%`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    const err = validar();
    if (err) {
      setLocalError(err);
      setTab(err.includes('propietario') || err.includes('%') ? 'propietarios' : 'datos');
      return;
    }

    setGuardando(true);
    const toastId = toast.loading('⏳ Creando inmueble y subiendo archivos...');

    try {
      const caracteristicasExtra: Record<string, string> = {};
      extrasEntries.forEach(([k, v]) => { if (k.trim()) caracteristicasExtra[k.trim()] = v; });
      const payload = {
        ...form,
        propietariosPorcentaje,
        caracteristicasExtra: Object.keys(caracteristicasExtra).length > 0 ? caracteristicasExtra : undefined,
      } as NuevoInmueble;

      const created: any = await onCrear(payload);
      const inmuebleId = created?.id;
      if (!inmuebleId) throw new Error('No se pudo crear el inmueble (sin ID)');

      const uploadDocumento = async (file: File | undefined, tipo: string) => {
        if (!file) return;
        const fd = new FormData();
        fd.append('archivo', file);
        fd.append('tipo', tipo);
        await api.post(`/media/inmueble/${inmuebleId}/documento`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      };

      await Promise.all([
        uploadDocumento(archivos.notaSimple, 'nota_simple'),
        uploadDocumento(archivos.certificadoEnergetico, 'certificado_energetico'),
        uploadDocumento(archivos.plano, 'plano'),
      ]);

      for (let i = 0; i < archivos.imagenes.length; i++) {
        const fd = new FormData();
        fd.append('archivo', archivos.imagenes[i]);
        fd.append('esPortada', String(i === 0));
        await api.post(`/media/inmueble/${inmuebleId}/imagen`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.dismiss(toastId);
      setSuccessMessage('¡Inmueble creado y archivos subidos correctamente!');
      setTimeout(() => onCancelar(), 1400);
    } catch (err: any) {
      toast.dismiss(toastId);
      setLocalError(err?.response?.data?.message || err?.message || 'Error inesperado al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const displayError = localError || externalError;

  return (
    <div className="form-modal show">
      <form onSubmit={handleSubmit} className="form-modal__content" style={{ maxWidth: '750px' }}>

        <div className="form-modal__header">
          <h2>Alta de Inmueble</h2>
          <button type="button" onClick={onCancelar} className="btn" disabled={guardando}>✕</button>
        </div>

        <div className="tabs">
          <button type="button" onClick={() => setTab('datos')} className={`tab ${tab === 'datos' ? 'active' : ''}`}>
            Datos básicos
          </button>
          <button type="button" onClick={() => setTab('propietarios')} className={`tab ${tab === 'propietarios' ? 'active' : ''}`}>
            Propietarios
            {Object.keys(propietariosPorcentaje).length > 0 && (
              <span className="tab-badge">{Object.keys(propietariosPorcentaje).length}</span>
            )}
          </button>
          <button type="button" onClick={() => setTab('archivos')} className={`tab ${tab === 'archivos' ? 'active' : ''}`}>
            Archivos
            {(archivos.notaSimple || archivos.certificadoEnergetico || archivos.plano || archivos.imagenes.length > 0) && (
              <span className="tab-badge">
                {[archivos.notaSimple, archivos.certificadoEnergetico, archivos.plano].filter(Boolean).length + archivos.imagenes.length}
              </span>
            )}
          </button>
        </div>

        {displayError && <div className="feedback feedback--error">🛑 {displayError}</div>}
        {successMessage && <div className="feedback feedback--success">✅ {successMessage}</div>}

        <div className="form-modal__body">

          {/* ── DATOS BÁSICOS ── */}
          {tab === 'datos' && (
            <>
              <p className="section-title">Datos Comerciales</p>
              <Field label="Título Comercial *">
                <input type="text" placeholder="ej: Piso luminoso en el centro" required
                  value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
              </Field>
              <div className="form-row">
                <Field label="Precio (€) *">
                  <input type="number" placeholder="0" required value={form.precio || ''}
                    onChange={e => setForm({ ...form, precio: Number(e.target.value) })} />
                </Field>
                <Field label="Estado">
                  <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value as any })}>
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="RESERVADO">Reservado</option>
                    <option value="VENDIDO">Vendido</option>
                  </select>
                </Field>
                <Field label="Operación">
                  <select value={form.operacion} onChange={e => setForm({ ...form, operacion: e.target.value as any })}>
                    <option value="VENTA">Venta</option>
                    <option value="ALQUILER">Alquiler</option>
                    <option value="CUALQUIERA">Ambos</option>
                  </select>
                </Field>
                <Field label="Tipo">
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as TipoInmueble })}>
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

              <p className="section-title">Características Técnicas</p>
              <div className="form-row">
                <Field label="M² Útiles"><input type="number" value={form.superficieUtil || ''} onChange={e => setForm({ ...form, superficieUtil: Number(e.target.value) })} /></Field>
                <Field label="M² Const."><input type="number" value={form.mConstruidos || ''} onChange={e => setForm({ ...form, mConstruidos: Number(e.target.value) })} /></Field>
                <Field label="Habitaciones"><input type="number" min={1} value={form.habitaciones || ''} onChange={e => setForm({ ...form, habitaciones: Number(e.target.value) })} /></Field>
                <Field label="Baños"><input type="number" min={1} value={form.banos || ''} onChange={e => setForm({ ...form, banos: Number(e.target.value) })} /></Field>
              </div>

              <p className="section-title">Ubicación</p>
              <Field label="Dirección *">
                <input type="text" required value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
              </Field>
              <div className="form-row">
                <Field label="Código Postal *"><input type="text" required value={form.codigoPostal} onChange={e => setForm({ ...form, codigoPostal: e.target.value })} /></Field>
                <Field label="Ciudad *"><input type="text" required value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} /></Field>
                <Field label="Zona"><input type="text" placeholder="ej: Mopu, Chapín..." value={form.zona || ''} onChange={e => setForm({ ...form, zona: e.target.value })} /></Field>
              </div>

              <p className="section-title">Extras</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input type="checkbox" id="destacado" checked={form.destacado || false}
                  onChange={e => setForm({ ...form, destacado: e.target.checked })}
                  style={{ width: 'auto', cursor: 'pointer' }} />
                <label htmlFor="destacado" style={{ cursor: 'pointer', margin: 0 }}>
                  Inmueble destacado (aparecerá en portada)
                </label>
              </div>

              <p className="section-title">Características Adicionales</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {extrasEntries.map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="text" placeholder="Característica (ej: Piscina)" value={k}
                      onChange={e => updateExtra(i, 0, e.target.value)} style={{ flex: 1 }} />
                    <input type="text" placeholder="Valor (ej: Sí)" value={v}
                      onChange={e => updateExtra(i, 1, e.target.value)} style={{ flex: 1 }} />
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeExtra(i)}>✕</button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-ghost" onClick={addExtra} style={{ fontSize: '0.85rem' }}>
                + Añadir característica
              </button>

              <p className="section-title">Gastos y Cargas</p>
              <div className="form-row">
                <Field label="Comunidad (€/mes)"><input type="number" min={0} value={form.comunidad || ''} onChange={e => setForm({ ...form, comunidad: Number(e.target.value) })} /></Field>
                <Field label="IBI (€/año)"><input type="number" min={0} value={form.ibi || ''} onChange={e => setForm({ ...form, ibi: Number(e.target.value) })} /></Field>
              </div>

              <p className="section-title">Descripción</p>
              <Field label="Descripción pública">
                <textarea className="textarea-large" value={form.descripcion || ''}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción visible en el portal..." />
              </Field>
              <Field label="Notas privadas (solo personal interno)">
                <textarea className="textarea-large" value={form.notasPrivadas || ''}
                  onChange={e => setForm({ ...form, notasPrivadas: e.target.value })}
                  placeholder="Información interna no visible al cliente..." />
              </Field>
            </>
          )}

          {/* ── PROPIETARIOS ── */}
          {tab === 'propietarios' && (
            <>
              <p className="section-title">Asignación de Propietarios</p>
              <PropietariosEditor
                propietarios={propietariosPorcentaje}
                onChange={setPropietariosPorcentaje}
              />
            </>
          )}

          {/* ── ARCHIVOS ── */}
          {tab === 'archivos' && (
            <>
              <p className="section-title">Documentación Legal</p>
              <ArchivoUploader label="Nota Simple (PDF)" accept=".pdf"
                archivo={archivos.notaSimple} inputRef={refNotaSimple}
                onChange={f => setArchivos(a => ({ ...a, notaSimple: f }))} />
              <ArchivoUploader label="Certificado Energético (PDF)" accept=".pdf"
                archivo={archivos.certificadoEnergetico} inputRef={refCertificado}
                onChange={f => setArchivos(a => ({ ...a, certificadoEnergetico: f }))} />
              <ArchivoUploader label="Plano del Inmueble (PDF / imagen)" accept=".pdf,image/*"
                archivo={archivos.plano} inputRef={refPlano}
                onChange={f => setArchivos(a => ({ ...a, plano: f }))} />

              <p className="section-title" style={{ marginTop: '1.5rem' }}>Imágenes del Inmueble</p>
              <div className="dropzone" onClick={() => refImagenes.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                  setArchivos(a => ({ ...a, imagenes: [...a.imagenes, ...files] }));
                  setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
                }}>
                <span>Arrastra imágenes aquí o haz clic para seleccionar</span>
                <input ref={refImagenes} type="file" accept="image/*" multiple
                  style={{ display: 'none' }} onChange={handleImagenesChange} />
              </div>

              {previews.length > 0 && (
                <div className="imagenes-grid" style={{ marginTop: '1rem' }}>
                  {previews.map((src, idx) => (
                    <div className="imagen-card" key={idx}>
                      <img src={src} alt={`preview-${idx}`} />
                      <div className="imagen-card__meta">
                        <small>{archivos.imagenes[idx]?.name}</small>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => quitarImagen(idx)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="form-modal__footer">
          <button type="button" onClick={onCancelar} className="btn" disabled={guardando}>Cancelar</button>
          <button type="submit" disabled={guardando || !!successMessage} className="btn btn-primary">
            {guardando ? '⏳ Guardando...' : successMessage ? '✓ Guardado' : '+ Dar de Alta'}
          </button>
        </div>
      </form>
    </div>
  );
};
