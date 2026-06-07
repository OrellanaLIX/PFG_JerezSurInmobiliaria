import { useState, useEffect } from 'react';
import { useBodyScroll } from '../../../hooks/useBodyScroll';
import { toast } from 'react-toastify';
import type { OperacionDetalle, EstadoOperacion, RolParticipante } from '../../../types/operacion';
import api from '../../../services/api';
import '../../../styles/App.scss';

type Tab = 'datos' | 'inmueble' | 'interesados';

interface Props {
  operacion: OperacionDetalle | null;
  loading: boolean;
  onCerrar: () => void;
  onActualizarEstado: (id: number, estado: EstadoOperacion) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
}

const ETIQUETA_ESTADO: Record<EstadoOperacion, string> = {
  ABIERTA:    'Abierta',
  EN_TRAMITE: 'En Trámite',
  CERRADA:    'Cerrada',
  CANCELADA:  'Cancelada',
};

const COLOR_ESTADO: Record<EstadoOperacion, 'blue' | 'green' | 'amber' | 'gray' | 'red'> = {
  ABIERTA:    'blue',
  EN_TRAMITE: 'amber',
  CERRADA:    'green',
  CANCELADA:  'gray',
};

const ETIQUETA_ROL: Record<RolParticipante, string> = {
  TITULAR:   'Titular',
  APODERADO: 'Apoderado',
  AVALISTA:  'Avalista',
};

const Badge = ({ text, color }: { text: string; color: 'blue' | 'green' | 'amber' | 'gray' | 'red' }) => (
  <span className={`badge badge--${color}`}>{text}</span>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="form-field">
    <label className="form-field__label">{label}</label>
    {children}
  </div>
);

export const DetalleOperacionModal = ({ operacion, loading, onCerrar, onActualizarEstado, onEliminar }: Props) => {
  const [tab, setTab] = useState<Tab>('datos');
  const [guardando, setGuardando] = useState(false);

  // Bloquear scroll del body mientras se abre el modal
  useBodyScroll(true);

  // Estado local editable para el select — no se persiste hasta "Guardar cambios"
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoOperacion | null>(null);

  // Datos del inmueble asociado
  const [inmuebleData, setInmuebleData] = useState<any>(null);
  const [cargandoInmueble, setCargandoInmueble] = useState(false);

  useEffect(() => {
    if (tab !== 'inmueble' || !operacion?.inmuebleId) return;
    let cancelado = false;
    setCargandoInmueble(true);
    api.get(`/inmuebles/${operacion.inmuebleId}/detalle`)
      .then(res => { if (!cancelado) setInmuebleData(res.data); })
      .catch(() => {
        if (!cancelado) api.get(`/inmuebles/${operacion.inmuebleId}`)
          .then(res => { if (!cancelado) setInmuebleData(res.data); })
          .catch(() => { if (!cancelado) setInmuebleData(null); });
      })
      .finally(() => { if (!cancelado) setCargandoInmueble(false); });
    return () => { cancelado = true; };
  }, [tab, operacion?.inmuebleId]);

  if (loading || !operacion) {
    return (
      <div className="form-modal show">
        <div className="form-modal__content">
          <p className="text-soft">Cargando expediente...</p>
        </div>
      </div>
    );
  }

  const isVenta   = operacion.categoria_operacion === 'VENTA';
  const venta     = isVenta ? (operacion as any) : null;
  const alquiler  = !isVenta ? (operacion as any) : null;

  // Inicializar estadoSeleccionado la primera vez que operacion esté disponible
  const estadoActivo = estadoSeleccionado ?? operacion.estadoActual;

  const interesadosEntries = Object.entries(operacion.compradoresRol);

  const procesarAccion = async (
    accionFn: () => Promise<void>,
    msgExito: string,
    debeCerrar = false,
  ) => {
    setGuardando(true);
    try {
      await accionFn();
      toast.success(msgExito);
      if (debeCerrar) onCerrar();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'No se pudo completar la acción.';
      toast.error(`Error: ${msg}`);
    } finally {
      setGuardando(false);
    }
  };

  const guardarEstado = () => {
    procesarAccion(
      () => onActualizarEstado(operacion.id, estadoActivo),
      `Estado actualizado a: ${ETIQUETA_ESTADO[estadoActivo]}`,
    );
  };

  const manejarEliminar = () => {
    if (!confirm('¿Eliminar este expediente permanentemente? Esta acción no se puede deshacer.')) return;
    procesarAccion(
      () => onEliminar(operacion.id),
      'Expediente eliminado correctamente.',
      true,
    );
  };

  return (
    <div className="form-modal show">
      <div className="form-modal__content">

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Operación #{operacion.id}</h2>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
              {isVenta ? 'Compraventa' : 'Arrendamiento'} · Ref. {operacion.inmuebleReferencia}
            </p>
          </div>
          <div className="modal-badges">
            <Badge
              text={isVenta ? 'VENTA' : 'ALQUILER'}
              color={isVenta ? 'blue' : 'amber'}
            />
            <Badge
              text={ETIQUETA_ESTADO[operacion.estadoActual]}
              color={COLOR_ESTADO[operacion.estadoActual]}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" role="tablist">
          {(['datos', 'inmueble', 'interesados'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {{
                datos:       'Operación',
                inmueble:    'Inmueble',
                interesados: `Interesados${interesadosEntries.length > 0 ? ` (${interesadosEntries.length})` : ''}`,
              }[t]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="form-modal__body">

          {/* ── PESTAÑA OPERACIÓN ── */}
          {tab === 'datos' && (
            <>
              <div className="form-row">
                <Field label="Tipo de operación">
                  <input type="text" readOnly value={isVenta ? 'Compraventa' : 'Arrendamiento'} />
                </Field>
                <Field label="Precio acordado (€)">
                  <input type="text" readOnly value={operacion.precioAcordado.toLocaleString('es-ES')} />
                </Field>
              </div>

              <Field label="Estado del expediente">
                <select
                  value={estadoActivo}
                  disabled={guardando}
                  onChange={e => setEstadoSeleccionado(e.target.value as EstadoOperacion)}
                >
                  {(Object.keys(ETIQUETA_ESTADO) as EstadoOperacion[]).map(e => (
                    <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>
                  ))}
                </select>
              </Field>

              {/* Datos específicos de venta */}
              {isVenta && (
                <>
                  <div className="form-row">
                    <Field label="Depósito de arras (€)">
                      <input
                        type="text"
                        readOnly
                        value={venta.depositoArras != null
                          ? Number(venta.depositoArras).toLocaleString('es-ES')
                          : 'No especificado'}
                      />
                    </Field>
                    <Field label="Fecha límite escritura">
                      <input
                        type="text"
                        readOnly
                        value={venta.fechaLimiteEscritura ?? 'No especificada'}
                      />
                    </Field>
                  </div>
                  <Field label="¿Incluye mobiliario?">
                    <input type="text" readOnly value={venta.incluyeMobiliario ? 'Sí' : 'No'} />
                  </Field>
                </>
              )}

              {/* Datos específicos de alquiler */}
              {!isVenta && (
                <>
                  <div className="form-row">
                    <Field label="Fianza (€)">
                      <input
                        type="text"
                        readOnly
                        value={alquiler.fianza != null
                          ? Number(alquiler.fianza).toLocaleString('es-ES')
                          : 'No especificada'}
                      />
                    </Field>
                    <Field label="Duración del contrato">
                      <input
                        type="text"
                        readOnly
                        value={alquiler.duracionMeses != null
                          ? `${alquiler.duracionMeses} meses`
                          : 'No especificada'}
                      />
                    </Field>
                  </div>
                  <Field label="¿Admite mascotas?">
                    <input type="text" readOnly value={alquiler.admiteMascotas ? 'Sí' : 'No'} />
                  </Field>
                </>
              )}

              <div className="form-actions">
                <button
                  onClick={guardarEstado}
                  disabled={guardando}
                  className="btn btn-primary"
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}

          {/* ── PESTAÑA INMUEBLE ── */}
          {tab === 'inmueble' && (
            <>
              {cargandoInmueble ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>Cargando inmueble...</div>
              ) : inmuebleData ? (
                <div style={{
                  border: '1.5px solid var(--color-border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'var(--color-surface)',
                }}>
                  {/* Imagen portada */}
                  {inmuebleData.imagenes?.find((img: any) => img.esPortada)?.url && (
                    <img
                      src={inmuebleData.imagenes.find((img: any) => img.esPortada).url}
                      alt={inmuebleData.titulo}
                      style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                    />
                  )}
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>
                          {inmuebleData.titulo}
                        </h3>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-soft)' }}>
                          Ref. {inmuebleData.referencia} · {inmuebleData.ciudad}
                          {inmuebleData.zona ? ` · ${inmuebleData.zona}` : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                        <Badge text={inmuebleData.estado} color={inmuebleData.estado === 'DISPONIBLE' ? 'green' : inmuebleData.estado === 'RESERVADO' ? 'amber' : 'gray'} />
                        <Badge text={inmuebleData.operacion} color={inmuebleData.operacion === 'VENTA' ? 'blue' : 'amber'} />
                      </div>
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem',
                      borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem',
                    }}>
                      <div><span style={{ fontSize: '0.75rem', color: 'var(--color-text-soft)' }}>Precio</span>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}>
                          {new Intl.NumberFormat('es-ES').format(inmuebleData.precio)} €
                        </p>
                      </div>
                      {inmuebleData.habitaciones != null && (
                        <div><span style={{ fontSize: '0.75rem', color: 'var(--color-text-soft)' }}>Habitaciones</span>
                          <p style={{ margin: 0, fontWeight: 600 }}>{inmuebleData.habitaciones}</p>
                        </div>
                      )}
                      {inmuebleData.banos != null && (
                        <div><span style={{ fontSize: '0.75rem', color: 'var(--color-text-soft)' }}>Baños</span>
                          <p style={{ margin: 0, fontWeight: 600 }}>{inmuebleData.banos}</p>
                        </div>
                      )}
                      {inmuebleData.superficieUtil != null && (
                        <div><span style={{ fontSize: '0.75rem', color: 'var(--color-text-soft)' }}>Superficie útil</span>
                          <p style={{ margin: 0, fontWeight: 600 }}>{inmuebleData.superficieUtil} m²</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-box">
                  No se pudo cargar la información del inmueble (Ref. {operacion.inmuebleReferencia}).
                </div>
              )}
            </>
          )}

          {/* ── PESTAÑA INTERESADOS ── */}
          {tab === 'interesados' && (
            <>
              {interesadosEntries.length === 0 ? (
                <div className="info-box">
                  No hay interesados registrados en esta operación.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {interesadosEntries.map(([id, rol]) => (
                    <div
                      key={id}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.75rem 1rem', borderRadius: '6px',
                        border: '1px solid #dee2e6', backgroundColor: '#f8f9fa',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Interesado</span>
                        <code style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#495057' }}>#{id}</code>
                      </div>
                      <Badge
                        text={ETIQUETA_ROL[rol as RolParticipante] ?? rol}
                        color="blue"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={manejarEliminar} disabled={guardando} className="btn btn-danger">
            Eliminar expediente
          </button>
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};
