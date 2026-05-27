import type { InmuebleDetalle, EstadoInmueble } from '../../../types/inmueble';

interface Props {
  inmueble: InmuebleDetalle;
  loading: boolean;
  onCerrar: () => void;
  onActualizar: (id: number, data: Partial<InmuebleDetalle>) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
}

export const DetalleInmuebleModal = ({ inmueble, loading, onCerrar, onActualizar, onEliminar }: Props) => {
  if (loading) return <div className="modal"><p>Cargando documentación y cargas del inmueble...</p></div>;

  const handleCambiarEstado = async (nuevoEstado: EstadoInmueble) => {
    const clon = { ...inmueble, estado: nuevoEstado };
    // Eliminamos arrays pesados de la respuesta para el PUT plano
    delete (clon as any).imagenes;
    await onActualizar(inmueble.id, clon);
  };

  return (
    <div className="modal-backdrop" style={{ background: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
          <h2>Ficha de Propiedad: {inmueble.referencia}</h2>
          <button onClick={onCerrar}>❌</button>
        </header>

        <section style={{ margin: '15px 0' }}>
          <h3>{inmueble.titulo}</h3>
          <p style={{ color: '#555' }}>{inmueble.descripcion || 'Sin descripción pública.'}</p>
        </section>

        {/* Cargas Financieras (Para contrato de Arras) */}
        <fieldset style={{ marginBottom: '15px', borderColor: '#ffc107' }}>
          <legend style={{ color: '#856404', fontWeight: 'bold' }}>💶 Gastos y Cargas Anuales</legend>
          <p><strong>Gastos de Comunidad:</strong> {inmueble.comunidad} €/mes</p>
          <p><strong>IBI (Impuesto Anual):</strong> {inmueble.ibi} €/año</p>
          <p><strong>¿Tiene Derrama en curso?:</strong> {inmueble.tieneDerrama ? `Sí (${inmueble.valorDerrama} €)` : 'No'}</p>
        </fieldset>

        {/* Documentación Interna (Solo asesores) */}
        <fieldset style={{ marginBottom: '15px', borderColor: '#17a2b8' }}>
          <legend style={{ color: '#0f6674', fontWeight: 'bold' }}>📋 Documentación y Datos Privados</legend>
          <p><strong>Referencia Catastral:</strong> <code>{inmueble.refCatastral || 'No aportada'}</code></p>
          <p><strong>Nota Simple:</strong> {inmueble.urlNotaSimple ? <a href={inmueble.urlNotaSimple} target="_blank" rel="noreferrer">📄 Descargar PDF</a> : '⚠️ Pendiente de entrega'}</p>
          <p><strong>Certificado Energético:</strong> {inmueble.urlCertificadoEnergetico ? <a href={inmueble.urlCertificadoEnergetico} target="_blank" rel="noreferrer">🟢 Ver Certificado</a> : '⚠️ No aportado'}</p>
          {inmueble.notasPrivadas && (
            <div style={{ background: '#f8d7da', padding: '10px', marginTop: '10px', borderRadius: '4px', color: '#721c24' }}>
              <strong>🔒 Notas internas del asesor:</strong> <br/> {inmueble.notasPrivadas}
            </div>
          )}
        </fieldset>

        {/* Características extra mapeadas */}
        {Object.keys(inmueble.caracteristicasExtra).length > 0 && (
          <fieldset style={{ marginBottom: '15px' }}>
            <legend>⚙️ Características Adicionales</legend>
            <ul>
              {Object.entries(inmueble.caracteristicasExtra).map(([clave, valor]) => (
                <li key={clave}><strong>{clave}:</strong> {valor}</li>
              ))}
            </ul>
          </fieldset>
        )}

        <footer style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button 
            onClick={async () => { if(confirm('¿Eliminar inmueble del sistema?')) { await onEliminar(inmueble.id); onCerrar(); } }} 
            style={{ background: '#dc3545', color: '#fff' }}
          >
            🚨 Eliminar Inmueble
          </button>
          <button onClick={onCerrar}>Cerrar Ficha</button>
        </footer>
      </div>
    </div>
  );
};