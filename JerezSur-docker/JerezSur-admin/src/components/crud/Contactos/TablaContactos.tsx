// Tabla de mensajes de contacto del panel admin con filtros de búsqueda y estado.
// Hacer clic en cualquier fila abre el detalle. El badge de estado permite el toggle sin abrir el detalle.
import type { MensajeContacto } from '../../../types/contacto';
import '../../../styles/App.scss';

interface Props {
  contactos: MensajeContacto[];
  onVerDetalle: (id: number) => void;
  onToggleLeido: (contacto: MensajeContacto) => void;
}

const BadgeEstado = ({ leido }: { leido: boolean }) => (
  <span className={`badge badge--${leido ? 'green' : 'amber'}`}>
    {leido ? 'Leído' : 'Pendiente'}
  </span>
);

export const TablaContactos = ({ contactos, onVerDetalle, onToggleLeido }: Props) => {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th style={{ width: 16 }}></th>
            <th>Remitente</th>
            <th>Contacto</th>
            <th>Fecha de Envío</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {contactos.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                No hay mensajes de contacto que mostrar.
              </td>
            </tr>
          ) : (
            contactos.map((c) => (
              <tr
                key={c.id}
                className={c.leido ? 'row-archived' : 'row-new'}
                style={{
                  cursor: 'pointer',
                  ...(!c.leido ? { borderLeft: '3px solid var(--color-primary, #00439c)' } : {}),
                }}
                onClick={() => onVerDetalle(c.id)}
                title="Ver detalle del mensaje"
              >
                {/* Indicador visual de mensaje nuevo */}
                <td style={{ padding: '0 0 0 0.5rem', verticalAlign: 'middle' }}>
                  {!c.leido && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--color-primary, #00439c)',
                        flexShrink: 0,
                      }}
                      title="Mensaje no leído"
                    />
                  )}
                </td>

                <td style={{ fontWeight: c.leido ? 400 : 700 }}>
                  {c.nombre || '—'}
                </td>

                <td>
                  <div>{c.email || '—'}</div>
                  <small className="text-soft">{c.telefono || 'Sin teléfono'}</small>
                </td>

                <td>
                  {c.fechaEnvio
                    ? new Date(c.fechaEnvio).toLocaleString('es-ES')
                    : '—'}
                </td>

                {/* Badge de estado — stopPropagation para no abrir el detalle al hacer toggle */}
                <td>
                  <span
                    onClick={(e) => { e.stopPropagation(); onToggleLeido(c); }}
                    style={{ cursor: 'pointer' }}
                    title={c.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                  >
                    <BadgeEstado leido={c.leido} />
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
