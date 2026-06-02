// Tabla de mensajes de contacto del panel admin con filtros de búsqueda y estado.
import type { MensajeContacto } from '../../../types/contacto';
import '../../../styles/App.scss';

interface Props {
  contactos: MensajeContacto[];
  onVerDetalle: (id: number) => void;
  onToggleLeido: (contacto: MensajeContacto) => void;
}

export const TablaContactos = ({ contactos, onVerDetalle, onToggleLeido }: Props) => {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>Remitente</th>
            <th>Contacto</th>
            <th>Fecha de Envío</th>
            <th>Estado</th>
            <th>Acciones</th>
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
              <tr key={c.id} className={c.leido ? 'row-archived' : 'row-new'}>
                <td>{c.nombre || '—'}</td>
                <td>
                  <div>{c.email || '—'}</div>
                  <small className="text-soft">{c.telefono || 'Sin teléfono'}</small>
                </td>
                <td>
                  {c.fechaEnvio
                    ? new Date(c.fechaEnvio).toLocaleString('es-ES')
                    : '—'}
                </td>
                <td>
                  <button onClick={() => onToggleLeido(c)} className={c.leido ? 'btn btn-ghost' : 'btn btn-primary'}>
                    {c.leido ? '📁 Archivado' : '📩 Nuevo'}
                  </button>
                </td>
                <td>
                  <button className="btn btn-ghost" onClick={() => onVerDetalle(c.id)}>📖 Leer Mensaje</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};