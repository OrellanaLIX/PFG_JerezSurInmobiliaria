import type { Usuario } from '../../../types/usuario';

interface Props {
  usuarios: Usuario[];
  onVerDetalle: (id: number) => void;
  onToggleActivo: (usuario: Usuario) => void; // Recibe el usuario completo
}

export const TablaUsuarios = ({ usuarios, onVerDetalle, onToggleActivo }: Props) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
          <th>Nombre</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id} style={{ borderBottom: '1px solid #eee', height: '45px' }}>
            <td>{u.nombre} {u.apellidos}</td>
            <td>{u.role}</td>
            <td>
              <button 
                onClick={() => onToggleActivo(u)} // Enviamos todo el objeto usuario
                style={{ backgroundColor: u.cuentaActivada ? '#d4edda' : '#f8d7da' }}
              >
                {u.cuentaActivada ? '🟢 Activo' : '🔴 Suspendido'}
              </button>
            </td>
            <td>
              <button onClick={() => onVerDetalle(u.id)}>🔍 Ver Detalles</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};