// Tabla de operaciones inmobiliarias del panel admin: muestra las compraventas y alquileres en curso.
import type { OperacionBase, EstadoOperacion } from '../../../types/operacion';
import '../../../styles/App.scss';

interface Props {
  operaciones: OperacionBase[];
  onVerDetalle: (id: number) => void;
  onVerContratos: (id: number) => void;
  onCambiarEstado: (operacion: OperacionBase, estado: EstadoOperacion) => void;
}

export const TablaOperaciones = ({ operaciones, onVerDetalle, onVerContratos, onCambiarEstado }: Props) => {
  if (operaciones.length === 0) {
    return <p className="text-soft" style={{ textAlign: 'center', padding: '2rem' }}>No hay operaciones que mostrar.</p>;
  }

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>Expediente</th>
            <th>Inmueble</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {operaciones.map(o => (
            <tr key={o.id}>
              <td><code>EXP-{o.id}</code></td>
              <td><strong>{o.inmuebleReferencia}</strong></td>
              <td>
                <span className={`badge badge-${o.categoria_operacion.toLowerCase()}`}>
                  {o.categoria_operacion}
                </span>
              </td>
              <td>{o.precioAcordado.toLocaleString('es-ES')} €</td>
              <td>
                <select
                  value={o.estadoActual}
                  onChange={e => onCambiarEstado(o, e.target.value as EstadoOperacion)}
                >
                  <option value="ABIERTA">⚪ Abierta</option>
                  <option value="EN_TRAMITE">🟡 En Trámite</option>
                  <option value="CERRADA">🟢 Cerrada</option>
                  <option value="CANCELADA">🔴 Cancelada</option>
                </select>
              </td>
              <td className="actions-cell">
                <button className="btn btn-ghost" onClick={() => onVerDetalle(o.id)}>
                  Ver expediente
                </button>
                <button className="btn btn-secondary" onClick={() => onVerContratos(o.id)}>
                  Contratos
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
