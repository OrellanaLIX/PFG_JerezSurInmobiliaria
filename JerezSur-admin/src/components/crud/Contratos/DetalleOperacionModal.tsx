import type { OperacionDetalle, EstadoOperacion } from '../../../types/operacion';
import '../../../styles/App.scss';

interface Props {
  operacion: OperacionDetalle;
  loading: boolean;
  onCerrar: () => void;
  onActualizar: (id: number, data: Partial<OperacionDetalle>) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
}

export const DetalleOperacionModal = ({ operacion, loading, onCerrar, onActualizar, onEliminar }: Props) => {
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