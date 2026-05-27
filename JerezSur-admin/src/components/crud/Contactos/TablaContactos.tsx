import type { MensajeContacto } from '../../../types/contacto';

interface Props {
  contactos: MensajeContacto[];
  onVerDetalle: (id: number) => void;
  onToggleLeido: (contacto: MensajeContacto) => void;
}

export const TablaContactos = ({ contactos, onVerDetalle, onToggleLeido }: Props) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
          <th>Remitente</th>
          <th>Contacto</th>
          <th>Fecha de Envío</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {contactos.map((c) => (
          <tr 
            key={c.id} 
            style={{ 
              borderBottom: '1px solid #eee', 
              height: '50px',
              backgroundColor: c.leido ? 'transparent' : '#f0f4ff', // Fondo azul ligero si es nuevo
              fontWeight: c.leido ? 'normal' : 'bold'
            }}
          >
            <td>{c.nombre}</td>
            <td>
              <div>{c.email}</div>
              <small style={{ color: '#666' }}>{c.telefono || 'Sin teléfono'}</small>
            </td>
            <td>{new Date(c.fechaEnvio).toLocaleString('es-ES')}</td>
            <td>
              <button 
                onClick={() => onToggleLeido(c)}
                style={{ 
                  background: c.leido ? '#eee' : '#007bff', 
                  color: c.leido ? '#333' : '#fff',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {c.leido ? '📁 Archivado' : '📩 Nuevo'}
              </button>
            </td>
            <td>
              <button onClick={() => onVerDetalle(c.id)}>📖 Leer Mensaje</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};