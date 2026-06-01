import type { MensajeContactoDetalle } from '../../../types/contacto';
import '../../../styles/App.scss';

interface Props {
  contacto: MensajeContactoDetalle;
  loading: boolean;
  onCerrar: () => void;
  onEliminar: (id: number) => Promise<void>;
}

export const DetalleContactoModal = ({ contacto, loading, onCerrar, onEliminar }: Props) => {
  if (loading) return <div className="modal"><p>Abriendo buzón de entrada...</p></div>;

  return (
    <div className="form-modal">
      <div className="form-modal__backdrop" onClick={onCerrar} />
      <div className="form-modal__content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Consulta de {contacto.nombre}</h2>
          <button className="btn btn-ghost" onClick={onCerrar}>❌</button>
        </header>

        <section className="modal-body">
          {contacto.email
            ? <p><strong>Email:</strong> <a href={`mailto:${contacto.email}`}>{contacto.email}</a></p>
            : <p className="text-soft"><strong>Email:</strong> —</p>
          }
          {contacto.telefono && (
            <p><strong>Teléfono:</strong>{' '}
              <a href={`tel:${contacto.telefono}`}>{contacto.telefono}</a>
            </p>
          )}
          <p className="text-soft">
            <small>Recibido el: {contacto.fechaEnvio ? new Date(contacto.fechaEnvio).toLocaleString('es-ES') : '—'}</small>
          </p>

          <div className="message-box">
            <strong>Mensaje original:</strong>
            <p className="message-text">"{contacto.mensaje}"</p>
          </div>

          {contacto.inmueble ? (
            <fieldset className="inmueble-fieldset">
              <legend>🏠 Inmueble Solicitado</legend>
              <p><strong>Referencia:</strong> <code>{contacto.inmueble.referencia}</code></p>
              <p><strong>Propiedad:</strong> {contacto.inmueble.titulo}</p>
              <p><strong>Precio del Catálogo:</strong> {contacto.inmueble.precio.toLocaleString('es-ES')} €</p>
            </fieldset>
          ) : (
            <p className="text-soft italic">ℹ️ Consulta de tipo general (No asociada a ningún inmueble específico).</p>
          )}
        </section>

        <footer className="modal-footer">
          <button 
            className="btn btn-danger"
            onClick={async () => { if(confirm('¿Eliminar esta consulta permanentemente?')) { await onEliminar(contacto.id); onCerrar(); } }}
          >
            🗑️ Eliminar Mensaje
          </button>
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar Ventana</button>
        </footer>
      </div>
    </div>
  );
};