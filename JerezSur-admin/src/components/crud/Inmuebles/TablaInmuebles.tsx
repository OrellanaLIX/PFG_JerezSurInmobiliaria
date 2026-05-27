import type { Inmueble, EstadoInmueble } from '../../../types/inmueble';

interface Props {
  inmuebles: Inmueble[];
  onVerDetalle: (id: number) => void;
  onCambiarEstado: (inmueble: Inmueble, estado: EstadoInmueble) => void;
}

export const TablaInmuebles = ({ inmuebles, onVerDetalle, onCambiarEstado }: Props) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
          <th>Ref</th>
          <th>Título Propiedad</th>
          <th>Ubicación</th>
          <th>Precio</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {inmuebles.map((i) => (
          <tr key={i.id} style={{ borderBottom: '1px solid #eee', height: '50px' }}>
            <td><code>{i.referencia}</code></td>
            <td><strong>{i.titulo}</strong><br/><small>{i.habitaciones} hab / {i.banos} baños</small></td>
            <td>{i.ciudad} ({i.codigoPostal})</td>
            <td>{i.precio.toLocaleString('es-ES')} €</td>
            <td>{i.operacion}</td>
            <td>
              <select 
                value={i.estado} 
                onChange={(e) => onCambiarEstado(i, e.target.value as EstadoInmueble)}
              >
                <option value="DISPONIBLE">🟢 Disponible</option>
                <option value="RESERVADO">🟡 Reservado</option>
                <option value="VENDIDO">🔴 Vendido</option>
              </select>
            </td>
            <td>
              <button onClick={() => onVerDetalle(i.id)}>🔍 Ver Ficha Técnica</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};