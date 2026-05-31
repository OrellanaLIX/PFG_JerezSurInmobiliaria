import type { OperacionBase, EstadoOperacion } from '../../../types/operacion';
import '../../../styles/App.scss';

interface Props {
  operaciones: OperacionBase[];
  onVerDetalle: (id: number) => void;
  onCrearContrato: (id: number) => void;
  onCambiarEstado: (operacion: OperacionBase, estado: EstadoOperacion) => void;
}

export const TablaOperaciones = ({ operaciones, onVerDetalle, onCrearContrato, onCambiarEstado }: Props) => {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>ID Expediente</th>
            <th>Inmueble Objeto</th>
            <th>Tipo</th>
            <th>Precio Final</th>
            <th>Estado Actual</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {operaciones.map((o) => (
            <tr key={o.id}>
              <td><code>EXP-{o.id}</code></td>
              <td><strong>Ref: {o.inmuebleReferencia}</strong></td>
              <td><span className={`badge-${o.categoria_operacion}`}>{o.tipo}</span></td>
              <td>{o.precioAcordado.toLocaleString('es-ES')} €</td>
              <td>
                <select 
                  value={o.estadoActual} 
                  onChange={(e) => onCambiarEstado(o, e.target.value as EstadoOperacion)}
                >
                  <option value="ABIERTA">⚪ Abierta</option>
                  <option value="EN_TRAMITE">🟡 En Trámite</option>
                  <option value="CERRADA">🟢 Cerrada</option>
                  <option value="CANCELADA">🔴 Cancelada</option>
                </select>
              </td>
              <td className="actions-cell">
                <button className="btn btn-ghost" onClick={() => onVerDetalle(o.id)}>📂 Ver Expediente</button>
                <button className="btn btn-secondary" onClick={() => onCrearContrato(o.id)}>➕ Crear Contrato</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};