// Tabla de citas del panel admin: lista todas las citas con sus acciones (aceptar, completar, cancelar).
import type { Cita, EstadoCita } from '../../../types/cita';
import { formatearFechaHora, traducirEstado, citaYaPasada } from '../../../utils/calendario';
import '../../../styles/App.scss';

interface ListaCitasProps {
  citas: Cita[];
  onClickCita: (cita: Cita) => void;
  filtroEstado: EstadoCita | 'TODAS';
  onCambiarFiltro: (estado: EstadoCita | 'TODAS') => void;
}

export const ListaCitas = ({
  citas,
  onClickCita,
  filtroEstado,
  onCambiarFiltro,
}: ListaCitasProps) => {
  const citasFiltradas = citas.filter((c) => {
    if (filtroEstado === 'TODAS') return true;
    return c.estado === filtroEstado;
  });

  // Ordenar por fecha ascendente
  const ordenadas = [...citasFiltradas].sort(
    (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
  );

  return (
    <section>
      <header>
        <h3>Lista de citas ({ordenadas.length})</h3>

        <label>
          Filtrar:
          <select
            value={filtroEstado}
            onChange={(e) => onCambiarFiltro(e.target.value as EstadoCita | 'TODAS')}
          >
            <option value="TODAS">Todas</option>
            <option value="PENDIENTE_ASIGNACION">Pendientes</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
            <option value="NO_PRESENTADO">No presentados</option>
          </select>
        </label>
      </header>

      {ordenadas.length === 0 ? (
        <p>No hay citas con este filtro.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Inmueble</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((cita) => {
              const pasada = citaYaPasada(cita);
              return (
                <tr key={cita.id}>
                  <td>
                    {formatearFechaHora(cita.fechaHora)}
                    {pasada && cita.estado === 'CONFIRMADA' && ' ⏰'}
                  </td>
                  <td>{cita.nombreCliente}</td>
                  <td>{cita.telefonoCliente}</td>
                  <td>{cita.direccionInmueble ?? 'Oficinas'}</td>
                  <td>{traducirEstado(cita.estado)}</td>
                  <td>
                    <button onClick={() => onClickCita(cita)}>Ver</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};