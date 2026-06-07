import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { InmuebleDetalle } from '../../../types/inmueble';
import type { TipoOperacion, EstadoInmueble, TipoInmueble } from '../../../Enum/inmuebleEnum';
import type { ImagenInmueble } from '../../../types/imagen';
import { inmuebleService } from '../../../services/inmuebleService';
import api from '../../../services/api';
import { useBodyScroll } from '../../../hooks/useBodyScroll';
import '../../../styles/App.scss';
import { ArchivoFila, Field, Badge } from './_shared';
import PropietariosEditor from '../../ui/PropietariosEditor';

type Tab = 'datos' | 'propietarios' | 'archivos' | 'imagenes';

interface Props {
  inmueble: InmuebleDetalle;
  loading: boolean;
  onCerrar: () => void;
  onEliminar: (id: number) => Promise<void>;
  /** Callback para recargar el inmueble en el padre tras cambios en imágenes */
  onActualizar?: (id: number) => Promise<void>;
}

// ── Mapas de etiquetas para selects ──────────────────────────────────────
const OPERACIONES: TipoOperacion[] = ['VENTA', 'ALQUILER'];
const ESTADOS_INMUEBLE: EstadoInmueble[] = ['DISPONIBLE', 'RESERVADO', 'VENDIDO'];
const TIPOS_INMUEBLE: TipoInmueble[] = [
  'PISO', 'CASA', 'CHALET', 'ADOSADO', 'APARTAMENTO', 'ESTUDIO',
  'DUPLEX', 'ATICO', 'LOCAL_COMERCIAL', 'OFICINA', 'GARAJE',
  'TRASTERO', 'TERRENO', 'NAVE_INDUSTRIAL', 'FINCA',
];

const COLOR_ESTADO: Record<EstadoInmueble, 'green' | 'amber' | 'gray'> = {
  DISPONIBLE: 'green',
  RESERVADO:  'amber',
  VENDIDO:    'gray',
};

const COLOR_OPERACION: Record<TipoOperacion, 'blue' | 'amber' | 'gray'> = {
  VENTA:      'blue',
  ALQUILER:   'amber',
  CUALQUIERA: 'gray',
};

export const DetalleInmuebleModal = ({ inmueble, loading, onCerrar, onEliminar, onActualizar }: Props) => {
  const [tab, setTab] = useState<Tab>('datos');
  const [guardando, setGuardando] = useState(false);

  // Bloquear scroll del body mientras se abre el modal
  useBodyScroll(true);

  // ── Estado del formulario principal (siempre editable) ──
  const [form, setForm] = useState<Partial<InmuebleDetalle>>({});

  // ── Estado de propietarios editable ──
  const [propietariosLocal, setPropietariosLocal] = useState<Record<string, number>>({});

  // ── Características extra (clave-valor editables) ──
  const [extras, setExtras] = useState<{ clave: string; valor: string }[]>([]);

  // ── Estado local de imágenes ──
  const [imagenesLocales, setImagenesLocales] = useState<ImagenInmueble[]>([]);

  // Sincronizar el formulario cada vez que cambie el inmueble seleccionado
  useEffect(() => {
    if (!inmueble) return;
    setForm({
      titulo:        inmueble.titulo,
      precio:        inmueble.precio,
      operacion:     inmueble.operacion,
      estado:        inmueble.estado,
      tipo:          inmueble.tipo,
      habitaciones:  inmueble.habitaciones,
      banos:         inmueble.banos,
      superficieUtil: inmueble.superficieUtil,
      mConstruidos:  inmueble.mConstruidos,
      direccion:     inmueble.direccion,
      ciudad:        inmueble.ciudad,
      codigoPostal:  inmueble.codigoPostal,
      zona:          inmueble.zona,
      destacado:     inmueble.destacado ?? false,
      ibi:           inmueble.ibi,
      comunidad:     inmueble.comunidad,
      tieneDerrama:  inmueble.tieneDerrama,
      valorDerrama:  inmueble.valorDerrama,
      refCatastral:  inmueble.refCatastral,
      urlNotaSimple: inmueble.urlNotaSimple,
      urlCertificadoEnergetico: inmueble.urlCertificadoEnergetico,
      urlPlanoInmueble: inmueble.urlPlanoInmueble,
      notasPrivadas: inmueble.notasPrivadas,
      imagenes:      inmueble.imagenes?.slice() || [],
    });
    // Inicializar extras como array editable de clave-valor
    setExtras(
      Object.entries(inmueble.caracteristicasExtra || {}).map(([clave, valor]) => ({ clave, valor }))
    );
    // Inicializar propietarios locales
    setPropietariosLocal(inmueble.propietariosPorcentaje ? { ...inmueble.propietariosPorcentaje } : {});
    // Cargar imágenes desde el endpoint /detalle que las trae dentro de una transacción.
    // El endpoint base /inmuebles/{id} usa lazy loading y las imágenes llegan vacías.
    api.get(`/inmuebles/${inmueble.id}/detalle`)
      .then(res => {
        const imgs: ImagenInmueble[] = (res.data?.imagenes || []).map((img: any) => ({
          id:            img.id,
          url:           img.url,
          esPortada:     img.esPortada ?? false,
          nombreArchivo: img.nombreArchivo ?? '',
          inmuebleId:    inmueble.id,
        }));
        setImagenesLocales(imgs);
      })
      .catch(() => {
        // Fallback: usar las imágenes del objeto (si las hubiera)
        setImagenesLocales(inmueble.imagenes?.slice() || []);
      });
  }, [inmueble]);

  // ── Archivos de documentos pendientes de subida ──
  const [nuevoNotaSimple,   setNuevoNotaSimple]   = useState<File | null>(null);
  const [nuevoCertificado,  setNuevoCertificado]  = useState<File | null>(null);
  const [nuevoPlano,        setNuevoPlano]         = useState<File | null>(null);

  // ── Subida de nuevas imágenes ──
  const [nuevasImagenes,    setNuevasImagenes]     = useState<File[]>([]);
  const [previews,          setPreviews]           = useState<string[]>([]);
  const [primeraEsPortada,  setPrimeraEsPortada]   = useState(false);
  const [subiendoImagenes,  setSubiendoImagenes]   = useState(false);

  const refNotaSimple  = useRef<HTMLInputElement>(null);
  const refCertificado = useRef<HTMLInputElement>(null);
  const refPlano       = useRef<HTMLInputElement>(null);
  const refImagenes    = useRef<HTMLInputElement>(null);

  if (loading) return (
    <div className="form-modal show">
      <div className="form-modal__content"><p className="text-soft">Cargando ficha...</p></div>
    </div>
  );

  // ── Helper de acciones ──────────────────────────────────────────────
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


  // ── Guardar propietarios ──
  const guardarPropietarios = () => {
    const suma = Object.values(propietariosLocal).reduce((a, b) => a + b, 0);
    if (Object.keys(propietariosLocal).length > 0 && suma !== 100) {
      return toast.warning(`Los porcentajes deben sumar 100%. Ahora suman ${suma}%.`);
    }
    procesarAccion(
      () => inmuebleService.actualizar(inmueble.id, { propietariosPorcentaje: propietariosLocal } as any),
      'Propietarios actualizados correctamente.'
    );
  };

  // ── Guardar características extra ──
  const guardarExtras = () => {
    const caracteristicasExtra: Record<string, string> = {};
    extras.forEach(({ clave, valor }) => {
      if (clave.trim()) caracteristicasExtra[clave.trim()] = valor;
    });
    procesarAccion(
      () => inmuebleService.actualizar(inmueble.id, { caracteristicasExtra } as any),
      'Características adicionales actualizadas.'
    );
  };

  // ── Guardar datos básicos ──
  const guardarDatosBasicos = () => {
    if (!form.titulo) return toast.warning('El título es obligatorio.');
    procesarAccion(async () => {
      await inmuebleService.actualizar(inmueble.id, {
        titulo:       form.titulo,
        precio:       form.precio,
        operacion:    form.operacion,
        estado:       form.estado,
        tipo:         form.tipo,
        habitaciones: form.habitaciones,
        banos:        form.banos,
        superficieUtil: form.superficieUtil,
        mConstruidos: form.mConstruidos,
        direccion:    form.direccion,
        ciudad:       form.ciudad,
        codigoPostal: form.codigoPostal,
        zona:         form.zona,
        destacado:    form.destacado,
      });
    }, 'Datos básicos actualizados correctamente.');
  };

  // ── Guardar datos internos/gastos ──
  const guardarDatosInternos = async () => {
    await procesarAccion(async () => {
      let urlNotaSimpleNueva          = form.urlNotaSimple;
      let urlCertificadoNuevo         = form.urlCertificadoEnergetico;
      let urlPlanoNuevo               = form.urlPlanoInmueble;

      const toastId = toast.loading('Subiendo archivos al servidor...');

      try {
        const uploadDocumento = async (file: File, tipo: string) => {
          const fd = new FormData();
          fd.append('archivo', file);
          fd.append('tipo', tipo);
          const res = await api.post(`/media/inmueble/${inmueble.id}/documento`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          return res.data?.url as string | undefined;
        };

        const promesasSubida: Promise<any>[] = [];
        if (nuevoNotaSimple)   promesasSubida.push(uploadDocumento(nuevoNotaSimple,  'nota_simple').then(url  => { if (url) urlNotaSimpleNueva  = url; }));
        if (nuevoCertificado)  promesasSubida.push(uploadDocumento(nuevoCertificado, 'certificado_energetico').then(url => { if (url) urlCertificadoNuevo = url; }));
        if (nuevoPlano)        promesasSubida.push(uploadDocumento(nuevoPlano,       'plano').then(url        => { if (url) urlPlanoNuevo         = url; }));
        await Promise.all(promesasSubida);
      } finally {
        toast.dismiss(toastId);
      }

      await inmuebleService.actualizar(inmueble.id, {
        ibi:                     form.ibi,
        comunidad:               form.comunidad,
        tieneDerrama:            form.tieneDerrama ?? false,
        valorDerrama:            form.tieneDerrama ? form.valorDerrama : 0,
        refCatastral:            form.refCatastral,
        notasPrivadas:           form.notasPrivadas,
        zona:                    form.zona,
        destacado:               form.destacado ?? false,
        urlNotaSimple:           urlNotaSimpleNueva,
        urlCertificadoEnergetico: urlCertificadoNuevo,
        urlPlanoInmueble:        urlPlanoNuevo,
      });

      setNuevoNotaSimple(null);
      setNuevoCertificado(null);
      setNuevoPlano(null);
    }, 'Datos internos actualizados correctamente.');
  };

  // ── Helpers de imágenes ────────────────────────────────────────────────
  const recargarInmueble = async () => {
    if (onActualizar) {
      await onActualizar(inmueble.id);
    }
  };

  const handleEliminarImagen = async (imagenId: number) => {
    if (!confirm('¿Eliminar esta imagen del inmueble?')) return;
    try {
      await api.delete(`/media/imagen/${imagenId}`);
      setImagenesLocales(prev => prev.filter(img => img.id !== imagenId));
      toast.success('Imagen eliminada.');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'No se pudo eliminar la imagen.';
      toast.error(`Error: ${msg}`);
    }
  };

  const handleHacerPortada = async (img: ImagenInmueble) => {
    try {
      await api.patch(`/media/imagen/${img.id}/portada`);
      setImagenesLocales(prev => prev.map(i => ({ ...i, esPortada: i.id === img.id })));
      toast.success('Portada actualizada.');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'No se pudo cambiar la portada.';
      toast.error(`Error: ${msg}`);
    }
  };

  const quitarNuevaImagen = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setNuevasImagenes(a => a.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const handleSubirImagenes = async () => {
    if (nuevasImagenes.length === 0) return;
    setSubiendoImagenes(true);
    const toastId = toast.loading(`Subiendo ${nuevasImagenes.length} imagen(es)...`);
    try {
      const resultados: ImagenInmueble[] = [];
      for (let i = 0; i < nuevasImagenes.length; i++) {
        const file = nuevasImagenes[i];
        const esPortada = i === 0 && primeraEsPortada;
        const fd = new FormData();
        fd.append('archivo', file);
        fd.append('esPortada', String(esPortada));
        const res = await api.post(`/media/inmueble/${inmueble.id}/imagen`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data) resultados.push(res.data as ImagenInmueble);
      }
      previews.forEach(url => URL.revokeObjectURL(url));
      setNuevasImagenes([]);
      setPreviews([]);
      setPrimeraEsPortada(false);
      toast.dismiss(toastId);
      toast.success(`${resultados.length} imagen(es) subida(s) correctamente.`);
      await recargarInmueble();
    } catch (error: any) {
      toast.dismiss(toastId);
      const msg = error?.response?.data?.message || error?.message || 'Error al subir imágenes.';
      toast.error(`Error: ${msg}`);
    } finally {
      setSubiendoImagenes(false);
    }
  };

  const hayPortada = imagenesLocales.some(img => img.esPortada);

  return (
    <div className="form-modal show">
      <div className="form-modal__content">

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{inmueble.titulo}</h2>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
              Ref. {inmueble.referencia} · {inmueble.ciudad}
            </p>
          </div>
          <div className="modal-badges">
            <Badge text={inmueble.estado}    color={COLOR_ESTADO[inmueble.estado]}       />
            <Badge text={inmueble.operacion} color={COLOR_OPERACION[inmueble.operacion]} />
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" role="tablist">
          <button onClick={() => setTab('datos')}       className={`tab ${tab === 'datos'       ? 'active' : ''}`}>Datos básicos</button>
          <button onClick={() => setTab('propietarios')} className={`tab ${tab === 'propietarios' ? 'active' : ''}`}>Propietarios</button>
          <button onClick={() => setTab('archivos')}    className={`tab ${tab === 'archivos'    ? 'active' : ''}`}>Documentos</button>
          <button onClick={() => setTab('imagenes')}    className={`tab ${tab === 'imagenes'    ? 'active' : ''}`}>
            Imágenes {imagenesLocales.length > 0 && (
              <span className="badge badge--blue" style={{ marginLeft: '0.35rem', fontSize: '0.7rem' }}>
                {imagenesLocales.length}
              </span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="form-modal__body">

          {/* ── DATOS BÁSICOS ── */}
          {tab === 'datos' && (
            <>
              <div className="form-row">
                <Field label="Título *">
                  <input
                    value={form.titulo ?? ''}
                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  />
                </Field>
                <Field label="Precio (€) *">
                  <input
                    type="number"
                    min={0}
                    value={form.precio ?? ''}
                    onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))}
                  />
                </Field>
              </div>

              <div className="form-row">
                <Field label="Operación">
                  <select
                    value={form.operacion ?? ''}
                    onChange={e => setForm(f => ({ ...f, operacion: e.target.value as TipoOperacion }))}
                  >
                    {OPERACIONES.map(o => (
                      <option key={o} value={o}>{o.charAt(0) + o.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Estado">
                  <select
                    value={form.estado ?? ''}
                    onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoInmueble }))}
                  >
                    {ESTADOS_INMUEBLE.map(s => (
                      <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="form-row">
                <Field label="Tipo de inmueble">
                  <select
                    value={form.tipo ?? ''}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoInmueble }))}
                  >
                    {TIPOS_INMUEBLE.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </Field>
                <Field label="¿Destacado?">
                  <select
                    value={form.destacado ? 'si' : 'no'}
                    onChange={e => setForm(f => ({ ...f, destacado: e.target.value === 'si' }))}
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </Field>
              </div>

              <div className="form-row">
                <Field label="Habitaciones">
                  <input
                    type="number"
                    min={0}
                    value={form.habitaciones ?? ''}
                    onChange={e => setForm(f => ({ ...f, habitaciones: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Baños">
                  <input
                    type="number"
                    min={0}
                    value={form.banos ?? ''}
                    onChange={e => setForm(f => ({ ...f, banos: Number(e.target.value) }))}
                  />
                </Field>
              </div>

              <div className="form-row">
                <Field label="Superficie útil (m²)">
                  <input
                    type="number"
                    min={0}
                    value={form.superficieUtil ?? ''}
                    onChange={e => setForm(f => ({ ...f, superficieUtil: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="m² construidos">
                  <input
                    type="number"
                    min={0}
                    value={form.mConstruidos ?? ''}
                    onChange={e => setForm(f => ({ ...f, mConstruidos: Number(e.target.value) }))}
                  />
                </Field>
              </div>

              <div className="form-row">
                <Field label="Dirección">
                  <input
                    value={form.direccion ?? ''}
                    onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                  />
                </Field>
                <Field label="Ciudad">
                  <input
                    value={form.ciudad ?? ''}
                    onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="form-row">
                <Field label="Código postal">
                  <input
                    value={form.codigoPostal ?? ''}
                    onChange={e => setForm(f => ({ ...f, codigoPostal: e.target.value }))}
                  />
                </Field>
                <Field label="Zona">
                  <input
                    placeholder="ej: Mopu, Chapín..."
                    value={form.zona ?? ''}
                    onChange={e => setForm(f => ({ ...f, zona: e.target.value }))}
                  />
                </Field>
              </div>

              <Field label="Referencia catastral">
                <input
                  value={form.refCatastral ?? ''}
                  onChange={e => setForm(f => ({ ...f, refCatastral: e.target.value }))}
                />
              </Field>

              <Field label="Comunidad (€/mes)">
                <input
                  type="number"
                  min={0}
                  value={form.comunidad ?? ''}
                  onChange={e => setForm(f => ({ ...f, comunidad: Number(e.target.value) }))}
                />
              </Field>

              <div className="form-row">
                <Field label="IBI (€/año)">
                  <input
                    type="number"
                    min={0}
                    value={form.ibi ?? ''}
                    onChange={e => setForm(f => ({ ...f, ibi: Number(e.target.value) }))}
                  />
                </Field>
                <Field label="¿Tiene derrama?">
                  <select
                    value={form.tieneDerrama ? 'si' : 'no'}
                    onChange={e => setForm(f => ({ ...f, tieneDerrama: e.target.value === 'si' }))}
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </Field>
              </div>

              {form.tieneDerrama && (
                <Field label="Importe derrama (€)">
                  <input
                    type="number"
                    min={0}
                    value={form.valorDerrama ?? ''}
                    onChange={e => setForm(f => ({ ...f, valorDerrama: Number(e.target.value) }))}
                  />
                </Field>
              )}

              <Field label="Notas internas">
                <textarea
                  className="textarea-large"
                  value={form.notasPrivadas ?? ''}
                  onChange={e => setForm(f => ({ ...f, notasPrivadas: e.target.value }))}
                  placeholder="Notas internas del equipo (no visibles al público)..."
                />
              </Field>

              {/* Características extra — editables con interfaz clave-valor */}
              <p className="section-title" style={{ marginTop: '0.5rem' }}>Características adicionales</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {extras.map((e, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      placeholder="Característica (ej: Ascensor)"
                      value={e.clave}
                      onChange={ev => setExtras(prev => prev.map((x, i) => i === idx ? { ...x, clave: ev.target.value } : x))}
                      style={{ flex: '0 0 40%', padding: '0.45rem 0.6rem', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem' }}
                    />
                    <input
                      placeholder="Valor (ej: Sí, 2, No...)"
                      value={e.valor}
                      onChange={ev => setExtras(prev => prev.map((x, i) => i === idx ? { ...x, valor: ev.target.value } : x))}
                      style={{ flex: 1, padding: '0.45rem 0.6rem', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setExtras(prev => prev.filter((_, i) => i !== idx))}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#c0392b', fontSize: '1.1rem', flexShrink: 0 }}
                      title="Eliminar esta característica"
                    >✕</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setExtras(prev => [...prev, { clave: '', valor: '' }])}
                  style={{ alignSelf: 'flex-start', padding: '0.35rem 0.75rem', border: '1px dashed #00439c', borderRadius: 6,
                    background: 'transparent', color: '#00439c', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  + Añadir característica
                </button>
              </div>
              <div className="form-actions" style={{ marginBottom: '0.5rem' }}>
                <button onClick={guardarExtras} disabled={guardando} className="btn btn-ghost btn-sm">
                  {guardando ? 'Guardando...' : 'Guardar características'}
                </button>
              </div>

              <div className="form-actions">
                <button onClick={guardarDatosBasicos} disabled={guardando} className="btn btn-primary">
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}

          {/* ── PROPIETARIOS ── */}
          {tab === 'propietarios' && (
            <>
              <p className="section-title">Propietarios del inmueble</p>
              <PropietariosEditor
                propietarios={propietariosLocal}
                onChange={setPropietariosLocal}
              />
              <div className="form-actions">
                <button onClick={guardarPropietarios} disabled={guardando} className="btn btn-primary">
                  {guardando ? 'Guardando...' : 'Guardar propietarios'}
                </button>
              </div>
            </>
          )}

          {/* ── DOCUMENTOS ── */}
          {tab === 'archivos' && (
            <>
              <p className="section-title">Documentación legal</p>

              <ArchivoFila
                label="Nota Simple"
                urlActual={form.urlNotaSimple}
                archivoNuevo={nuevoNotaSimple}
                inputRef={refNotaSimple}
                editMode={true}
                accept=".pdf"
                onChange={setNuevoNotaSimple}
                esPdf
              />
              <ArchivoFila
                label="Certificado Energético"
                urlActual={form.urlCertificadoEnergetico}
                archivoNuevo={nuevoCertificado}
                inputRef={refCertificado}
                editMode={true}
                accept=".pdf"
                onChange={setNuevoCertificado}
                esPdf
              />
              <ArchivoFila
                label="Plano del Inmueble"
                urlActual={form.urlPlanoInmueble}
                archivoNuevo={nuevoPlano}
                inputRef={refPlano}
                editMode={true}
                accept=".pdf,image/*"
                onChange={setNuevoPlano}
                esPdf
              />

              <div className="form-actions">
                <button onClick={guardarDatosInternos} disabled={guardando} className="btn btn-primary">
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}

          {/* ── IMÁGENES ── */}
          {tab === 'imagenes' && (
            <div>
              <p className="section-title">Imágenes actuales del inmueble</p>

              {/* Instrucción de uso */}
              {imagenesLocales.length > 0 && (
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#6b7280' }}>
                  Haz clic en una imagen para marcarla como <strong>portada</strong>. La portada se muestra en el listado público y en la ficha del inmueble.
                </p>
              )}

              {imagenesLocales.length === 0 ? (
                <div className="info-box" style={{ textAlign: 'center', color: '#6c757d' }}>
                  Este inmueble no tiene imágenes todavía. Sube las primeras desde la zona inferior.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}>
                  {imagenesLocales.map(img => (
                    <div
                      key={img.id}
                      onClick={() => !img.esPortada && handleHacerPortada(img)}
                      style={{
                        border: img.esPortada ? '2.5px solid #00439c' : '1.5px solid #e5e7eb',
                        borderRadius: 10,
                        overflow: 'hidden',
                        position: 'relative',
                        background: '#f9fafb',
                        boxShadow: img.esPortada
                          ? '0 0 0 3px rgba(0,67,156,0.18), 0 4px 12px rgba(0,67,156,0.12)'
                          : '0 1px 4px rgba(0,0,0,0.06)',
                        cursor: img.esPortada ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                      title={img.esPortada ? 'Imagen de portada actual' : 'Clic para usar como portada'}
                    >
                      {/* Imagen */}
                      <div style={{ position: 'relative' }}>
                        <img
                          src={img.url}
                          alt={img.nombreArchivo || 'Imagen inmueble'}
                          style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
                          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/160x130?text=Error'; }}
                        />
                        {/* Overlay de portada */}
                        {img.esPortada && (
                          <div style={{
                            position: 'absolute', top: 8, left: 8,
                            background: '#00439c', color: 'white',
                            fontSize: '0.68rem', fontWeight: 800,
                            padding: '3px 8px', borderRadius: 999,
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                          }}>
                            ⭐ Portada
                          </div>
                        )}
                        {/* Hover overlay para no-portada */}
                        {!img.esPortada && (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,67,156,0.0)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,67,156,0.35)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,67,156,0)'; }}
                          >
                            <span style={{
                              background: 'white', color: '#00439c',
                              padding: '4px 10px', borderRadius: 999,
                              fontSize: '0.72rem', fontWeight: 700,
                              opacity: 0, transition: 'opacity 0.2s',
                              pointerEvents: 'none',
                            }}
                            className="portada-hint"
                            >
                              Usar como portada
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Nombre del archivo */}
                      <div style={{
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.69rem', color: '#6b7280',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }} title={img.nombreArchivo}>
                        {img.nombreArchivo || `img-${img.id}`}
                      </div>

                      {/* Botón eliminar */}
                      <div style={{ padding: '0 0.4rem 0.4rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={e => { e.stopPropagation(); handleEliminarImagen(img.id); }}
                          style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                          title="Eliminar imagen"
                        >
                          🗑 Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="section-title" style={{ marginTop: '1rem' }}>Subir nuevas imágenes</p>

              <div
                className="dropzone"
                onClick={() => refImagenes.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                  if (files.length === 0) return;
                  setNuevasImagenes(a => [...a, ...files]);
                  setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
                }}
              >
                <span>Arrastra imágenes aquí o haz clic para seleccionar</span>
                <input
                  ref={refImagenes}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    setNuevasImagenes(a => [...a, ...files]);
                    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
                    e.target.value = '';
                  }}
                />
              </div>

              {previews.length > 0 && (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                    gap: '0.5rem',
                    marginTop: '0.75rem',
                  }}>
                    {previews.map((src, idx) => (
                      <div key={idx} style={{
                        border: '1px dashed #cbd5e1',
                        borderRadius: 8,
                        overflow: 'hidden',
                        position: 'relative',
                        background: '#f8fafc',
                      }}>
                        <img
                          src={src}
                          alt={`preview-${idx}`}
                          style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
                        />
                        {idx === 0 && !hayPortada && (
                          <div style={{
                            background: 'rgba(0,67,156,0.08)',
                            fontSize: '0.65rem', textAlign: 'center',
                            padding: '1px 4px', color: '#00439c', fontWeight: 600,
                          }}>
                            {primeraEsPortada ? 'SERÁ PORTADA' : 'Primera imagen'}
                          </div>
                        )}
                        <div style={{
                          padding: '0.25rem',
                          fontSize: '0.65rem', color: '#6b7280',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {nuevasImagenes[idx]?.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => quitarNuevaImagen(idx)}
                          style={{
                            position: 'absolute', top: 3, right: 3,
                            background: 'rgba(220,38,38,0.85)', border: 'none',
                            borderRadius: '50%', width: 18, height: 18,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white', fontSize: '0.65rem', lineHeight: 1,
                          }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>

                  {!hayPortada && (
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      marginTop: '0.75rem', fontSize: '0.85rem', cursor: 'pointer', color: '#374151',
                    }}>
                      <input
                        type="checkbox"
                        checked={primeraEsPortada}
                        onChange={e => setPrimeraEsPortada(e.target.checked)}
                        style={{ width: 'auto' }}
                      />
                      Marcar primera imagen como portada
                    </label>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleSubirImagenes}
                      disabled={subiendoImagenes}
                    >
                      {subiendoImagenes ? 'Subiendo...' : `Subir ${nuevasImagenes.length} imagen(es)`}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        previews.forEach(url => URL.revokeObjectURL(url));
                        setNuevasImagenes([]);
                        setPreviews([]);
                        setPrimeraEsPortada(false);
                      }}
                      disabled={subiendoImagenes}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-danger" disabled={guardando} onClick={manejarEliminar}>
            {guardando ? 'Procesando...' : 'Eliminar inmueble'}
          </button>
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};
