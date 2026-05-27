import type { OperacionBase, EstadoOperacion } from '../../../types/operacion';

interface Props {
  operaciones: OperacionBase[];
  onVerDetalle: (id: number) => void;
  onCambiarEstado: (operacion: OperacionBase, estado: EstadoOperacion) => void;
}

export const TablaOperaciones = ({ operaciones, onVerDetalle, onCambiarEstado }: Props) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
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
          <tr key={o.id} style={{ borderBottom: '1px solid #eee', height: '50px' }}>
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
            <td>
              <button onClick={() => onVerDetalle(o.id)}>📂 Ver Documentos ({o.categoria_operacion})</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};