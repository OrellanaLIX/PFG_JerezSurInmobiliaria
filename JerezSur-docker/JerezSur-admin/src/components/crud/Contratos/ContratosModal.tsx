// Modal que lista los contratos de una operación y permite crear nuevos.
// Usa la API para cargar el listado de trabajadores como selector dinámico.
import { useState, useEffect } from 'react';
import type { OperacionBase, ContratoDetalle, CrearContratoData, ModeloContrato } from '../../../types/operacion';
import { contratoService } from '../../../services/contratoService';
import { descargarPdfCifrado } from '../Inmuebles/_shared';
import api from '../../../services/api';
import '../../../styles/App.scss';

interface Props {
  operacion: OperacionBase;
  onCerrar: () => void;
}

const MODELO_LABEL: Record<string, string> = {
  ARRAS: 'Contrato de arras',
  ALQUILER_VIVIENDA: 'Arrendamiento de vivienda (LAU)',
};

const ESTADO_LABEL: Record<string, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_FIRMA: 'Pendiente de firma',
  FIRMADO: 'Firmado',
  CANCELADO: 'Cancelado',
};

const hoy = () => new Date().toISOString().slice(0, 10);

interface TrabajadorSimple { id: number; cargo: string; usuario?: { nombre?: string; email?: string } }

export const ContratosModal = ({ operacion, onCerrar }: Props) => {
  const [contratos, setContratos] = useState<ContratoDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  // Contrato seleccionado para ver sus detalles al clicar en la fila
  const [contratoDetalle, setContratoDetalle] = useState<ContratoDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trabajadores, setTrabajadores] = useState<TrabajadorSimple[]>([]);

  const [form, setForm] = useState<CrearContratoData>({
    modelo: operacion.categoria_operacion === 'ALQUILER' ? 'ALQUILER_VIVIENDA' : 'ARRAS',
    fechaFirma: hoy(),
    clausulasEspeciales: '',
    trabajadorId: undefined,
  });

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setContratos(await contratoService.listarPorOperacion(operacion.id));
    } catch {
      setError('No se pudieron cargar los contratos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [operacion.id]);

  // Carga la lista de trabajadores para el selector del formulario de contrato
  useEffect(() => {
    api.get('/trabajadores?size=50&sortBy=id&sortDir=asc')
      .then(r => setTrabajadores(r.data?.content ?? []))
      .catch(() => setTrabajadores([]));
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await contratoService.generarBorrador(operacion.id, {
        ...form,
        clausulasEspeciales: form.clausulasEspeciales?.trim() || undefined,
        trabajadorId: form.trabajadorId || undefined,
      });
      setMostrarForm(false);
      setForm({
        modelo: operacion.categoria_operacion === 'ALQUILER' ? 'ALQUILER_VIVIENDA' : 'ARRAS',
        fechaFirma: hoy(),
        clausulasEspeciales: '',
        trabajadorId: undefined,
      });
      await cargar();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al crear el contrato.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="form-modal show">
      <div className="form-modal__backdrop" onClick={onCerrar} />
      <div className="form-modal__content" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>

        <div className="form-modal__header">
          <h2>Contratos — EXP-{operacion.id}</h2>
          <button className="btn btn-ghost" onClick={onCerrar}>✕</button>
        </div>

        <div className="form-modal__body">
          {error && <p style={{ color: 'var(--color-danger, #c0392b)', marginBottom: '0.75rem' }}>{error}</p>}

          {/* ---- LISTA DE CONTRATOS ---- */}
          {cargando ? (
            <p className="text-soft">Cargando contratos...</p>
          ) : contratos.length === 0 ? (
            <p className="text-soft">No hay contratos registrados para este expediente.</p>
          ) : (
            <div className="data-table" style={{ marginBottom: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Modelo</th>
                    <th>Estado</th>
                    <th>Fecha firma</th>
                    <th>Cláusulas</th>
                    <th>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {contratos.map(c => (
                    <tr key={c.id}
                        onClick={() => setContratoDetalle(c)}
                        style={{ cursor: 'pointer' }}
                        title="Clic para ver detalles del contrato">
                      <td><code>{c.id}</code></td>
                      <td>{MODELO_LABEL[c.modelo] ?? c.modelo}</td>
                      <td>{ESTADO_LABEL[c.estado] ?? c.estado}</td>
                      <td>{c.fechaFirma}</td>
                      <td>
                        {c.urlDocumentoPdf ? (
                          <button type="button"
                            onClick={e => { e.stopPropagation(); descargarPdfCifrado(c.urlDocumentoPdf!); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer',
                              color: '#0d6efd', textDecoration: 'underline', padding: 0 }}>
                            🔒 PDF
                          </button>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ---- FORMULARIO NUEVO CONTRATO ---- */}
          {mostrarForm ? (
            <form onSubmit={handleCrear}>
              <p className="section-title" style={{ marginTop: '1rem' }}>Nuevo contrato</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Modelo *</label>
                  <select
                    value={form.modelo}
                    onChange={e => setForm(f => ({ ...f, modelo: e.target.value as ModeloContrato }))}
                    required
                  >
                    <option value="ARRAS">Contrato de arras</option>
                    <option value="ALQUILER_VIVIENDA">Arrendamiento de vivienda (LAU)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de firma *</label>
                  <input
                    type="date"
                    required
                    value={form.fechaFirma}
                    onChange={e => setForm(f => ({ ...f, fechaFirma: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Cláusulas especiales</label>
                <textarea
                  rows={4}
                  placeholder="Dejar vacío para usar las cláusulas estándar del modelo..."
                  value={form.clausulasEspeciales}
                  onChange={e => setForm(f => ({ ...f, clausulasEspeciales: e.target.value }))}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label>Trabajador responsable (opcional)</label>
                <select
                  value={form.trabajadorId ?? ''}
                  onChange={e => setForm(f => ({ ...f, trabajadorId: e.target.value ? Number(e.target.value) : undefined }))}
                >
                  <option value="">— Sin asignar —</option>
                  {trabajadores.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.usuario?.nombre || t.usuario?.email || `Trabajador #${t.id}`}
                      {t.cargo ? ` · ${t.cargo}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => setMostrarForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Crear contrato'}
                </button>
              </div>
            </form>
          ) : (
            <button className="btn btn-secondary" onClick={() => setMostrarForm(true)}>
              + Nuevo contrato
            </button>
          )}
        </div>

        <div className="form-modal__footer">
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>

      {/* Panel de detalles del contrato seleccionado */}
      {contratoDetalle && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300,
        }} onClick={() => setContratoDetalle(null)}>
          <div style={{
            background: 'white', borderRadius: 14, padding: '1.75rem',
            maxWidth: 520, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#00439c' }}>Contrato #{contratoDetalle.id}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                  {MODELO_LABEL[contratoDetalle.modelo] ?? contratoDetalle.modelo}
                </p>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                background: contratoDetalle.estado === 'FIRMADO' ? 'rgba(46,155,77,0.12)' :
                            contratoDetalle.estado === 'PENDIENTE_FIRMA' ? 'rgba(230,167,0,0.12)' :
                            contratoDetalle.estado === 'CANCELADO' ? 'rgba(217,83,79,0.12)' : 'rgba(107,114,128,0.1)',
                color: contratoDetalle.estado === 'FIRMADO' ? '#1e7a3a' :
                       contratoDetalle.estado === 'PENDIENTE_FIRMA' ? '#b07f00' :
                       contratoDetalle.estado === 'CANCELADO' ? '#a32522' : '#6b7280',
              }}>
                {ESTADO_LABEL[contratoDetalle.estado] ?? contratoDetalle.estado}
              </span>
            </div>

            {/* Campos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Fecha de firma</label>
                <p style={{ margin: 0, fontWeight: 600 }}>{contratoDetalle.fechaFirma || '—'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Documento PDF</label>
                {contratoDetalle.urlDocumentoPdf ? (
                  <button type="button" onClick={() => descargarPdfCifrado(contratoDetalle.urlDocumentoPdf!)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0d6efd',
                      textDecoration: 'underline', padding: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                    🔒 Ver documento
                  </button>
                ) : (
                  <p style={{ margin: 0, color: '#94a3b8' }}>Sin documento</p>
                )}
              </div>
            </div>

            {contratoDetalle.clausulasEspeciales && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Cláusulas especiales</label>
                <p style={{ margin: 0, background: '#f8fafc', padding: '0.75rem', borderRadius: 8,
                  fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {contratoDetalle.clausulasEspeciales}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setContratoDetalle(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
