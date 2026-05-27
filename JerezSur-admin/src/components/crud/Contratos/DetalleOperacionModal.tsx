import type { OperacionDetalle, EstadoOperacion } from '../../../types/operacion';

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
    <div className="modal-backdrop" style={{ background: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
          <h2>Expediente Jurídico: EXP-{operacion.id}</h2>
          <button onClick={onCerrar}>❌</button>
        </header>

        <section style={{ margin: '15px 0' }}>
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

        {/* --- RENDERIZADO CONDICIONAL DE HERENCIA --- */}
        {operacion.categoria_operacion === 'VENTA' ? (
          <fieldset style={{ borderColor: '#007bff', marginBottom: '15px' }}>
            <legend style={{ color: '#007bff', fontWeight: 'bold' }}>✍️ Detalles Específicos de Compraventa</legend>
            <p>Maneja cláusulas específicas de liquidación patrimonial y escrituras.</p>
            {operacion.importeArras && <p><strong>Depósito de Arras:</strong> {operacion.importeArras} €</p>}
          </fieldset>
        ) : (
          <fieldset style={{ borderColor: '#28a745', marginBottom: '15px' }}>
            <legend style={{ color: '#28a745', fontWeight: 'bold' }}>🔑 Detalles Específicos de Arrendamiento</legend>
            <p><strong>Garantías (Meses de Fianza):</strong> {operacion.fianzaMeses} meses</p>
            <p><strong>Comunidad incluida en mensualidad:</strong> {operacion.incluyeGastosComunidad ? 'Sí' : 'No'}</p>
          </fieldset>
        )}

        {/* Listado de Documentos Digitalizados */}
        <fieldset style={{ marginBottom: '15px' }}>
          <legend>📁 Contratos, Anexos y Avales Firmados</legend>
          {operacion.documentos && operacion.documentos.length > 0 ? (
            <ul>
              {operacion.documentos.map((doc) => (
                <li key={doc.id} style={{ margin: '5px 0' }}>
                  <strong>{doc.tipoDocumento}:</strong> <a href={doc.urlArchivo} target="_blank" rel="noreferrer">📥 Descargar documento</a> 
                  <span style={{ color: '#888' }}> ({doc.fechaFirma})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#e67e22' }}>⚠️ No hay contratos PDFs cargados para este expediente todavía.</p>
          )}
        </fieldset>

        <footer style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button 
            onClick={async () => { if(confirm('¿Archivar y eliminar este expediente permanentemente?')) { await onEliminar(operacion.id); onCerrar(); } }} 
            style={{ background: 'red', color: 'white' }}
          >
            Eliminar Expediente
          </button>
          <button onClick={onCerrar}>Cerrar</button>
        </footer>
      </div>
    </div>
  );
};