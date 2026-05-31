import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import type { NuevoInmueble, TipoInmueble } from '../../../types/inmueble';
import type { Vendedor } from '../../../types/vendedor';
import api from '../../../services/api';
import '../../../styles/App.scss';
import { Field, ArchivoUploader } from './_shared';

type Tab = 'datos' | 'propietarios' | 'archivos';

interface ArchivosPendientes {
  notaSimple?: File;
  certificadoEnergetico?: File;
  plano?: File;
  imagenes: File[];
}

// ✅ Corregida la falta de definición de las Props obligatorias
interface Props {
  onCrear: (inmueble: NuevoInmueble) => Promise<any>;
  onCancelar: () => void;
  error?: string | null;
}

export const FormInmuebleModal = ({ onCrear, onCancelar, error: externalError }: Props) => {
  const [tab, setTab] = useState<Tab>('datos');
  
  // ✅ Refactorizado el estado inicial eliminando la necesidad de hacer "as any" más adelante
  const [form, setForm] = useState<NuevoInmueble>({
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
    zona: '',
    codigoPostal: '',
    ciudad: '',
    destacado: false,
    descripcion: '',
    comunidad: 0,
    ibi: 0,
    notasPrivadas: '',
    propietariosPorcentaje: {},
  });

  // Propietarios
  const [propietariosPorcentaje, setPropietariosPorcentaje] = useState<Record<string, number>>({});
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [cargandoVendedores, setCargandoVendedores] = useState(false);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const TAMANO_PAGINA = 5;

  // Archivos
  const [archivos, setArchivos] = useState<ArchivosPendientes>({ imagenes: [] });
  const [previews, setPreviews] = useState<string[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Refs para inputs de archivo
  const refNotaSimple = useRef<HTMLInputElement>(null);
  const refCertificado = useRef<HTMLInputElement>(null);
  const refPlano = useRef<HTMLInputElement>(null);
  const refImagenes = useRef<HTMLInputElement>(null);

  // ✅ Corregida la query del Fetch: ahora "filtroBusqueda" se envía al Backend
  useEffect(() => {
    if (tab !== 'propietarios') return;
    const cargar = async () => {
      setCargandoVendedores(true);
      try {
        const token = localStorage.getItem('token');
        const url = `http://localhost:8080/api/vendedores?page=${paginaActual}&size=${TAMANO_PAGINA}&search=${encodeURIComponent(filtroBusqueda)}&sortBy=id&sortDir=asc`;
        const res = await fetch(url, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setVendedores(data.content || []);
        setTotalPaginas(data.totalPages || 0);
      } catch {
        toast.error('Error al cargar los vendedores.');
      } finally {
        setCargandoVendedores(false);
      }
    };
    cargar();
  }, [tab, paginaActual, filtroBusqueda]);

  const handleImagenesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setArchivos(a => ({ ...a, imagenes: [...a.imagenes, ...files] }));
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(p => [...p, ...urls]);
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
      if (err.includes('propietario') || err.includes('%')) setTab('propietarios');
      else setTab('datos');
      return;
    }

    setGuardando(true);
    const toastId = toast.loading('⏳ Creando inmueble y subiendo archivos...');

    try {
      // 1. Crear el inmueble primero (sin archivos) para obtener id y referencia
      const payload = {
        ...form,
        propietariosPorcentaje,
      } as NuevoInmueble;

      const created: any = await onCrear(payload); // devuelve el inmueble creado desde el hook
      const inmuebleId = created?.id;
      if (!inmuebleId) throw new Error('No se pudo crear el inmueble (sin ID)');

      // 2. Subir documentos al backend (/api/media/inmueble/{id}/documento)
      const uploadDocumento = async (file: File | undefined, tipo: string) => {
        if (!file) return undefined;
        const fd = new FormData();
        fd.append('archivo', file);
        fd.append('tipo', tipo);
        const res = await api.post(`/media/inmueble/${inmuebleId}/documento`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data?.url as string | undefined;
      };

      const urlNotaSimple = await uploadDocumento(archivos.notaSimple, 'nota_simple');
      const urlCertificadoEnergetico = await uploadDocumento(archivos.certificadoEnergetico, 'certificado_energetico');
      const urlPlanoInmueble = await uploadDocumento(archivos.plano, 'plano');

      // 3. Subir imágenes al backend (/api/media/inmueble/{id}/imagen)
      const uploadImagen = async (file: File, esPortada = false) => {
        const fd = new FormData();
        fd.append('archivo', file);
        fd.append('esPortada', String(esPortada));
        const res = await api.post(`/media/inmueble/${inmuebleId}/imagen`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data?.url as string | undefined;
      };

      const urlsImagenes: string[] = [];
      for (let i = 0; i < archivos.imagenes.length; i++) {
        const url = await uploadImagen(archivos.imagenes[i], i === 0);
        if (url) urlsImagenes.push(url);
      }

      toast.dismiss(toastId);

      // 4. Final: recargar o notificar éxito
      setSuccessMessage('¡Inmueble creado y archivos subidos correctamente!');
      setTimeout(() => onCancelar(), 1400);
    } catch (err: any) {
      toast.dismiss(toastId);
      const msg = err?.response?.data?.message || err?.message || 'Error inesperado al guardar';
      setLocalError(msg);
    } finally {
      setGuardando(false);
    }
  };

  const displayError = localError || externalError;
  const sumaPorc = Object.values(propietariosPorcentaje).reduce((a, b) => a + b, 0);

  return (
    <div className="form-modal show">
      <form onSubmit={handleSubmit} className="form-modal__content" style={{ maxWidth: '750px' }}>

        <div className="form-modal__header">
          <h2>Alta de Inmueble</h2>
          <button type="button" onClick={onCancelar} className="btn" disabled={guardando}>✕</button>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button type="button" onClick={() => setTab('datos')} className={`tab ${tab === 'datos' ? 'active' : ''}`}>
            🏠 Datos básicos
          </button>
          <button type="button" onClick={() => setTab('propietarios')} className={`tab ${tab === 'propietarios' ? 'active' : ''}`}>
            👥 Propietarios
            {Object.keys(propietariosPorcentaje).length > 0 && (
              <span className="tab-badge">{Object.keys(propietariosPorcentaje).length}</span>
            )}
          </button>
          <button type="button" onClick={() => setTab('archivos')} className={`tab ${tab === 'archivos' ? 'active' : ''}`}>
            📁 Archivos
            {(archivos.notaSimple || archivos.certificadoEnergetico || archivos.plano || archivos.imagenes.length > 0) && (
              <span className="tab-badge">
                {[archivos.notaSimple, archivos.certificadoEnergetico, archivos.plano].filter(Boolean).length + archivos.imagenes.length}
              </span>
            )}
          </button>
        </div>

        {/* FEEDBACK */}
        {displayError && (
          <div className="feedback feedback--error">🛑 {displayError}</div>
        )}
        {successMessage && (
          <div className="feedback feedback--success">✅ {successMessage}</div>
        )}

        <div className="form-modal__body">

          {/* ── PESTAÑA DATOS BÁSICOS ── */}
          {tab === 'datos' && (
            <>
              <p className="section-title">Datos Comerciales</p>
              <Field label="Título Comercial *">
                <input type="text" placeholder="ej: Piso luminoso en el centro" required value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })} />
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
              <div className="form-row">
                <Field label="Destacado en portada">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!form.destacado} onChange={e => setForm({ ...form, destacado: e.target.checked })} style={{ width: 'auto' }} />
                    <span>Mostrar en destacados (máx. 3)</span>
                  </label>
                </Field>
              </div>

              <p className="section-title">Gastos y Cargas</p>
              <div className="form-row">
                <Field label="Comunidad (€/mes)"><input type="number" min={0} value={form.comunidad || ''} onChange={e => setForm({ ...form, comunidad: Number(e.target.value) })} /></Field>
                <Field label="IBI (€/año)"><input type="number" min={0} value={form.ibi || ''} onChange={e => setForm({ ...form, ibi: Number(e.target.value) })} /></Field>
              </div>

              <p className="section-title">Descripción</p>
              <Field label="Descripción pública">
                <textarea className="textarea-large" value={form.descripcion || ''} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción visible en el portal..." />
              </Field>
              <Field label="Notas privadas (solo personal interno)">
                <textarea className="textarea-large" value={form.notasPrivadas || ''} onChange={e => setForm({ ...form, notasPrivadas: e.target.value })} placeholder="Información interna no visible al cliente..." />
              </Field>
            </>
          )}

          {/* ── PESTAÑA PROPIETARIOS ── */}
          {tab === 'propietarios' && (
            <>
              <p className="section-title">Asignación de Propietarios</p>
              <input
                type="text" placeholder="🔍 Buscar por nombre, apellidos o DNI..."
                value={filtroBusqueda}
                onChange={e => { setFiltroBusqueda(e.target.value); setPaginaActual(0); }}
                style={{ width: '100%', marginBottom: '1rem' }}
              />

              {cargandoVendedores ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>⏳ Cargando vendedores...</div>
              ) : vendedores.length === 0 ? (
                <div className="info-box">⚠️ No se encontraron vendedores.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {vendedores.map(v => {
                    const idStr = v.id.toString();
                    const sel = idStr in propietariosPorcentaje;
                    const nombre = v.usuario ? `${v.usuario.nombre} ${v.usuario.apellidos || ''}` : `Vendedor #${v.id}`;
                    return (
                      <div key={v.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                        padding: '0.75rem', borderRadius: '6px',
                        backgroundColor: sel ? '#f1f7fd' : '#fff',
                        border: sel ? '1px solid #b6d4fe' : '1px solid #dee2e6',
                      }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1 }}>
                          <input type="checkbox" checked={sel}
                            onChange={() => setPropietariosPorcentaje(prev => {
                              const c = { ...prev };
                              if (idStr in c) delete c[idStr]; else c[idStr] = 0;
                              return c;
                            })} style={{ width: 'auto' }} />
                          <strong>{nombre}</strong>
                        </label>
                        {sel && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#495057' }}>Participación:</span>
                            <input type="number" min={0} max={100} style={{ width: '80px', textAlign: 'right' }}
                              value={propietariosPorcentaje[idStr] ?? ''}
                              onChange={e => setPropietariosPorcentaje(prev => ({ ...prev, [idStr]: Number(e.target.value) }))} />
                            <strong>%</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <button type="button" className="btn" disabled={paginaActual === 0} onClick={() => setPaginaActual(p => p - 1)}>◀</button>
                  <span>Página {paginaActual + 1} de {totalPaginas}</span>
                  <button type="button" className="btn" disabled={paginaActual >= totalPaginas - 1} onClick={() => setPaginaActual(p => p + 1)}>▶</button>
                </div>
              )}

              <div style={{
                backgroundColor: '#e9ecef', padding: '1rem', borderRadius: '6px',
                display: 'flex', justifyContent: 'space-between', fontWeight: '600',
              }}>
                <span>Total asignado:</span>
                <span style={{ color: sumaPorc === 100 ? '#198754' : '#dc3545' }}>{sumaPorc}% / 100%</span>
              </div>
            </>
          )}

          {/* ── PESTAÑA ARCHIVOS ── */}
          {tab === 'archivos' && (
            <>
              <p className="section-title">Documentación Legal</p>

              <ArchivoUploader
                label="📄 Nota Simple (PDF)"
                accept=".pdf"
                archivo={archivos.notaSimple}
                inputRef={refNotaSimple}
                onChange={f => setArchivos(a => ({ ...a, notaSimple: f }))}
              />
              <ArchivoUploader
                label="🟢 Certificado Energético (PDF)"
                accept=".pdf"
                archivo={archivos.certificadoEnergetico}
                inputRef={refCertificado}
                onChange={f => setArchivos(a => ({ ...a, certificadoEnergetico: f }))}
              />
              <ArchivoUploader
                label="📐 Plano del Inmueble (PDF / imagen)"
                accept=".pdf,image/*"
                archivo={archivos.plano}
                inputRef={refPlano}
                onChange={f => setArchivos(a => ({ ...a, plano: f }))}
              />

              <p className="section-title" style={{ marginTop: '1.5rem' }}>🖼️ Imágenes del Inmueble</p>
              <div
                className="dropzone"
                onClick={() => refImagenes.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                  setArchivos(a => ({ ...a, imagenes: [...a.imagenes, ...files] }));
                  setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
                }}
              >
                <span>📂 Arrastra imágenes aquí o haz clic para seleccionar</span>
                <input ref={refImagenes} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImagenesChange} />
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
            {guardando ? '⏳ Subiendo archivos y guardando...' : successMessage ? '✓ Guardado' : '+ Dar de Alta'}
          </button>
        </div>
      </form>
    </div>
  );
};