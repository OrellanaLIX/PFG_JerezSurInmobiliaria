import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { InmuebleDetalle } from '../../../types/inmueble';
import { inmuebleService } from '../../../services/inmuebleService';
import api from '../../../services/api';
import '../../../styles/App.scss';
import { ArchivoFila, Field, Badge } from './_shared';

type Tab = 'datos' | 'propietarios' | 'archivos';

interface Props {
  inmueble: InmuebleDetalle;
  loading: boolean;
  onCerrar: () => void;
  onEliminar: (id: number) => Promise<void>;
}

export const DetalleInmuebleModal = ({ inmueble, loading, onCerrar, onEliminar }: Props) => {
  const [tab, setTab] = useState<Tab>('datos');
  const [guardando, setGuardando] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState<Partial<InmuebleDetalle>>({});

  // Sincronizar el formulario cada vez que cambie el inmueble seleccionado
  useEffect(() => {
    if (inmueble) {
      setForm({
        ibi: inmueble.ibi,
        comunidad: inmueble.comunidad,
        tieneDerrama: inmueble.tieneDerrama,
        valorDerrama: inmueble.valorDerrama,
        refCatastral: inmueble.refCatastral,
        urlNotaSimple: inmueble.urlNotaSimple,
        urlCertificadoEnergetico: inmueble.urlCertificadoEnergetico,
        urlPlanoInmueble: inmueble.urlPlanoInmueble,
        notasPrivadas: inmueble.notasPrivadas,
        imagenes: inmueble.imagenes?.slice() || [],
      });
    }
  }, [inmueble]);

  // Archivos nuevos seleccionados pendientes de subida
  const [nuevoNotaSimple, setNuevoNotaSimple] = useState<File | null>(null);
  const [nuevoCertificado, setNuevoCertificado] = useState<File | null>(null);
  const [nuevoPlano, setNuevoPlano] = useState<File | null>(null);
  const [nuevasImagenes, setNuevasImagenes] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const refNotaSimple = useRef<HTMLInputElement>(null);
  const refCertificado = useRef<HTMLInputElement>(null);
  const refPlano = useRef<HTMLInputElement>(null);
  const refImagenes = useRef<HTMLInputElement>(null);

  if (loading) return (
    <div className="form-modal show">
      <div className="form-modal__content"><p className="text-soft">Cargando ficha...</p></div>
    </div>
  );

  const procesarAccion = async (accionFn: () => Promise<void>, msgExito: string, debeCerrar = false) => {
    setGuardando(true);
    try {
      await accionFn();
      toast.success(msgExito);
      if (debeCerrar) onCerrar();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'No se pudo completar la operación.';
      toast.error(`Error: ${msg}`);
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminar = () => {
    if (!confirm('¿Eliminar inmueble del sistema?')) return;
    procesarAccion(() => onEliminar(inmueble.id), 'Inmueble eliminado correctamente.', true);
  };

  const handleGuardar = async () => {
    await procesarAccion(async () => {
      let urlNotaSimpleNueva = form.urlNotaSimple;
      let urlCertificadoNuevo = form.urlCertificadoEnergetico;
      let urlPlanoNuevo = form.urlPlanoInmueble;
      const urlsImagenesNuevas: string[] = [];

      const toastId = toast.loading('⏳ Subiendo archivos al servidor...');

      try {
        // Un solo array de promesas tipado correctamente
        const promesasSubida: Promise<any>[] = [];

        const uploadDocumento = async (file: File, tipo: string) => {
          const fd = new FormData();
          fd.append('archivo', file);
          fd.append('tipo', tipo);
          const res = await api.post(`/media/inmueble/${inmueble.id}/documento`, fd, { 
            headers: { 'Content-Type': 'multipart/form-data' } 
          });
          return res.data?.url as string | undefined;
        };

        const uploadImagen = async (file: File, esPortada = false) => {
          const fd = new FormData();
          fd.append('archivo', file);
          fd.append('esPortada', String(esPortada));
          const res = await api.post(`/media/inmueble/${inmueble.id}/imagen`, fd, { 
            headers: { 'Content-Type': 'multipart/form-data' } 
          });
          return res.data?.url as string | undefined;
        };

        // Verificaciones individuales corregidas sin anidaciones rotas
        if (nuevoNotaSimple) {
          promesasSubida.push(uploadDocumento(nuevoNotaSimple, 'nota_simple').then(url => { if (url) urlNotaSimpleNueva = url; }));
        }
        if (nuevoCertificado) {
          promesasSubida.push(uploadDocumento(nuevoCertificado, 'certificado_energetico').then(url => { if (url) urlCertificadoNuevo = url; }));
        }
        if (nuevoPlano) {
          promesasSubida.push(uploadDocumento(nuevoPlano, 'plano').then(url => { if (url) urlPlanoNuevo = url; }));
        }

        if (nuevasImagenes.length > 0) {
          nuevasImagenes.forEach((file) => {
            promesasSubida.push(uploadImagen(file, false).then(url => { if (url) urlsImagenesNuevas.push(url); }));
          });
        }

        // Ejecutar cargas en paralelo
        await Promise.all(promesasSubida);
      } finally {
        toast.dismiss(toastId);
      }

      // Estructura del payload DTO para enviar a Spring Boot
      const datosActualizacion = {
        ibi: form.ibi,
        comunidad: form.comunidad,
        tieneDerrama: form.tieneDerrama ?? false,
        valorDerrama: form.tieneDerrama ? form.valorDerrama : 0,
        refCatastral: form.refCatastral,
        notasPrivadas: form.notasPrivadas,
        urlNotaSimple: urlNotaSimpleNueva,
        urlCertificadoEnergetico: urlCertificadoNuevo,
        urlPlanoInmueble: urlPlanoNuevo,
      };

      await inmuebleService.actualizar(inmueble.id, datosActualizacion);

      // Limpieza de estados locales tras guardar con éxito
      setNuevoNotaSimple(null);
      setNuevoCertificado(null);
      setNuevoPlano(null);
      setNuevasImagenes([]);
      setPreviews([]);
      setEditMode(false);
    }, 'Ficha actualizada correctamente.', false);
  };

  const quitarImagenExistente = (id: number) =>
    setForm(f => ({ ...f, imagenes: (f.imagenes || []).filter((img: any) => img.id !== id) }));

  const quitarNuevaImagen = (idx: number) => {
    setNuevasImagenes(a => a.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  return (
    <div className="form-modal show">
      <div className="form-modal__backdrop" onClick={onCerrar} />
      <div className="form-modal__content" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Ficha: {inmueble.referencia}</h2>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>{inmueble.titulo}</p>
          </div>
          <button className="btn btn-ghost" onClick={onCerrar}>✕</button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button onClick={() => setTab('datos')} className={`tab ${tab === 'datos' ? 'active' : ''}`}>🏠 Datos básicos</button>
          <button onClick={() => setTab('propietarios')} className={`tab ${tab === 'propietarios' ? 'active' : ''}`}>👥 Propietarios</button>
          <button onClick={() => setTab('archivos')} className={`tab ${tab === 'archivos' ? 'active' : ''}`}>📁 Archivos</button>
        </div>

        {/* Body */}
        <div className="form-modal__body">

          {/* ── DATOS BÁSICOS ── */}
          {tab === 'datos' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setEditMode(v => !v)}>
                  {editMode ? '✕ Cancelar edición' : '✏️ Editar ficha'}
                </button>
              </div>

              <p className="section-title">Descripción</p>
              <p className="text-soft">{inmueble.descripcion || 'Sin descripción pública.'}</p>

              {editMode ? (
                <Field label="Notas internas">
                  <textarea className="textarea-large" value={form.notasPrivadas ?? ''}
                    onChange={e => setForm(f => ({ ...f, notasPrivadas: e.target.value }))} />
                </Field>
              ) : form.notasPrivadas ? (
                <div className="alert alert-warning">
                  <strong>🔒 Notas internas:</strong><br />{form.notasPrivadas}
                </div>
              ) : null}

              <p className="section-title">Gastos y Cargas</p>
              <div className="form-row">
                <Field label="Comunidad (€/mes)">
                  {editMode
                    ? <input type="number" value={form.comunidad ?? ''} onChange={e => setForm(f => ({ ...f, comunidad: Number(e.target.value) }))} />
                    : <span className="read-value">{form.comunidad ?? '—'} €/mes</span>}
                </Field>
                <Field label="IBI (€/año)">
                  {editMode
                    ? <input type="number" value={form.ibi ?? ''} onChange={e => setForm(f => ({ ...f, ibi: Number(e.target.value) }))} />
                    : <span className="read-value">{form.ibi ?? '—'} €/año</span>}
                </Field>
              </div>
              <div className="form-row">
                <Field label="¿Tiene derrama?">
                  {editMode
                    ? <select value={form.tieneDerrama ? 'si' : 'no'} onChange={e => setForm(f => ({ ...f, tieneDerrama: e.target.value === 'si' }))}>
                      <option value="no">No</option><option value="si">Sí</option>
                    </select>
                    : <span className="read-value">{form.tieneDerrama ? 'Sí' : 'No'}</span>}
                </Field>
                {form.tieneDerrama && (
                  <Field label="Importe derrama (€)">
                    {editMode
                      ? <input type="number" value={form.valorDerrama ?? ''} onChange={e => setForm(f => ({ ...f, valorDerrama: Number(e.target.value) }))} />
                      : <span className="read-value">{form.valorDerrama} €</span>}
                  </Field>
                )}
              </div>

              <p className="section-title">Datos Catastrales</p>
              <div className="form-row">
                <Field label="Referencia Catastral">
                  {editMode
                    ? <input value={form.refCatastral ?? ''} onChange={e => setForm(f => ({ ...f, refCatastral: e.target.value }))} />
                    : <code>{form.refCatastral || 'No aportada'}</code>}
                </Field>
              </div>

              {inmueble.caracteristicasExtra && Object.keys(inmueble.caracteristicasExtra).length > 0 && (
                <>
                  <p className="section-title">Características Adicionales</p>
                  <ul>
                    {Object.entries(inmueble.caracteristicasExtra).map(([k, v]) => (
                      <li key={k}><strong>{k}:</strong> {v}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          {/* ── PROPIETARIOS ── */}
          {tab === 'propietarios' && (
            <>
              <p className="section-title">Propietarios del Inmueble</p>
              {inmueble.propietariosPorcentaje && Object.keys(inmueble.propietariosPorcentaje).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(inmueble.propietariosPorcentaje).map(([vendedorKey, porcentaje]) => {
                    let nombreVendedor = 'Vendedor Desconocido';
                    try {
                      const vendedorObj = JSON.parse(vendedorKey);
                      nombreVendedor = vendedorObj.usuario?.nombre 
                        ? `${vendedorObj.usuario.nombre} ${vendedorObj.usuario.apellidos || ''}` 
                        : `Vendedor ID: ${vendedorObj.id}`;
                    } catch {
                      nombreVendedor = vendedorKey;
                    }

                    return (
                      <div key={vendedorKey} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.75rem 1rem', borderRadius: '6px',
                        border: '1px solid #dee2e6', backgroundColor: '#f8f9fa',
                      }}>
                        <span style={{ fontWeight: 500 }}>{nombreVendedor}</span>
                        <Badge text={`${porcentaje}%`} color="blue" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="info-box">No hay propietarios asignados a este inmueble.</div>
              )}
              <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
                ℹ️ Para modificar los propietarios o porcentajes, usa la edición completa del inmueble.
              </div>
            </>
          )}

          {/* ── ARCHIVOS ── */}
          {tab === 'archivos' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setEditMode(v => !v)}>
                  {editMode ? '✕ Cancelar' : '✏️ Editar archivos'}
                </button>
              </div>

              <p className="section-title">Documentación Legal</p>

              <ArchivoFila
                label="📄 Nota Simple"
                urlActual={form.urlNotaSimple}
                archivoNuevo={nuevoNotaSimple}
                inputRef={refNotaSimple}
                editMode={editMode}
                accept=".pdf"
                onChange={setNuevoNotaSimple}
              />
              <ArchivoFila
                label="🟢 Certificado Energético"
                urlActual={form.urlCertificadoEnergetico}
                archivoNuevo={nuevoCertificado}
                inputRef={refCertificado}
                editMode={editMode}
                accept=".pdf"
                onChange={setNuevoCertificado}
              />
              <ArchivoFila
                label="📐 Plano del Inmueble"
                urlActual={form.urlPlanoInmueble}
                archivoNuevo={nuevoPlano}
                inputRef={refPlano}
                editMode={editMode}
                accept=".pdf,image/*"
                onChange={setNuevoPlano}
              />

              <p className="section-title" style={{ marginTop: '1.5rem' }}>🖼️ Imágenes</p>

              {/* Imágenes existentes en BD */}
              {(form.imagenes || []).length > 0 && (
                <div className="imagenes-grid">
                  {(form.imagenes as any[]).map((img) => (
                    <div className="imagen-card" key={img.id}>
                      <img src={img.url} alt={img.nombreArchivo} />
                      <div className="imagen-card__meta">
                        <small>{img.nombreArchivo}</small>
                        {editMode && (
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => quitarImagenExistente(img.id)}>✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Nuevas imágenes a subir */}
              {editMode && (
                <>
                  <div
                    className="dropzone"
                    style={{ marginTop: '0.75rem' }}
                    onClick={() => refImagenes.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                      setNuevasImagenes(a => [...a, ...files]);
                      setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
                    }}
                  >
                    <span>📂 Arrastra imágenes nuevas aquí o haz clic</span>
                    <input ref={refImagenes} type="file" accept="image/*" multiple style={{ display: 'none' }}
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        setNuevasImagenes(a => [...a, ...files]);
                        setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
                      }} />
                  </div>
                  {previews.length > 0 && (
                    <div className="imagenes-grid" style={{ marginTop: '0.75rem' }}>
                      {previews.map((src, idx) => (
                        <div className="imagen-card" key={idx}>
                          <img src={src} alt={`nueva-${idx}`} />
                          <div className="imagen-card__meta">
                            <small>{nuevasImagenes[idx]?.name}</small>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => quitarNuevaImagen(idx)}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-danger" disabled={guardando} onClick={manejarEliminar}>
            {guardando ? 'Procesando...' : '🚨 Eliminar Inmueble'}
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {editMode && (
              <button className="btn btn-primary" disabled={guardando} onClick={handleGuardar}>
                {guardando ? '⏳ Guardando...' : '💾 Guardar cambios'}
              </button>
            )}
            <button className="btn btn-ghost" onClick={onCerrar}>Cerrar Ficha</button>
          </div>
        </div>
      </div>
    </div>
  );
};