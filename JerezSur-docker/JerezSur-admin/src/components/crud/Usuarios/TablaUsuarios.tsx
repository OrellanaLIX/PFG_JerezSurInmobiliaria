// Tabla de usuarios del panel admin: lista y permite gestionar todos los usuarios del sistema.
import type { Usuario } from '../../../types/usuario';
import '../../../styles/App.scss';

interface Props {
  usuarios: Usuario[];
  onVerDetalle: (id: number) => void;
  onToggleActivo: (usuario: Usuario) => void; // Recibe el usuario completo
}

export const TablaUsuarios = ({ usuarios, onVerDetalle, onToggleActivo }: Props) => {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className={u.cuentaActivada ? 'row-active' : 'row-inactive'}>
              <td>{u.nombre} {u.apellidos}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => onToggleActivo(u)} className={`badge ${u.cuentaActivada ? 'badge-success' : 'badge-error'}`}>
                  {u.cuentaActivada ? '🟢 Activo' : '🔴 Suspendido'}
                </button>
              </td>
              <td>
                <button className="btn btn-ghost" onClick={() => onVerDetalle(u.id)}>🔍 Ver Detalles</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};