import { useState, useEffect } from 'react';
import type { OperacionBase, ContratoDetalle, CrearContratoData, ModeloContrato } from '../../../types/operacion';
import { contratoService } from '../../../services/contratoService';
import { descargarPdfCifrado } from '../Inmuebles/_shared';
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

export const ContratosModal = ({ operacion, onCerrar }: Props) => {
  const [contratos, setContratos] = useState<ContratoDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
                    <tr key={c.id}>
                      <td><code>{c.id}</code></td>
                      <td>{MODELO_LABEL[c.modelo] ?? c.modelo}</td>
                      <td>{ESTADO_LABEL[c.estado] ?? c.estado}</td>
                      <td>{c.fechaFirma}</td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.clausulasEspeciales || '—'}
                      </td>
                      <td>
                        {c.urlDocumentoPdf
                          ? (
                            <button
                              type="button"
                              onClick={() => descargarPdfCifrado(c.urlDocumentoPdf!)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#0d6efd', textDecoration: 'underline', padding: 0,
                                fontSize: 'inherit',
                              }}
                            >
                              🔒 Ver PDF
                            </button>
                          )
                          : '—'}
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
                <label>ID del trabajador responsable (opcional)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Dejar vacío si no aplica"
                  value={form.trabajadorId ?? ''}
                  onChange={e => setForm(f => ({ ...f, trabajadorId: e.target.value ? Number(e.target.value) : undefined }))}
                />
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
    </div>
  );
};
