import { useState } from 'react';
import type { OperacionDetalle, EstadoOperacion, RolParticipante } from '../../../types/operacion';
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
  ABIERTA: '⚪ Abierta',
  EN_TRAMITE: '🟡 En Trámite',
  CERRADA: '🟢 Cerrada',
  CANCELADA: '🔴 Cancelada',
};

const ETIQUETA_ROL: Record<RolParticipante, string> = {
  TITULAR: 'Titular',
  APODERADO: 'Apoderado',
  AVALISTA: 'Avalista',
};

export const DetalleOperacionModal = ({ operacion, loading, onCerrar, onActualizarEstado, onEliminar }: Props) => {
  const [tab, setTab] = useState<Tab>('datos');

  if (loading || !operacion) {
    return (
      <div className="form-modal show">
        <div className="form-modal__backdrop" onClick={onCerrar} />
        <div className="form-modal__content" style={{ maxWidth: '480px' }}>
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando expediente...</p>
        </div>
      </div>
    );
  }

  const isVenta = operacion.categoria_operacion === 'VENTA';
  const venta = isVenta ? (operacion as any) : null;
  const alquiler = !isVenta ? (operacion as any) : null;

  return (
    <div className="form-modal show">
      <div className="form-modal__backdrop" onClick={onCerrar} />
      <div className="form-modal__content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>

        <div className="form-modal__header">
          <h2>Expediente EXP-{operacion.id}</h2>
          <button className="btn btn-ghost" onClick={onCerrar}>✕</button>
        </div>

        <div className="form-modal__body">
          <div className="tabs" role="tablist">
            {(['datos', 'inmueble', 'interesados'] as Tab[]).map(t => (
              <button key={t} type="button"
                className={`tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}>
                {{ datos: 'Operación', inmueble: 'Inmueble', interesados: 'Interesados' }[t]}
              </button>
            ))}
          </div>

          {/* ---- PESTAÑA OPERACIÓN ---- */}
          {tab === 'datos' && (
            <div className="detail-panel">
              <p><strong>Tipo:</strong> {operacion.categoria_operacion}</p>
              <p><strong>Precio acordado:</strong> {operacion.precioAcordado.toLocaleString('es-ES')} €</p>

              <div style={{ margin: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>Estado:</strong>
                <select
                  value={operacion.estadoActual}
                  onChange={e => onActualizarEstado(operacion.id, e.target.value as EstadoOperacion)}
                >
                  {(Object.keys(ETIQUETA_ESTADO) as EstadoOperacion[]).map(e => (
                    <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>
                  ))}
                </select>
              </div>

              {isVenta && (
                <fieldset className="inmueble-fieldset">
                  <legend>Datos de compraventa</legend>
                  <p>Depósito de arras: {venta.depositoArras != null ? `${Number(venta.depositoArras).toLocaleString('es-ES')} €` : 'No especificado'}</p>
                  <p>Fecha límite escritura: {venta.fechaLimiteEscritura ?? 'No especificada'}</p>
                  <p>Incluye mobiliario: {venta.incluyeMobiliario ? 'Sí' : 'No'}</p>
                </fieldset>
              )}

              {!isVenta && (
                <fieldset className="inmueble-fieldset">
                  <legend>Datos de arrendamiento</legend>
                  <p>Fianza: {alquiler.fianza != null ? `${Number(alquiler.fianza).toLocaleString('es-ES')} €` : 'No especificada'}</p>
                  <p>Duración: {alquiler.duracionMeses ?? '—'} meses</p>
                  <p>Admite mascotas: {alquiler.admiteMascotas ? 'Sí' : 'No'}</p>
                </fieldset>
              )}
            </div>
          )}

          {/* ---- PESTAÑA INMUEBLE ---- */}
          {tab === 'inmueble' && (
            <div className="detail-panel">
              <p><strong>Referencia:</strong> {operacion.inmuebleReferencia}</p>
              <p><strong>ID inmueble:</strong> {operacion.inmuebleId}</p>
              <p className="text-soft">Para modificar los datos del inmueble ve al módulo de Inmuebles.</p>
            </div>
          )}

          {/* ---- PESTAÑA INTERESADOS ---- */}
          {tab === 'interesados' && (
            <div className="detail-panel">
              {Object.keys(operacion.compradoresRol).length === 0 ? (
                <p className="text-soft">No hay interesados registrados en esta operación.</p>
              ) : (
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr><th>ID Interesado</th><th>Rol</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(operacion.compradoresRol).map(([id, rol]) => (
                      <tr key={id}>
                        <td><code>{id}</code></td>
                        <td>{ETIQUETA_ROL[rol as RolParticipante] ?? rol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>

        <div className="form-modal__footer">
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (confirm('¿Eliminar este expediente permanentemente?')) {
                await onEliminar(operacion.id);
                onCerrar();
              }
            }}
          >
            Eliminar
          </button>
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};
