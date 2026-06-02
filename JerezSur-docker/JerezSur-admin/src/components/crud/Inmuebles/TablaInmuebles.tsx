// Tabla del catálogo de inmuebles del panel admin con búsqueda y filtros de operación/estado.
import type { Inmueble, EstadoInmueble } from '../../../types/inmueble';
import '../../../styles/App.scss';

interface Props {
  inmuebles: Inmueble[];
  onVerDetalle: (id: number) => void;
  onCambiarEstado: (inmueble: Inmueble, estado: EstadoInmueble) => void;
}

export const TablaInmuebles = ({ inmuebles, onVerDetalle, onCambiarEstado }: Props) => {
  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
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
            <tr key={i.id}>
              <td><code>{i.referencia}</code></td>
              <td><strong>{i.titulo}</strong><br/><small className="text-soft">{i.habitaciones} hab / {i.banos} baños</small></td>
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
                <button className="btn btn-ghost" onClick={() => onVerDetalle(i.id)}>🔍 Ver Ficha Técnica</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};