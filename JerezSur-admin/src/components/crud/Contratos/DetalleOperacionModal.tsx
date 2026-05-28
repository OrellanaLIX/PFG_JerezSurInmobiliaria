import type { OperacionDetalle, EstadoOperacion } from '../../../types/operacion';
import '../../../styles/App.scss';
import { useState } from 'react';
import { contratoService } from '../../../services/contratoService';
import { useAuth } from '../../../context/AuthContext';

interface Props {
  operacion: OperacionDetalle;
  loading: boolean;
  onCerrar: () => void;
  onActualizar: (id: number, data: Partial<OperacionDetalle>) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
  onSubirDocumento?: (contratoId: number, archivo: File) => Promise<void>;
}

export const DetalleOperacionModal = ({ operacion, loading, onCerrar, onActualizar, onEliminar, onSubirDocumento }: Props) => {
  const { user } = useAuth();
  const [modeloContrato, setModeloContrato] = useState<string>('ARRAS');
  if (loading) return <div className="modal"><p>Cargando documentación y anexos jurídicos...</p></div>;

  const handleCambiarEstado = async (nuevoEstado: EstadoOperacion) => {
    const clon = { ...operacion, estadoActual: nuevoEstado };
    delete (clon as any).documentos; // Quitamos arrays pesados para el PUT
    await onActualizar(operacion.id, clon);
  };

  return (
    <div className="form-modal">
      <div className="form-modal__backdrop" onClick={onCerrar} />
      <div className="form-modal__content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Expediente Jurídico: EXP-{operacion.id}</h2>
          <button className="btn btn-ghost" onClick={onCerrar}>❌</button>
        </header>

        <section className="modal-body">
          <p><strong>Inmueble Vinculado:</strong> Propiedad con Ref {operacion.inmuebleReferencia}</p>
          <p><strong>Precio en Contrato:</strong> {operacion.precioAcordado.toLocaleString('es-ES')} €</p>
          <p><strong>Tipo de Negocio:</strong> {operacion.tipo}</p>
          
          <label><strong>Estado Legal:</strong> </label>
          <select value={operacion.estadoActual} onChange={(e) => handleCambiarEstado(e.target.value as EstadoOperacion)}>
            <option value="ABIERTA">Abierta / Estudio</option>
            <option value="EN_TRAMITE">En Trámite (Ej: Arras entregadas)</option>
            <option value="CERRADA">Cerrada / Firmada ante Notario</option>
            <option value="CANCELADA">Cancelada / Rescindida</option>
          </select>
        </section>

        {operacion.categoria_operacion === 'VENTA' ? (
          <fieldset className="inmueble-fieldset">
            <legend>✍️ Detalles Específicos de Compraventa</legend>
            <p>Maneja cláusulas específicas de liquidación patrimonial y escrituras.</p>
            {operacion.importeArras && <p><strong>Depósito de Arras:</strong> {operacion.importeArras} €</p>}
          </fieldset>
        ) : (
          <fieldset className="inmueble-fieldset">
            <legend>🔑 Detalles Específicos de Arrendamiento</legend>
            <p><strong>Garantías (Meses de Fianza):</strong> {operacion.fianzaMeses} meses</p>
            <p><strong>Comunidad incluida en mensualidad:</strong> {operacion.incluyeGastosComunidad ? 'Sí' : 'No'}</p>
          </fieldset>
        )}

        <fieldset className="doc-list">
          <legend>📁 Contratos, Anexos y Avales Firmados</legend>
          {operacion.documentos && operacion.documentos.length > 0 ? (
            <ul>
              {operacion.documentos.map((doc) => (
                <li key={doc.id} className="doc-item">
                  <strong>{doc.tipoDocumento}:</strong> <a href={doc.urlArchivo} target="_blank" rel="noreferrer">📥 Descargar documento</a>
                  <span className="text-soft"> ({doc.fechaFirma})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-warning">⚠️ No hay contratos PDFs cargados para este expediente todavía.</p>
          )}
          {/* Subida de PDF (Admin) */}
          {/* Upload to an existing Contrato: use the first documento's id */}
          {operacion.documentos && operacion.documentos.length > 0 && (
            (() => {
              const primerDoc = operacion.documentos![0];
              const contratoId = primerDoc.id;
              return (
                <div className="upload-row">
                  <input id={`file-contrato-${contratoId}`} type="file" accept="application/pdf" />
                  <button
                    className="btn"
                    onClick={async () => {
                      const input = document.getElementById(`file-contrato-${contratoId}`) as HTMLInputElement | null;
                      if (!input || !input.files || input.files.length === 0) return alert('Selecciona un PDF primero');
                      const file = input.files[0];
                      if (!file.name.toLowerCase().endsWith('.pdf')) return alert('Solo se permiten archivos PDF');
                      try {
                        if (onSubirDocumento) {
                          await onSubirDocumento(contratoId, file);
                        } else {
                          const form = new FormData(); form.append('archivo', file);
                          await fetch(`/api/media/contrato/${contratoId}/documento`, { method: 'POST', body: form });
                        }
                        alert('PDF subido correctamente');
                        // refrescar detalles
                        await onActualizar(operacion.id, {});
                      } catch (e: any) {
                        alert('Error subiendo PDF: ' + (e.message || e));
                      }
                    }}
                  >Subir PDF al Contrato existente</button>
                </div>
              );
            })()
          )}
          {(!operacion.documentos || operacion.documentos.length === 0) && (
            <p className="text-soft">Crea primero un borrador de contrato desde la sección de generación para poder adjuntar el PDF.</p>
          )}
            <div style={{marginTop: 12}}>
              <label><strong>Generar borrador de contrato:</strong></label>
              <div className="form-row">
                <select value={modeloContrato} onChange={e => setModeloContrato(e.target.value)}>
                  <option value="ARRAS">Arras / Borrador de Compraventa</option>
                  <option value="COMPRAVENTA">Compraventa</option>
                  <option value="ALQUILER_VIVIENDA">Contrato de Alquiler</option>
                </select>
                <button className="btn" onClick={async () => {
                  try {
                    const trabajador = user ? { id: (user as any).userId } : {};
                    await contratoService.generarBorrador(operacion.id, modeloContrato, trabajador);
                    alert('Borrador generado correctamente');
                    await onActualizar(operacion.id, {});
                  } catch (e: any) {
                    alert('Error generando borrador: ' + (e.message || e));
                  }
                }}>Generar Borrador</button>
              </div>
            </div>
        </fieldset>

        <footer className="modal-footer">
          <button 
            className="btn btn-danger"
            onClick={async () => { if(confirm('¿Archivar y eliminar este expediente permanentemente?')) { await onEliminar(operacion.id); onCerrar(); } }} 
          >
            Eliminar Expediente
          </button>
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
        </footer>
      </div>
    </div>
  );
};