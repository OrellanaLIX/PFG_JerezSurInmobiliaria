import type { MensajeContactoDetalle } from '../../../types/contacto';

interface Props {
  contacto: MensajeContactoDetalle;
  loading: boolean;
  onCerrar: () => void;
  onEliminar: (id: number) => Promise<void>;
}

export const DetalleContactoModal = ({ contacto, loading, onCerrar, onEliminar }: Props) => {
  if (loading) return <div className="modal"><p>Abriendo buzón de entrada...</p></div>;

  return (
    <div className="modal-backdrop" style={{ background: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', maxWidth: '550px', width: '100%' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
          <h2>Consulta de {contacto.nombre}</h2>
          <button onClick={onCerrar}>❌</button>
        </header>

        <section style={{ margin: '15px 0' }}>
          <p><strong>Email:</strong> <a href={`mailto:${contacto.email}`}>{contacto.email}</a></p>
          {contacto.telefono && <p><strong>Teléfono:</strong> {contacto.telefono}</p>}
          <p style={{ color: '#888' }}><small>Recibido el: {new Date(contacto.fechaEnvio).toLocaleString('es-ES')}</small></p>
        </section>

        {/* Mensaje o consulta real de la BD */}
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #007bff', margin: '20px 0', whiteSpace: 'pre-line' }}>
          <strong>Mensaje original:</strong>
          <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#333' }}>"{contacto.mensaje}"</p>
        </div>

        {/* Renderizado condicional si pregunta por un Inmueble concreto */}
        {contacto.inmueble ? (
          <fieldset style={{ borderColor: '#28a745', background: '#f6fff8' }}>
            <legend style={{ color: '#28a745', fontWeight: 'bold' }}>🏠 Inmueble Solicitado</legend>
            <p><strong>Referencia:</strong> <code>{contacto.inmueble.referencia}</code></p>
            <p><strong>Propiedad:</strong> {contacto.inmueble.titulo}</p>
            <p><strong>Precio del Catálogo:</strong> {contacto.inmueble.precio.toLocaleString('es-ES')} €</p>
          </fieldset>
        ) : (
          <p style={{ color: '#666', fontStyle: 'italic' }}>ℹ️ Consulta de tipo general (No asociada a ningún inmueble específico).</p>
        )}

        <footer style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button 
            onClick={async () => { if(confirm('¿Eliminar esta consulta permanentemente?')) { await onEliminar(contacto.id); onCerrar(); } }} 
            style={{ background: 'red', color: 'white' }}
          >
            🗑️ Eliminar Mensaje
          </button>
          <button onClick={onCerrar}>Cerrar Ventana</button>
        </footer>
      </div>
    </div>
  );
};