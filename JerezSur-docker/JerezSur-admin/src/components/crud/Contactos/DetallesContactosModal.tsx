// Modal READ-ONLY con el detalle completo de un mensaje de contacto para el panel admin.
// Muestra la información del remitente, el mensaje y el inmueble vinculado (si aplica).
// El toggle de leído/no leído y el botón de eliminar están en el footer.
import { useState } from 'react';
import { useBodyScroll } from '../../../hooks/useBodyScroll';
import type { MensajeContactoDetalle } from '../../../types/contacto';
import '../../../styles/App.scss';

interface Props {
  contacto: MensajeContactoDetalle;
  loading: boolean;
  onCerrar: () => void;
  onEliminar: (id: number) => Promise<void>;
  onActualizar: (id: number, data: Partial<MensajeContactoDetalle>) => Promise<void>;
}

const Badge = ({ text, color }: { text: string; color: 'blue' | 'green' | 'amber' | 'gray' }) => (
  <span className={`badge badge--${color}`}>{text}</span>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="form-field">
    <label className="form-field__label">{label}</label>
    {children}
  </div>
);

export const DetalleContactoModal = ({ contacto, loading, onCerrar, onEliminar, onActualizar }: Props) => {
  const [guardando, setGuardando] = useState(false);
  
  // Bloquear scroll del body mientras se abre el modal
  useBodyScroll(true);

  if (loading) return (
    <div className="form-modal show">
      <div className="form-modal__content">
        <p className="text-soft">Abriendo buzón de entrada...</p>
      </div>
    </div>
  );

  const manejarToggleLeido = async () => {
    setGuardando(true);
    try {
      await onActualizar(contacto.id, { leido: !contacto.leido });
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminar = async () => {
    if (!confirm('¿Eliminar esta consulta permanentemente? Esta acción no se puede deshacer.')) return;
    setGuardando(true);
    try {
      await onEliminar(contacto.id);
      onCerrar();
    } finally {
      setGuardando(false);
    }
  };

  const fechaFormateada = contacto.fechaEnvio
    ? new Date(contacto.fechaEnvio).toLocaleString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <div className="form-modal show">
      <div className="form-modal__content">

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Consulta de {contacto.nombre}</h2>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>{fechaFormateada}</p>
          </div>
          <div className="modal-badges">
            <Badge
              text={contacto.leido ? 'Leído' : 'Pendiente'}
              color={contacto.leido ? 'green' : 'amber'}
            />
            {contacto.inmueble && <Badge text="Con inmueble" color="blue" />}
          </div>
        </div>

        {/* Body — solo lectura, sin tabs */}
        <div className="form-modal__body">
          <div className="form-row">
            <Field label="Nombre del remitente">
              <input
                type="text"
                value={contacto.nombre ?? ''}
                readOnly
                disabled
              />
            </Field>
            <Field label="Fecha de recepción">
              <input
                type="text"
                value={fechaFormateada}
                readOnly
                disabled
              />
            </Field>
          </div>

          <div className="form-row">
            <Field label="Email">
              {contacto.email ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="email" value={contacto.email} readOnly disabled />
                  <a
                    href={`mailto:${contacto.email}`}
                    className="btn btn-ghost"
                    style={{ flexShrink: 0, fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    title="Enviar correo"
                  >
                    Escribir
                  </a>
                </div>
              ) : (
                <input type="text" value="Sin email" readOnly disabled />
              )}
            </Field>
            <Field label="Teléfono">
              {contacto.telefono ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="tel" value={contacto.telefono} readOnly disabled />
                  <a
                    href={`tel:${contacto.telefono}`}
                    className="btn btn-ghost"
                    style={{ flexShrink: 0, fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    title="Llamar"
                  >
                    Llamar
                  </a>
                </div>
              ) : (
                <input type="text" value="Sin teléfono" readOnly disabled />
              )}
            </Field>
          </div>

          <Field label="Mensaje del cliente">
            <div className="message-box">
              <p className="message-text">"{contacto.mensaje}"</p>
            </div>
          </Field>

          {contacto.inmueble ? (
            <fieldset className="inmueble-fieldset">
              <legend>Inmueble vinculado a la consulta</legend>
              <div className="form-row">
                <Field label="Referencia">
                  <input type="text" value={contacto.inmueble.referencia} readOnly disabled />
                </Field>
                <Field label="Precio">
                  <input
                    type="text"
                    value={`${contacto.inmueble.precio.toLocaleString('es-ES')} €`}
                    readOnly
                    disabled
                  />
                </Field>
              </div>
              <Field label="Título del inmueble">
                <input type="text" value={contacto.inmueble.titulo} readOnly disabled />
              </Field>
            </fieldset>
          ) : (
            <div className="info-box">
              Consulta de tipo general — no está asociada a ningún inmueble específico.
            </div>
          )}
        </div>

        {/* Footer: [Toggle leído | Eliminar] [Cerrar] */}
        <div className="modal-footer">
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={manejarToggleLeido}
              disabled={guardando}
              className={`btn ${contacto.leido ? 'btn-ghost' : 'btn-secondary'}`}
              title={contacto.leido ? 'Marcar como no leído' : 'Marcar como leído'}
            >
              {guardando ? 'Guardando...' : contacto.leido ? 'Marcar no leído' : 'Marcar leído'}
            </button>
            <button
              onClick={manejarEliminar}
              disabled={guardando}
              className="btn btn-danger"
            >
              Eliminar
            </button>
          </div>
          <div>
            <button onClick={onCerrar} className="btn btn-ghost">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
