import type { InmuebleDetalle } from '../../../types/inmueble';
import '../../../styles/App.scss';

interface Props {
  inmueble: InmuebleDetalle;
  loading: boolean;
  onCerrar: () => void;
  onEliminar: (id: number) => Promise<void>;
}

export const DetalleInmuebleModal = ({ inmueble, loading, onCerrar, onEliminar }: Props) => {
  if (loading) return <div className="modal"><p>Cargando documentación y cargas del inmueble...</p></div>;

  return (
    <div className="form-modal">
      <div className="form-modal__backdrop" onClick={onCerrar} />
      <div className="form-modal__content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Ficha de Propiedad: {inmueble.referencia}</h2>
          <button className="btn btn-ghost" onClick={onCerrar}>❌</button>
        </header>

        <section className="modal-body">
          <h3>{inmueble.titulo}</h3>
          <p className="text-soft">{inmueble.descripcion || 'Sin descripción pública.'}</p>
        </section>

        <fieldset className="inmueble-fieldset">
          <legend>💶 Gastos y Cargas Anuales</legend>
          <p><strong>Gastos de Comunidad:</strong> {inmueble.comunidad} €/mes</p>
          <p><strong>IBI (Impuesto Anual):</strong> {inmueble.ibi} €/año</p>
          <p><strong>¿Tiene Derrama en curso?:</strong> {inmueble.tieneDerrama ? `Sí (${inmueble.valorDerrama} €)` : 'No'}</p>
        </fieldset>

        <fieldset className="inmueble-fieldset">
          <legend>📋 Documentación y Datos Privados</legend>
          <p><strong>Referencia Catastral:</strong> <code>{inmueble.refCatastral || 'No aportada'}</code></p>
          <p><strong>Nota Simple:</strong> {inmueble.urlNotaSimple ? <a href={inmueble.urlNotaSimple} target="_blank" rel="noreferrer">📄 Descargar PDF</a> : '⚠️ Pendiente de entrega'}</p>
          <p><strong>Certificado Energético:</strong> {inmueble.urlCertificadoEnergetico ? <a href={inmueble.urlCertificadoEnergetico} target="_blank" rel="noreferrer">🟢 Ver Certificado</a> : '⚠️ No aportado'}</p>
          {inmueble.notasPrivadas && (
            <div className="alert alert-warning">
              <strong>🔒 Notas internas del asesor:</strong> <br/> {inmueble.notasPrivadas}
            </div>
          )}
        </fieldset>

        {Object.keys(inmueble.caracteristicasExtra).length > 0 && (
          <fieldset>
            <legend>⚙️ Características Adicionales</legend>
            <ul>
              {Object.entries(inmueble.caracteristicasExtra).map(([clave, valor]) => (
                <li key={clave}><strong>{clave}:</strong> {valor}</li>
              ))}
            </ul>
          </fieldset>
        )}

        <footer className="modal-footer">
          <button 
            className="btn btn-danger"
            onClick={async () => { if(confirm('¿Eliminar inmueble del sistema?')) { await onEliminar(inmueble.id); onCerrar(); } }} 
          >
            🚨 Eliminar Inmueble
          </button>
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar Ficha</button>
        </footer>
      </div>
    </div>
  );
};